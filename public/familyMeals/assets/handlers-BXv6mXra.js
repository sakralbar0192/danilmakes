import { e as getCleanUrl, i as invariant, d as devUtils, s as statuses_default, c as cookieStore, R as RequestHandler, t as toPublicUrl, H as HttpResponse } from './cookieStore-D-ixA_Tn.js';

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse$1(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    var isSafe = function (value) {
        for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
            var char = delimiter_1[_i];
            if (value.indexOf(char) > -1)
                return true;
        }
        return false;
    };
    var safePattern = function (prefix) {
        var prev = result[result.length - 1];
        var prevText = prefix || (prev && typeof prev === "string" ? prev : "");
        if (prev && !prevText) {
            throw new TypeError("Must have text between two parameters, missing text after \"".concat(prev.name, "\""));
        }
        if (!prevText || isSafe(prevText))
            return "[^".concat(escapeString(delimiter), "]+?");
        return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || safePattern(prefix),
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Create path match function from `path-to-regexp` spec.
 */
function match(str, options) {
    var keys = [];
    var re = pathToRegexp(str, keys, options);
    return regexpToFunction(re, keys, options);
}
/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction(re, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.decode, decode = _a === void 0 ? function (x) { return x; } : _a;
    return function (pathname) {
        var m = re.exec(pathname);
        if (!m)
            return false;
        var path = m[0], index = m.index;
        var params = Object.create(null);
        var _loop_1 = function (i) {
            if (m[i] === undefined)
                return "continue";
            var key = keys[i - 1];
            if (key.modifier === "*" || key.modifier === "+") {
                params[key.name] = m[i].split(key.prefix + key.suffix).map(function (value) {
                    return decode(value, key);
                });
            }
            else {
                params[key.name] = decode(m[i], key);
            }
        };
        for (var i = 1; i < m.length; i++) {
            _loop_1(i);
        }
        return { path: path, index: index, params: params };
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
    if (!keys)
        return path;
    var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    var index = 0;
    var execResult = groupsRegex.exec(path.source);
    while (execResult) {
        keys.push({
            // Use parenthesized substring match if available, index otherwise
            name: execResult[1] || index++,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: "",
        });
        execResult = groupsRegex.exec(path.source);
    }
    return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
    return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse$1(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
    var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
    var delimiterRe = "[".concat(escapeString(delimiter), "]");
    var route = start ? "^" : "";
    // Iterate over the tokens and create our regexp string.
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (typeof token === "string") {
            route += escapeString(encode(token));
        }
        else {
            var prefix = escapeString(encode(token.prefix));
            var suffix = escapeString(encode(token.suffix));
            if (token.pattern) {
                if (keys)
                    keys.push(token);
                if (prefix || suffix) {
                    if (token.modifier === "+" || token.modifier === "*") {
                        var mod = token.modifier === "*" ? "?" : "";
                        route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
                    }
                    else {
                        route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
                    }
                }
                else {
                    if (token.modifier === "+" || token.modifier === "*") {
                        throw new TypeError("Can not repeat \"".concat(token.name, "\" without a prefix and suffix"));
                    }
                    route += "(".concat(token.pattern, ")").concat(token.modifier);
                }
            }
            else {
                route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
            }
        }
    }
    if (end) {
        if (!strict)
            route += "".concat(delimiterRe, "?");
        route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
    }
    else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === "string"
            ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
            : endToken === undefined;
        if (!strict) {
            route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
        }
        if (!isEndDelimited) {
            route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
        }
    }
    return new RegExp(route, flags(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp)
        return regexpToRegexp(path, keys);
    if (Array.isArray(path))
        return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
}

const REDUNDANT_CHARACTERS_EXP = /[?|#].*$/g;
function cleanUrl(path) {
  if (path.endsWith("?")) {
    return path;
  }
  return path.replace(REDUNDANT_CHARACTERS_EXP, "");
}

function isAbsoluteUrl(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

function getAbsoluteUrl(path, baseUrl) {
  if (isAbsoluteUrl(path)) {
    return path;
  }
  if (path.startsWith("*")) {
    return path;
  }
  const origin = baseUrl || typeof location !== "undefined" && location.href;
  return origin ? (
    // Encode and decode the path to preserve escaped characters.
    decodeURI(new URL(encodeURI(path), origin).href)
  ) : path;
}

function normalizePath(path, baseUrl) {
  if (path instanceof RegExp) {
    return path;
  }
  const maybeAbsoluteUrl = getAbsoluteUrl(path, baseUrl);
  return cleanUrl(maybeAbsoluteUrl);
}

function coercePath(path) {
  return path.replace(
    /([:a-zA-Z_-]*)(\*{1,2})+/g,
    (_, parameterName, wildcard) => {
      const expression = "(.*)";
      if (!parameterName) {
        return expression;
      }
      return parameterName.startsWith(":") ? `${parameterName}${wildcard}` : `${parameterName}${expression}`;
    }
  ).replace(/([^/])(:)(?=(?:\d+|\(\.\*\))(?=\/|$))/, "$1\\$2").replace(/^([^/]+)(:)(?=\/\/)/, "$1\\$2");
}
function matchRequestUrl(url, path, baseUrl) {
  const normalizedPath = normalizePath(path, baseUrl);
  const cleanPath = typeof normalizedPath === "string" ? coercePath(normalizedPath) : normalizedPath;
  const cleanUrl = getCleanUrl(url);
  const result = match(cleanPath, { decode: decodeURIComponent })(cleanUrl);
  const params = result && result.params || {};
  return {
    matches: result !== false,
    params
  };
}

function getTimestamp(options) {
  const now = /* @__PURE__ */ new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  return timestamp;
}

function checkGlobals() {
  invariant(
    typeof URL !== "undefined",
    devUtils.formatMessage(
      `Global "URL" class is not defined. This likely means that you're running MSW in an environment that doesn't support all Node.js standard API (e.g. React Native). If that's the case, please use an appropriate polyfill for the "URL" class, like "react-native-url-polyfill".`
    )
  );
}

function isStringEqual(actual, expected) {
  return actual.toLowerCase() === expected.toLowerCase();
}

function getStatusCodeColor(status) {
  if (status < 300) {
    return "#69AB32" /* Success */;
  }
  if (status < 400) {
    return "#F0BB4B" /* Warning */;
  }
  return "#E95F5D" /* Danger */;
}

async function serializeRequest(request) {
  const requestClone = request.clone();
  const requestText = await requestClone.text();
  return {
    url: new URL(request.url),
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: requestText
  };
}

const { message } = statuses_default;
async function serializeResponse(response) {
  const responseClone = response.clone();
  const responseText = await responseClone.text();
  const responseStatus = responseClone.status || 200;
  const responseStatusText = responseClone.statusText || message[responseStatus] || "OK";
  return {
    status: responseStatus,
    statusText: responseStatusText,
    headers: Object.fromEntries(responseClone.headers.entries()),
    body: responseText
  };
}

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  __defProp(target, "default", { value: mod, enumerable: true }) ,
  mod
));

// node_modules/.pnpm/cookie@1.1.1/node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/cookie@1.1.1/node_modules/cookie/dist/index.js"(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.parseCookie = parseCookie;
    exports$1.parse = parseCookie;
    exports$1.stringifyCookie = stringifyCookie;
    exports$1.stringifySetCookie = stringifySetCookie;
    exports$1.serialize = stringifySetCookie;
    exports$1.parseSetCookie = parseSetCookie;
    exports$1.stringifySetCookie = stringifySetCookie;
    exports$1.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie2, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie2)) {
        const val = cookie2[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie2 = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie2.name)) {
        throw new TypeError(`argument name is invalid: ${cookie2.name}`);
      }
      const value = cookie2.value ? enc(cookie2.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie2.value}`);
      }
      let str = cookie2.name + "=" + value;
      if (cookie2.maxAge !== void 0) {
        if (!Number.isInteger(cookie2.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie2.maxAge}`);
        }
        str += "; Max-Age=" + cookie2.maxAge;
      }
      if (cookie2.domain) {
        if (!domainValueRegExp.test(cookie2.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie2.domain}`);
        }
        str += "; Domain=" + cookie2.domain;
      }
      if (cookie2.path) {
        if (!pathValueRegExp.test(cookie2.path)) {
          throw new TypeError(`option path is invalid: ${cookie2.path}`);
        }
        str += "; Path=" + cookie2.path;
      }
      if (cookie2.expires) {
        if (!isDate(cookie2.expires) || !Number.isFinite(cookie2.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie2.expires}`);
        }
        str += "; Expires=" + cookie2.expires.toUTCString();
      }
      if (cookie2.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie2.secure) {
        str += "; Secure";
      }
      if (cookie2.partitioned) {
        str += "; Partitioned";
      }
      if (cookie2.priority) {
        const priority = typeof cookie2.priority === "string" ? cookie2.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie2.priority}`);
        }
      }
      if (cookie2.sameSite) {
        const sameSite = typeof cookie2.sameSite === "string" ? cookie2.sameSite.toLowerCase() : cookie2.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie2.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// src/shims/cookie.ts
var allCookie = __toESM(require_dist());
var cookie = allCookie.default || allCookie;
var parse = cookie.parse;
var serialize = cookie.serialize;

function parseCookies(input) {
  const parsedCookies = parse(input);
  const cookies = {};
  for (const cookieName in parsedCookies) {
    if (typeof parsedCookies[cookieName] !== "undefined") {
      cookies[cookieName] = parsedCookies[cookieName];
    }
  }
  return cookies;
}
function getAllDocumentCookies() {
  return parseCookies(document.cookie);
}
function getDocumentCookies(request) {
  if (typeof document === "undefined" || typeof location === "undefined") {
    return {};
  }
  switch (request.credentials) {
    case "same-origin": {
      const requestUrl = new URL(request.url);
      return location.origin === requestUrl.origin ? getAllDocumentCookies() : {};
    }
    case "include": {
      return getAllDocumentCookies();
    }
    default: {
      return {};
    }
  }
}
function getAllRequestCookies(request) {
  const requestCookieHeader = request.headers.get("cookie");
  const cookiesFromHeaders = requestCookieHeader ? parseCookies(requestCookieHeader) : {};
  const cookiesFromDocument = getDocumentCookies(request);
  for (const name in cookiesFromDocument) {
    request.headers.append(
      "cookie",
      serialize(name, cookiesFromDocument[name])
    );
  }
  const cookiesFromStore = cookieStore.getCookies(request.url);
  const storedCookiesObject = Object.fromEntries(
    cookiesFromStore.map((cookie) => [cookie.key, cookie.value])
  );
  for (const cookie of cookiesFromStore) {
    request.headers.append("cookie", cookie.toString());
  }
  return {
    ...cookiesFromDocument,
    ...storedCookiesObject,
    ...cookiesFromHeaders
  };
}

var HttpMethods = /* @__PURE__ */ ((HttpMethods2) => {
  HttpMethods2["HEAD"] = "HEAD";
  HttpMethods2["GET"] = "GET";
  HttpMethods2["POST"] = "POST";
  HttpMethods2["PUT"] = "PUT";
  HttpMethods2["PATCH"] = "PATCH";
  HttpMethods2["OPTIONS"] = "OPTIONS";
  HttpMethods2["DELETE"] = "DELETE";
  return HttpMethods2;
})(HttpMethods || {});
class HttpHandler extends RequestHandler {
  constructor(method, predicate, resolver, options) {
    const displayPath = typeof predicate === "function" ? "[custom predicate]" : predicate;
    super({
      info: {
        header: `${method}${displayPath ? ` ${displayPath}` : ""}`,
        path: predicate,
        method
      },
      resolver,
      options
    });
    this.checkRedundantQueryParameters();
  }
  checkRedundantQueryParameters() {
    const { method, path } = this.info;
    if (!path || path instanceof RegExp || typeof path === "function") {
      return;
    }
    const url = cleanUrl(path);
    if (url === path) {
      return;
    }
    devUtils.warn(
      `Found a redundant usage of query parameters in the request handler URL for "${method} ${path}". Please match against a path instead and access query parameters using "new URL(request.url).searchParams" instead. Learn more: https://mswjs.io/docs/http/intercepting-requests#querysearch-parameters`
    );
  }
  async parse(args) {
    const url = new URL(args.request.url);
    const cookies = getAllRequestCookies(args.request);
    if (typeof this.info.path === "function") {
      const customPredicateResult = await this.info.path({
        request: args.request,
        cookies
      });
      const match2 = typeof customPredicateResult === "boolean" ? {
        matches: customPredicateResult,
        params: {}
      } : customPredicateResult;
      return {
        match: match2,
        cookies
      };
    }
    const match = this.info.path ? matchRequestUrl(url, this.info.path, args.resolutionContext?.baseUrl) : { matches: false, params: {} };
    return {
      match,
      cookies
    };
  }
  async predicate(args) {
    const hasMatchingMethod = this.matchMethod(args.request.method);
    const hasMatchingUrl = args.parsedResult.match.matches;
    return hasMatchingMethod && hasMatchingUrl;
  }
  matchMethod(actualMethod) {
    return this.info.method instanceof RegExp ? this.info.method.test(actualMethod) : isStringEqual(this.info.method, actualMethod);
  }
  extendResolverArgs(args) {
    return {
      params: args.parsedResult.match?.params || {},
      cookies: args.parsedResult.cookies
    };
  }
  async log(args) {
    const publicUrl = toPublicUrl(args.request.url);
    const loggedRequest = await serializeRequest(args.request);
    const loggedResponse = await serializeResponse(args.response);
    const statusColor = getStatusCodeColor(loggedResponse.status);
    console.groupCollapsed(
      devUtils.formatMessage(
        `${getTimestamp()} ${args.request.method} ${publicUrl} (%c${loggedResponse.status} ${loggedResponse.statusText}%c)`
      ),
      `color:${statusColor}`,
      "color:inherit"
    );
    console.log("Request", loggedRequest);
    console.log("Handler:", this);
    console.log("Response", loggedResponse);
    console.groupEnd();
  }
}

