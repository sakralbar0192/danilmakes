import toBoolean from "@/utils/to-boolean";

const formatter = {
  format(original, target, opts = {}) {
    target = target && typeof target === "object" ? target : {};
    for (const prop in original) {
      const v1 = original[prop];
      let v2 = target[prop];

      if (!target.hasOwnProperty(prop)) {
        target[prop] = v1;
        continue;
      }

      if (typeof v1 === "number" || v1 === "0.00") {
        const isInt = v1.toString()
          .indexOf(".") === -1;
        if (isInt) {
          const intv2 = parseInt(v2);
          v2 = intv2 == v2 ? intv2 : 0;
          target[prop] = v2;
        } else {
          const floatv2 = parseFloat(v2);
          v2 = floatv2 == v2 ? floatv2 : 0;
          target[prop] = v2;
        }
        continue;
      } // number validated
      if (typeof v1 === "string") {
        try {
          v2 = v2.toString();
        } catch (e) {
          v2 = "";
        }
        target[prop] = v2;
        continue;
      } // string validated
      if (typeof v1 === "object") {
        if (v1) {
          if (Array.isArray(v1)) {
            v2 = Array.isArray(v2) ? v2 : [];
          } else {
            if (typeof v2 !== "object" || !v2 || Array.isArray(v2)) {
              v2 = JSON.parse(JSON.stringify(v1));
            }
            if (opts.deep) {
              v2 = this.format(v1, v2);
            }
          }
        } else {
          v2 = null;
        }
        target[prop] = v2;
        continue;
      } // object and null validated
      if (typeof v1 === "boolean") {
        v2 = toBoolean(v2);
        target[prop] = v2;
      } // boolean validated
    }
    if (opts.purify) {
      this.purifyObject({
        object: target,
        except: Object.keys(original),
      });
    }
    return target;
  },
  formatNumber(value) {
    return parseFloat(value) || 0;
  },
  formatString(value) {
    return String(value) || "";
  },
  formatBoolean(value) {
    return toBoolean(value) || false;
  },
  formatObject(pattern, value) {
    // todo check other branches
    const result = {};
    if (Object.keys(pattern)?.length === 0) {
      return value;
    }
    if (typeof value === "undefined" || value === null) {
      return pattern;
    }
    for (const prop in pattern) {
      result[prop] = this.formatField(pattern[prop], value[prop]);
    }
    return result;
  },
  formatField(pattern, target, nullable = false) {
    if (nullable && target == null) return null;
    if (typeof target === "undefined" || target === null) {
      return pattern;
    }

    if (typeof pattern === "number") {
      return this.formatNumber(target);
    } if (typeof pattern === "string") {
      return this.formatString(target);
    } if (typeof pattern === "boolean") {
      return this.formatBoolean(target);
    } if (typeof pattern === "object") {
      if (Array.isArray(pattern)) {
        if (pattern.length > 0 && Array.isArray(target)) {
          return target.map((item, index) => this.formatField(pattern[index] || pattern[0], item));
        } if (Array.isArray(target)) {
          return target;
        }
        return [];
      }
      return this.formatObject(pattern, target);
    } if (typeof pattern === "function") {
      return target;
    }
    return pattern;
  },
  toFormat(pattern, target) {
    if (typeof target !== "object") return {};
    const result = JSON.parse(JSON.stringify(pattern));
    for (const prop in target) {
      result[prop] = this.formatField(pattern[prop], target[prop]);
    }

    return result;
  },
  purifyObject(opts) {
    for (const prop in opts.object) {
      if (opts.except.indexOf(prop) !== -1) {
        continue;
      }
      delete opts.object[prop];
    }
  },
  buildArray(obj, opts) {
    const arr = [];
    for (const prop in obj) {
      if (opts.id_key) {
        obj[prop][opts.id_key] = prop;
      }
      arr.push(obj[prop]);
    }
    return arr;
  },
  formatArray(arr, proto, opts = {}) {
    if (!Array.isArray(arr)) {
      return [];
    }
    for (let i = 0; i < arr.length; i++) {
      arr[i] = formatter.format(proto, arr[i], opts);
    }
    return arr;
  },
  buildMap(opts) {
    const a = {};
    const key = opts.id_key ? opts.id_key : "id";
    const keysObj = opts.keys && opts.keys.length;
    for (let i = 0; i < opts.array.length; i++) {
      const item = opts.array[i];
      if (keysObj) {
        const keysItem = {};
        opts.keys.forEach((k) => {
          keysItem[k] = item[k];
        });
        a[item[key]] = keysItem;
      } else {
        a[item[key]] = item;
      }
    }
    return a;
  },
};

window.formatter = formatter;

export default formatter;
