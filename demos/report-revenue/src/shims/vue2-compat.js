import { reactive } from "vue";

export function set(target, key, value) {
  target[key] = value;
  return value;
}

export function del(target, key) {
  delete target[key];
}

function observable(obj) {
  return reactive(obj);
}

export default { set, delete: del, observable };