function createHttpHandler(method) {
  return (predicate, resolver, options = {}) => {
    return new HttpHandler(method, predicate, resolver, options);
  };
}
const http = {
  all: createHttpHandler(/.+/),
  head: createHttpHandler(HttpMethods.HEAD),
  get: createHttpHandler(HttpMethods.GET),
  post: createHttpHandler(HttpMethods.POST),
  put: createHttpHandler(HttpMethods.PUT),
  delete: createHttpHandler(HttpMethods.DELETE),
  patch: createHttpHandler(HttpMethods.PATCH),
  options: createHttpHandler(HttpMethods.OPTIONS)
};

checkGlobals();

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
const today = /* @__PURE__ */ new Date();
const weekStartDate = mondayOf(today);
const weekDates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(weekStartDate);
  d.setDate(d.getDate() + i);
  return isoDate(d);
});
const seedRecipes = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    title: "Борщ классический",
    steps: ["Сварить бульон", "Добавить овощи", "Подавать со сметаной"],
    cookTimeMinutes: 90,
    mealCategory: "Суп",
    nutrition: { proteinG: 12, fatG: 8, carbsG: 15, calories: 180 },
    ingredients: [
      { name: "Говядина", quantity: 500, unit: "г", productCategory: "meat" },
      { name: "Свёкла", quantity: 300, unit: "г", productCategory: "vegetables" },
      { name: "Капуста", quantity: 200, unit: "г", productCategory: "vegetables" }
    ],
    sourceUrl: "https://eda.ru/recepty/sup/borsch",
    note: "Лучше на второй день.",
    imageUrl: null,
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z"
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    title: "Куриный суп",
    steps: ["Отварить курицу", "Добавить овощи"],
    cookTimeMinutes: 45,
    mealCategory: "Суп",
    nutrition: { proteinG: 18, fatG: 6, carbsG: 10, calories: 160 },
    ingredients: [
      { name: "Куриное филе", quantity: 400, unit: "г", productCategory: "meat" },
      { name: "Картофель", quantity: 2, unit: "шт", productCategory: "vegetables" },
      { name: "Морковь", quantity: 1, unit: "шт", productCategory: "vegetables" }
    ],
    sourceUrl: "https://povarenok.ru/recept/soup",
    note: null,
    imageUrl: null,
    createdAt: "2026-01-02T10:00:00Z",
    updatedAt: "2026-01-02T10:00:00Z"
  },
  {
    id: "11111111-1111-4111-8111-111111111103",
    title: "Овсянка с ягодами",
    steps: ["Сварить овсянку", "Добавить ягоды"],
    cookTimeMinutes: 15,
    mealCategory: "Завтрак",
    nutrition: { calories: 220 },
    ingredients: [
      { name: "Овсяные хлопья", quantity: 80, unit: "г", productCategory: "groceries" },
      { name: "Молоко", quantity: 200, unit: "мл", productCategory: "dairy" },
      { name: "Ягоды", quantity: null, unit: void 0, productCategory: "vegetables" }
    ],
    sourceUrl: null,
    note: null,
    imageUrl: null,
    createdAt: "2026-01-03T10:00:00Z",
    updatedAt: "2026-01-03T10:00:00Z"
  },
  {
    id: "11111111-1111-4111-8111-111111111104",
    title: "Паста карбонара",
    steps: ["Сварить пасту", "Смешать с соусом"],
    cookTimeMinutes: 25,
    mealCategory: "Ужин",
    ingredients: [
      { name: "Спагетти", quantity: 200, unit: "г", productCategory: "groceries" },
      { name: "Бекон", quantity: 100, unit: "г", productCategory: "meat" },
      { name: "Parmesan", quantity: 50, unit: "г", productCategory: "dairy" }
    ],
    sourceUrl: null,
    note: null,
    imageUrl: null,
    createdAt: "2026-01-04T10:00:00Z",
    updatedAt: "2026-01-04T10:00:00Z"
  },
  {
    id: "11111111-1111-4111-8111-111111111105",
    title: "Греческий салат",
    steps: ["Нарезать овощи", "Заправить маслом"],
    cookTimeMinutes: 10,
    mealCategory: "Салат",
    ingredients: [
      { name: "Огурец", quantity: 1, unit: "шт", productCategory: "vegetables" },
      { name: "Помидор", quantity: 2, unit: "шт", productCategory: "vegetables" },
      { name: "Сыр фета", quantity: 150, unit: "г", productCategory: "dairy" }
    ],
    sourceUrl: null,
    note: null,
    imageUrl: null,
    createdAt: "2026-01-05T10:00:00Z",
    updatedAt: "2026-01-05T10:00:00Z"
  }
];
const slotCodes = [
  "BREAKFAST",
  "SECOND_BREAKFAST",
  "LUNCH",
  "SNACK",
  "DINNER",
  "LATE_DINNER"
];
function buildInitialSlots() {
  const slots = [];
  let n = 0;
  for (const date of weekDates) {
    for (const code of slotCodes) {
      n += 1;
      slots.push({
        slotId: `22222222-2222-4222-8222-${String(n).padStart(12, "0")}`,
        date,
        slotCode: code,
        recipeIds: [],
        version: 1
      });
    }
  }
  const mondayDinner = slots.find((s) => s.date === weekDates[0] && s.slotCode === "DINNER");
  if (mondayDinner) {
    mondayDinner.recipeIds = [seedRecipes[3].id];
  }
  return slots;
}
function createDemoStore() {
  return {
    recipes: structuredClone(seedRecipes),
    slots: buildInitialSlots(),
    shoppingLists: /* @__PURE__ */ new Map(),
    loggedIn: true
  };
}
let store = createDemoStore();
function getDemoStore() {
  return store;
}
function listRecipes(q) {
  let items = store.recipes.map((r) => ({
    id: r.id,
    title: r.title,
    cookTimeMinutes: r.cookTimeMinutes,
    mealCategory: r.mealCategory
  }));
  if (q) {
    const lower = q.toLowerCase();
    items = items.filter((r) => r.title.toLowerCase().includes(lower));
  }
  return { items, total: items.length };
}
function weekPlan(anchorDate, recipeSearch) {
  const anchor = anchorDate ?? isoDate(today);
  const start = mondayOf(/* @__PURE__ */ new Date(`${anchor}T12:00:00`));
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return isoDate(d);
  });
  return {
    weekStart: dates[0],
    weekEnd: dates[6],
    days: dates.map((date) => ({
      date,
      slots: store.slots.filter((s) => s.date === date).map((s) => ({
        slotId: s.slotId,
        date: s.date,
        slotCode: s.slotCode,
        recipeIds: [...s.recipeIds],
        version: s.version
      }))
    })),
    recipeSearchHint: recipeSearch
  };
}
function buildShopping(from, to) {
  const listId = "33333333-3333-4333-8333-333333333301";
  const lines = [];
  const agg = /* @__PURE__ */ new Map();
  for (const slot of store.slots) {
    if (slot.date < from || slot.date > to) continue;
    for (const rid of slot.recipeIds) {
      const recipe = store.recipes.find((r) => r.id === rid);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const key = `${ing.name}|${ing.unit ?? ""}`;
        const cur = agg.get(key) ?? {
          quantity: 0,
          unit: ing.unit ?? "",
          category: ing.productCategory,
          ids: []
        };
        if (ing.quantity != null) cur.quantity += ing.quantity;
        if (!cur.ids.includes(rid)) cur.ids.push(rid);
        agg.set(key, cur);
      }
    }
  }
  let lineNum = 0;
  for (const [key, val] of agg) {
    const name = key.split("|")[0];
    lineNum += 1;
    lines.push({
      lineId: `44444444-4444-4444-8444-${String(lineNum).padStart(12, "0")}`,
      displayName: name,
      quantity: val.quantity || null,
      unit: val.unit || null,
      productCategory: val.category,
      purchased: false,
      sourceRecipeIds: val.ids
    });
  }
  const detail = {
    listId,
    from,
    to,
    empty: lines.length === 0,
    lines
  };
  store.shoppingLists.set(listId, detail);
  return { listId, from, to, replaced: true, empty: detail.empty };
}

