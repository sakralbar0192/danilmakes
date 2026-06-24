function isDomEventHandler(key, value) {
  if (typeof value !== "function" || !key.startsWith("on") || key.length < 4) {
    return false;
  }
  const name = key.slice(2);
  if (!/^[A-Z]/.test(name)) {
    return false;
  }
  return !/^(Aria|Data|Ref)/.test(name);
}

export function splitActivatorProps(props = {}) {
  const on = {};
  const attrs = {};
  Object.entries(props).forEach(([key, value]) => {
    if (isDomEventHandler(key, value)) {
      const eventName = key.slice(2);
      on[eventName.charAt(0).toLowerCase() + eventName.slice(1)] = value;
    } else {
      attrs[key] = value;
    }
  });
  return { on, attrs, props };
}
