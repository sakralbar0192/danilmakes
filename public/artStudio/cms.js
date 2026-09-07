/**
 * Hydrate art-studio pages from Directus (same-origin /cms).
 * Falls back to static HTML if CMS is unreachable.
 */
(function () {
  const cfg = window.ART_STUDIO_CMS || {};
  const BASE = (cfg.baseUrl || "/cms").replace(/\/$/, "");
  const enabled = cfg.enabled !== false;
  const assetBase =
    cfg.assetBase != null
      ? cfg.assetBase
      : document.body?.dataset?.assetRoot != null
        ? document.body.dataset.assetRoot
        : "";

  function asset(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
    return `${assetBase}${path}`;
  }

  /** Directus file uuid | { id } → /cms/assets/{id} ; else fallback path */
  function mediaUrl(fileOrId, pathFallback) {
    const id =
      fileOrId && typeof fileOrId === "object"
        ? fileOrId.id
        : fileOrId;
    if (id) return `${BASE}/assets/${id}`;
    return asset(pathFallback);
  }

  function cloneWorksRail() {
    const track = document.querySelector("[data-cms='works-rail-track'], .works-rail-track");
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (track.querySelector("[data-clone='true']")) return;
    ;[...track.children].forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.dataset.clone = "true";
      clone.querySelectorAll("img").forEach((img) => (img.alt = ""));
      track.appendChild(clone);
    });
  }

  async function getJson(path) {
    const res = await fetch(`${BASE}${path}`, {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`${path} ${res.status}`);
    return res.json();
  }

  function setText(sel, value) {
    if (value == null || value === "") return;
    document.querySelectorAll(sel).forEach((el) => {
      el.textContent = value;
    });
  }

  function setHtml(sel, value) {
    if (value == null || value === "") return;
    document.querySelectorAll(sel).forEach((el) => {
      el.innerHTML = value;
    });
  }

  function parseJsonField(value, fallback) {
    if (value == null) return fallback;
    if (typeof value === "object") return value;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    }
    return fallback;
  }

  function setImg(sel, fileOrId, pathFallback, alt) {
    const src = mediaUrl(fileOrId, pathFallback);
    if (!src) return;
    document.querySelectorAll(sel).forEach((el) => {
      el.src = src;
      if (alt) el.alt = alt;
    });
  }

  function applySettings(s) {
    if (!s) return;
    setImg("[data-cms='logo']", s.logo);
  }

  function applyContacts(c) {
    if (!c) return;
    setText("[data-cms='contact-heading']", c.heading);

    const phoneDisplay = c.phone || "";
    const phoneTel = phoneDisplay.replace(/[^\d+]/g, "");
    const phoneHref = phoneTel ? `tel:${phoneTel}` : null;

    document.querySelectorAll("[data-cms='phone-text']").forEach((el) => {
      if (phoneDisplay) el.textContent = phoneDisplay;
    });
    document.querySelectorAll("[data-cms='phone-link']").forEach((el) => {
      if (phoneHref) el.setAttribute("href", phoneHref);
      if (phoneDisplay && el.dataset.cmsLabel !== "keep") {
        el.textContent = phoneDisplay;
      }
    });

    document.querySelectorAll("[data-cms='vk-link']").forEach((el) => {
      if (c.vk_url) el.setAttribute("href", c.vk_url);
      if (c.vk_label && el.dataset.cmsLabel !== "keep") el.textContent = c.vk_label;
    });

    const contactBody = document.querySelector("[data-cms='contact-body']");
    if (contactBody && c.address) {
      contactBody.innerHTML = [
        `<strong>Адрес:</strong> ${escapeHtml(c.address)}<br />`,
        c.address_note ? `<span class="form-note">${escapeHtml(c.address_note)}</span><br /><br />` : "<br />",
        `<strong>Часы:</strong> ${escapeHtml(c.hours || "")}<br />`,
        c.hours_note ? `<span class="form-note">${escapeHtml(c.hours_note)}</span>` : "",
      ].join("");
    }

    const contact = document.getElementById("contact");
    if (contact && c.has_reviews != null) {
      const hasReviews =
        c.has_reviews === true ||
        c.has_reviews === 1 ||
        c.has_reviews === "1" ||
        c.has_reviews === "true";
      contact.dataset.hasReviews = hasReviews ? "true" : "false";
      if (typeof window.__artStudioInitContactTabs === "function") {
        window.__artStudioInitContactTabs();
      } else if (hasReviews && typeof window.__artStudioMountReviews === "function") {
        window.__artStudioMountReviews();
      }
    }

    document.querySelectorAll("[data-cms='reviews-link']").forEach((el) => {
      if (c.yandex_reviews_url) el.setAttribute("href", c.yandex_reviews_url);
    });
  }

  function applyHero(h) {
    if (!h) return;
    setText("[data-cms='hero-eyebrow']", h.eyebrow);
    setText("[data-cms='hero-lead']", h.lead);
    setImg("[data-cms='hero-title-image']", h.title_image, null);
    setImg("[data-cms='hero-image-1']", h.image_1);
    setImg("[data-cms='hero-image-2']", h.image_2);
    setImg("[data-cms='hero-image-3']", h.image_3);
  }

  function applyScheduleSection(s) {
    if (!s) return;
    setText("[data-cms='schedule-eyebrow']", s.eyebrow);
    setText("[data-cms='schedule-title']", s.title);
    setText("[data-cms='schedule-lead']", s.lead);
    const chips = parseJsonField(s.chips, []);
    if (Array.isArray(chips) && chips.length) applyDirectionChips(chips);
    const groups = Array.isArray(s.groups)
      ? s.groups
      : parseJsonField(s.groups, []);
    if (Array.isArray(groups) && groups.length) applySchedule(groups);
  }

  function applyPricing(p) {
    if (!p) return;
    setText("[data-cms='prices-eyebrow']", p.eyebrow);
    setText("[data-cms='prices-title']", p.title);
    const items = parseJsonField(p.items, []);
    if (Array.isArray(items) && items.length) applyPrices(items);
  }

  function applyTrial(t) {
    if (!t) return;
    setText("[data-cms='trial-eyebrow']", t.eyebrow);
    setText("[data-cms='trial-title']", t.title);
    setText("[data-cms='trial-lead']", t.lead);
  }

  function applyStudio(s) {
    if (!s) return;
    setText("[data-cms='studio-eyebrow']", s.eyebrow);
    setText("[data-cms='studio-title']", s.title);
    setText("[data-cms='studio-lead']", s.lead);
    setImg("[data-cms='atmosphere-photo-main']", s.photo_main, null, s.photo_main_alt);
    setImg("[data-cms='atmosphere-photo-side']", s.photo_side, null, s.photo_side_alt);
    setText("[data-cms='teacher-name']", s.teacher_name);
    setText("[data-cms='teacher-bio']", s.teacher_bio);
    const img = document.querySelector("[data-cms='teacher-photo']");
    if (img) {
      const src = mediaUrl(s.teacher_photo, s.teacher_photo_path);
      if (src) img.src = src;
      if (s.teacher_photo_alt) img.alt = s.teacher_photo_alt;
    }
  }

  function applyDirectionChips(chips) {
    const chipsEl = document.querySelector("[data-cms='direction-chips']");
    if (!chipsEl || !chips?.length) return;
    chipsEl.innerHTML = chips
      .filter((c) => c && typeof c === "object" && c.label)
      .map((c) => {
        const key = c.style_key ? ` is-${escapeHtml(c.style_key)}` : "";
        return `<li class="direction-chip${key}">${escapeHtml(c.label)}</li>`;
      })
      .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyPrices(items) {
    const board = document.querySelector("[data-cms='price-board']");
    if (!board || !items?.length) return;
    const published = items
      .filter((i) => i && typeof i === "object" && (!i.status || i.status === "published"))
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    if (!published.length) return;
    const featured = published.find((i) => i.is_featured) || published[0];
    const rest = published.filter((i) => i !== featured);

    board.innerHTML = `
      <div class="price-featured">
        ${featured.eyebrow ? `<p class="eyebrow">${escapeHtml(featured.eyebrow)}</p>` : ""}
        <h3>${escapeHtml(featured.title)}</h3>
        <p class="price">${escapeHtml(featured.price)}</p>
        ${featured.description ? `<p>${escapeHtml(featured.description)}</p>` : ""}
      </div>
      <div class="price-list">
        ${rest
          .map(
            (i) => `<div><span>${escapeHtml(i.title)}</span><strong>${escapeHtml(i.price)}</strong></div>`,
          )
          .join("")}
      </div>`;
  }

  function applySchedule(items) {
    const root = document.querySelector("[data-cms='age-schedule']");
    if (!root || !items?.length) return;
    const published = items
      .filter((i) => i && typeof i === "object" && (!i.status || i.status === "published"))
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    if (!published.length) return;

    root.innerHTML = published
      .map((g) => {
        const slots = (() => {
          let s = g.slots;
          if (typeof s === "string") {
            try {
              s = JSON.parse(s);
            } catch {
              s = [];
            }
          }
          return Array.isArray(s) ? s : [];
        })();
        return `<article class="age-card">
          <div class="age-card-photos">
            <img src="${escapeHtml(mediaUrl(g.photo_1, g.photo_1_path))}" alt="${escapeHtml(g.photo_1_alt || "")}" />
            <img src="${escapeHtml(mediaUrl(g.photo_2, g.photo_2_path))}" alt="${escapeHtml(g.photo_2_alt || "")}" />
          </div>
          <div class="age-card-body">
            ${g.eyebrow ? `<p class="eyebrow">${escapeHtml(g.eyebrow)}</p>` : ""}
            <h3>${escapeHtml(g.title)}</h3>
            ${g.description ? `<p>${escapeHtml(g.description)}</p>` : ""}
            <ul class="age-slots">
              ${slots
                .map(
                  (s) =>
                    `<li><span>${escapeHtml(s.days || "")}</span><strong>${escapeHtml(s.time || "")}</strong></li>`,
                )
                .join("")}
            </ul>
          </div>
        </article>`;
      })
      .join("");
  }

  function applyGalleryBlock(g) {
    if (!g) return;
    setText("[data-cms='works-eyebrow']", g.eyebrow);
    setText("[data-cms='works-title']", g.title);
    setText("[data-cms='gallery-page-eyebrow']", g.page_eyebrow || g.eyebrow);
    setText("[data-cms='gallery-page-title']", g.page_title);
    const leadEl = document.querySelector("[data-cms='gallery-page-lead']");
    if (leadEl && g.page_lead) leadEl.innerHTML = g.page_lead;
    const items = parseJsonField(g.items, []);
    if (!Array.isArray(items) || !items.length) return;
    applyWorksRail(items);
    applyGallery(items);
  }

  function applyWorksRail(items) {
    const track = document.querySelector("[data-cms='works-rail-track']");
    if (!track || !items?.length) return;
    const rail = items
      .filter(
        (i) =>
          i &&
          typeof i === "object" &&
          (!i.status || i.status === "published") &&
          i.show_in_rail,
      )
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    if (!rail.length) return;

    track.innerHTML = rail
      .map(
        (i) => `<figure class="work-tile">
          <img src="${escapeHtml(mediaUrl(i.image, i.image_path))}" alt="${escapeHtml(i.caption || "")}" />
          <figcaption>${escapeHtml(i.caption || "")}</figcaption>
        </figure>`,
      )
      .join("");

    cloneWorksRail();
  }

  function applyGallery(items) {
    const root = document.querySelector("[data-cms='gallery-masonry']");
    if (!root || !items?.length) return;
    const published = items
      .filter((i) => i && typeof i === "object" && (!i.status || i.status === "published"))
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));

    root.innerHTML = published
      .map((i) => {
        const tags = i.tags || "";
        const tall = i.tall ? " tall" : "";
        return `<figure class="gallery-item${tall}" data-tags="${escapeHtml(tags)}">
          <div class="work-tile"><img src="${escapeHtml(mediaUrl(i.image, i.image_path))}" alt="${escapeHtml(i.caption || "")}" /></div>
          <figcaption>${escapeHtml(i.caption || "")}</figcaption>
        </figure>`;
      })
      .join("");

    // re-bind filters if present
    const chips = document.querySelectorAll(".chip[data-filter]");
    const figures = () => document.querySelectorAll(".gallery-item");
    chips.forEach((chip) => {
      chip.onclick = () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        const filter = chip.dataset.filter;
        figures().forEach((item) => {
          const tags = (item.dataset.tags || "").split(/\s+/);
          item.hidden = !(filter === "all" || tags.includes(filter));
        });
      };
    });
  }

  async function boot() {
    if (!enabled) return;
    document.documentElement.dataset.cms = "loading";
    try {
      const [
        settings,
        contacts,
        hero,
        pricing,
        scheduleSection,
        gallery,
        trial,
        studio,
      ] = await Promise.all([
          getJson("/items/site_settings?fields=*,logo.id")
            .then((j) => j.data)
            .catch(() => null),
          getJson("/items/contacts").then((j) => j.data).catch(() => null),
          getJson(
            "/items/hero?fields=*,title_image.id,image_1.id,image_2.id,image_3.id",
          )
            .then((j) => j.data)
            .catch(() => null),
          getJson("/items/pricing").then((j) => j.data).catch(() => null),
          getJson(
            "/items/schedule_section?fields=*,groups.*,groups.photo_1.id,groups.photo_2.id",
          )
            .then((j) => j.data)
            .catch(() => null),
          getJson("/items/gallery").then((j) => j.data).catch(() => null),
          getJson("/items/trial").then((j) => j.data).catch(() => null),
          getJson(
            "/items/atmosphere?fields=*,photo_main.id,photo_side.id,teacher_photo.id",
          )
            .then((j) => j.data)
            .catch(() => null),
        ]);

      applySettings(settings);
      applyContacts(contacts);
      applyHero(hero);
      applyGalleryBlock(gallery);
      applyScheduleSection(scheduleSection);
      applyPricing(pricing);
      applyTrial(trial);
      applyStudio(studio);
      if (!gallery?.items?.length) cloneWorksRail();
      document.documentElement.dataset.cms = "ready";
    } catch (err) {
      console.warn("[art-studio cms]", err);
      document.documentElement.dataset.cms = "fallback";
      cloneWorksRail();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