function matchBff(pathSuffix, url) {
  return url.pathname.endsWith(`/bff/v1${pathSuffix}`) || url.pathname.endsWith(pathSuffix);
}
function json(data, status = 200) {
  return HttpResponse.json(data, { status });
}
const demoHandlers = [
  http.get(({ request }) => {
    const url = new URL(request.url);
    return matchBff("/health", url);
  }, () => json({ status: "ok" })),
  http.get(({ request }) => {
    const url = new URL(request.url);
    return matchBff("/recipes", url) && !url.pathname.match(/\/recipes\/[^/]+$/);
  }, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? void 0;
    return json(listRecipes(q ?? void 0));
  }),
  http.get(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/recipes\/[^/]+$/.test(url.pathname);
  }, ({ request }) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const recipe = getDemoStore().recipes.find((r) => r.id === id);
    if (!recipe) return HttpResponse.json({ code: "NOT_FOUND", message: "Not found" }, { status: 404 });
    return json(recipe);
  }),
  http.post(({ request }) => matchBff("/recipes", new URL(request.url)), async ({ request }) => {
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const recipe = {
      id,
      title: body.title ?? "Без названия",
      steps: body.steps ?? [],
      cookTimeMinutes: body.cookTimeMinutes ?? null,
      mealCategory: body.mealCategory ?? null,
      nutrition: body.nutrition ?? null,
      ingredients: body.ingredients ?? [],
      sourceUrl: body.sourceUrl ?? null,
      note: body.note ?? null,
      imageUrl: body.imageUrl ?? null,
      createdAt: now,
      updatedAt: now
    };
    getDemoStore().recipes.unshift(recipe);
    return json(recipe, 201);
  }),
  http.patch(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/recipes\/[^/]+$/.test(url.pathname);
  }, async ({ request }) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const body = await request.json();
    const store = getDemoStore();
    const idx = store.recipes.findIndex((r) => r.id === id);
    if (idx < 0) return HttpResponse.json({ code: "NOT_FOUND", message: "Not found" }, { status: 404 });
    store.recipes[idx] = {
      ...store.recipes[idx],
      ...body,
      id,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return json(store.recipes[idx]);
  }),
  http.delete(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/recipes\/[^/]+$/.test(url.pathname);
  }, ({ request }) => {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const store = getDemoStore();
    store.recipes = store.recipes.filter((r) => r.id !== id);
    for (const slot of store.slots) {
      slot.recipeIds = slot.recipeIds.filter((rid) => rid !== id);
    }
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(({ request }) => matchBff("/import/url", new URL(request.url)), async ({ request }) => {
    const body = await request.json();
    const url = body.url ?? "";
    const isPov = url.includes("povarenok");
    return json({
      title: isPov ? "Куриный суп" : "Борщ классический",
      steps: isPov ? ["Отварить курицу", "Добавить овощи"] : ["Сварить бульон", "Добавить овощи"],
      cookTimeMinutes: isPov ? 45 : 90,
      ingredients: isPov ? [{ name: "Куриное филе", quantity: 400, unit: "г", productCategory: "meat" }] : [{ name: "Говядина", quantity: 500, unit: "г", productCategory: "meat" }],
      sourceUrl: url,
      nutrition: isPov ? null : { proteinG: 12, fatG: 8, carbsG: 15, calories: 180 }
    });
  }),
  http.get(({ request }) => matchBff("/plan/week", new URL(request.url)), ({ request }) => {
    const url = new URL(request.url);
    const anchor = url.searchParams.get("anchorDate") ?? void 0;
    const recipeSearch = url.searchParams.get("recipeSearch") ?? void 0;
    return json(weekPlan(anchor, recipeSearch ?? void 0));
  }),
  http.patch(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/plan\/slots\/[^/]+$/.test(url.pathname);
  }, async ({ request }) => {
    const url = new URL(request.url);
    const slotId = url.pathname.split("/").pop();
    const body = await request.json();
    const slot = getDemoStore().slots.find((s) => s.slotId === slotId);
    if (!slot) return HttpResponse.json({ code: "NOT_FOUND", message: "Slot not found" }, { status: 404 });
    if (body.expectedVersion != null && body.expectedVersion !== slot.version) {
      return HttpResponse.json({ code: "VERSION_CONFLICT", message: "Version conflict" }, { status: 409 });
    }
    slot.recipeIds = body.recipeIds ?? [];
    slot.version += 1;
    return json({
      slotId: slot.slotId,
      date: slot.date,
      slotCode: slot.slotCode,
      recipeIds: [...slot.recipeIds],
      version: slot.version
    });
  }),
  http.post(({ request }) => matchBff("/shopping/build", new URL(request.url)), async ({ request }) => {
    const body = await request.json();
    return json(buildShopping(body.from, body.to));
  }),
  http.get(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/shopping\/lists\/[^/]+$/.test(url.pathname);
  }, ({ request }) => {
    const url = new URL(request.url);
    const listId = url.pathname.split("/").pop();
    const list = getDemoStore().shoppingLists.get(listId);
    if (!list) return HttpResponse.json({ code: "NOT_FOUND", message: "List not found" }, { status: 404 });
    return json(list);
  }),
  http.patch(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/shopping\/lists\/[^/]+\/lines\/[^/]+$/.test(url.pathname);
  }, async ({ request }) => {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const lineId = parts.pop();
    parts.pop();
    const listId = parts.pop();
    const body = await request.json();
    const list = getDemoStore().shoppingLists.get(listId);
    if (!list) return HttpResponse.json({ code: "NOT_FOUND", message: "Not found" }, { status: 404 });
    const line = list.lines.find((l) => l.lineId === lineId);
    if (!line) return HttpResponse.json({ code: "NOT_FOUND", message: "Line not found" }, { status: 404 });
    if (body.purchased != null) line.purchased = body.purchased;
    return json(line);
  }),
  http.delete(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/shopping\/lists\/[^/]+\/lines\/[^/]+$/.test(url.pathname);
  }, ({ request }) => {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const lineId = parts.pop();
    parts.pop();
    const listId = parts.pop();
    const list = getDemoStore().shoppingLists.get(listId);
    if (list) {
      list.lines = list.lines.filter((l) => l.lineId !== lineId);
      list.empty = list.lines.length === 0;
    }
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(({ request }) => {
    const url = new URL(request.url);
    return /\/bff\/v1\/shopping\/lists\/[^/]+\/lines$/.test(url.pathname);
  }, async ({ request }) => {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    parts.pop();
    const listId = parts.pop();
    const body = await request.json();
    const list = getDemoStore().shoppingLists.get(listId);
    if (!list) return HttpResponse.json({ code: "NOT_FOUND", message: "Not found" }, { status: 404 });
    const line = {
      lineId: crypto.randomUUID(),
      displayName: body.displayName,
      quantity: null,
      unit: null,
      productCategory: body.productCategory ?? "other",
      purchased: false,
      sourceRecipeIds: []
    };
    list.lines.push(line);
    list.empty = false;
    return json(line, 201);
  }),
  http.post(({ request }) => {
    const url = new URL(request.url);
    return matchBff("/auth/login", url) || matchBff("/auth/register", url);
  }, () => {
    getDemoStore().loggedIn = true;
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(({ request }) => matchBff("/auth/logout", new URL(request.url)), () => {
    getDemoStore().loggedIn = false;
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(
    ({ request }) => matchBff("/auth/password", new URL(request.url)),
    () => new HttpResponse(null, { status: 204 })
  )
];

export { demoHandlers };
