class BffHttpError extends Error {
  constructor(status, message, opts) {
    super(message);
    this.name = "BffHttpError";
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
    this.rawBody = opts?.rawBody ?? "";
  }
}
function isBffHttpError(e) {
  return e instanceof BffHttpError;
}
function parseBffErrorBody(text) {
  const t = text.trim();
  if (!t) {
    return null;
  }
  try {
    const j = JSON.parse(t);
    if (!j || typeof j !== "object") {
      return null;
    }
    const o = j;
    if (typeof o.code !== "string" || typeof o.message !== "string") {
      return null;
    }
    let details;
    if (o.details !== void 0 && o.details !== null && typeof o.details === "object") {
      details = o.details;
    }
    return { code: o.code, message: o.message, details };
  } catch {
    return null;
  }
}
async function bffErrorFromResponse(res) {
  let raw = "";
  try {
    raw = await res.text();
  } catch {
    raw = "";
  }
  const parsed = parseBffErrorBody(raw);
  if (parsed) {
    return new BffHttpError(res.status, parsed.message, {
      code: parsed.code,
      details: parsed.details,
      rawBody: raw
    });
  }
  return new BffHttpError(res.status, raw || res.statusText, { rawBody: raw });
}
function bffErrorMessage(e) {
  if (isBffHttpError(e)) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "Ошибка";
}

const DEFAULT_BASE = "http://localhost:8080/bff/v1";
function normalizeBase(base) {
  return base.replace(/\/$/, "");
}
function mergeHeaders(init) {
  const h = new Headers(init?.headers);
  if (!h.has("X-Correlation-Id") && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    h.set("X-Correlation-Id", crypto.randomUUID());
  }
  const body = init?.body;
  if (body !== void 0 && body !== null && !(body instanceof FormData) && !(body instanceof Blob) && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  return h;
}
function resolveBffBaseUrl(envValue) {
  {
    return normalizeBase(envValue);
  }
}
function createBffClient(baseUrl = DEFAULT_BASE) {
  const root = normalizeBase(baseUrl);
  async function bffFetch(path, init) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${root}${p}`, {
      ...init,
      credentials: "include",
      headers: mergeHeaders(init)
    });
  }
  return {
    fetch: bffFetch,
    async json(path, init) {
      const res = await bffFetch(path, init);
      if (!res.ok) {
        throw await bffErrorFromResponse(res);
      }
      if (res.status === 204) {
        return void 0;
      }
      const ct = res.headers.get("Content-Type");
      if (ct?.includes("application/json")) {
        return await res.json();
      }
      return void 0;
    }
  };
}

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

export { _export_sfc as _, bffErrorFromResponse as a, bffErrorMessage as b, createBffClient as c, resolveBffBaseUrl as r };
