import menuMeta from "@/components/bnovo-header/assets/bnovo-navigation.js";
import i18n from "@/plugins/i18n.js";

const encodeReserveRE = /[!'()*]/g;
const encodeReserveReplacer = function (c) {
  return `%${c.charCodeAt(0)
    .toString(16)}`;
};
const commaRE = /%2C/g;
const trailingSlashRE = /\/?$/;

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
const encode = function (str) {
  return encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ","); //
};

function decode(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return str;
  }
}

function parseQuery(query) {
  const res = {};

  query = query.trim()
    .replace(/^(\?|#|&)/, "");

  if (!query) {
    return res;
  }

  query.split("&")
    .forEach((param) => {
      const parts = param.replace(/\+/g, " ")
        .split("=");
      const key = decode(parts.shift());
      const val = parts.length > 0 ? decode(parts.join("=")) : null;

      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });

  return res;
}

function stringifyQuery(obj) {
  const res = obj
    ? Object.keys(obj)
      .map((key) => {
        const val = obj[key];

        if (val === undefined) {
          return "";
        }

        if (val === null) {
          return encode(key);
        }

        if (Array.isArray(val)) {
          const result = [];
          val.forEach((val2) => {
            if (val2 === undefined) {
              return;
            }
            if (val2 === null) {
              result.push(`${encode(key)}[]`);
            } else {
              result.push(`${encode(key)}[]=${encode(val2)}`);
            }
          });
          return result.join("&");
        }

        return `${encode(key)}=${encode(val)}`;
      })
      .filter((x) => {
        return x.length > 0;
      })
      .join("&")
    : null;
  return res ? (`?${res}`) : "";
}

function removeTrailingSlash(s) {
  const indexOfSD = s.indexOf("/?");
  let url = s;
  if (indexOfSD !== -1) {
    url = s.replace("/?", "?");
  }
  return url.replace(/\/$/, "");
}

function prepareFullPath(p) {
  if (p.indexOf("http") !== 0) {
    let p2 = "/";
    if (p.indexOf("/") === 0) {
      p2 += p.substr(1, p.length - 1);
    } else {
      p2 += p;
    }
    p = `${window.location.protocol}//${window.location.hostname}${p2}`;
  }
  p = removeTrailingSlash(p);
  return p;
}

function isObjectEqual(a, b) {
  if (a === undefined) a = {};
  if (b === undefined) b = {};

  // handle null value #1566
  if (!a || !b) {
    return a === b;
  }
  const aKeys = Object.keys(a)
    .sort();
  const bKeys = Object.keys(b)
    .sort();
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key, i) => {
    const aVal = a[key];
    const bKey = bKeys[i];
    if (bKey !== key) {
      return false;
    }
    const bVal = b[key];
    // query values can be null and undefined
    if (aVal == null || bVal == null) {
      return aVal === bVal;
    }
    // check nested equality
    if (typeof aVal === "object" && typeof bVal === "object") {
      return isObjectEqual(aVal, bVal);
    }
    return String(aVal) === String(bVal);
  });
}

function isSameFullPath(a, b) {
  a = prepareFullPath(a);
  b = prepareFullPath(b);
  if (a === b) {
    return true;
  }
  const ar = new URL(a);
  const br = new URL(b);
  if (ar.pathname !== br.pathname) {
    return false;
  }
  ar.qs = parseQuery(ar.search);
  br.qs = parseQuery(br.search);
  return isObjectEqual(ar.qs, br.qs);
}

function generateBreadCrumbs(crumbs) {
  const breadCrumbs = [
    {
      text: i18n.t("Главная"),
      disabled: false,
      href: "/",
      to: null,
    },
  ];

  crumbs.forEach((crumb) => {
    if (menuMeta.items[crumb]) {
      const crumbObject = {
        text: menuMeta.items[crumb].shortTitle || menuMeta.items[crumb].title,
        disabled: false,
        icon: "",
      };
      if (menuMeta.maps.spa.includes(crumb)) {
        crumbObject.to = menuMeta.items[crumb].link;
      } else {
        crumbObject.href = menuMeta.items[crumb].link;
      }
      breadCrumbs.push(crumbObject);
    }
  });

  return breadCrumbs;
}

function buildLink(opts) {
  let newLink = opts.link;
  if (typeof opts.query === "object") {
    newLink += stringifyQuery(opts.query);
  }
  return removeTrailingSlash(newLink);
}

function checkValidityWebsite(site = "") {
  let isValid = false;
  try {
    isValid = Boolean(new URL(site.trim()));
  } catch (error) {
    isValid = false;
  }
  return isValid || /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*$/.test(site);
};

export default {
  isObjectEqual,
  stringifyQuery,
  parseQuery,
  trailingSlashRE,
  removeTrailingSlash,
  isSameFullPath,
  prepareFullPath,
  generateBreadCrumbs,
  buildLink,
  checkValidityWebsite,
};
