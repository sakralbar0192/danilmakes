if (typeof window !== "undefined" && window.location.pathname.endsWith("/index.html")) {
  const normalized = window.location.pathname.replace(/index\.html$/, "");
  const target = normalized.endsWith("/") ? normalized : `${normalized}/`;
  window.history.replaceState(null, "", target + window.location.search + window.location.hash);
}
