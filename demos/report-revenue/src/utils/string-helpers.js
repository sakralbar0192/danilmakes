const stringHelpers = {
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  camelize(str) {
    const arr = str.split("-");
    const capital = arr.map((item, index) => (index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item));
    return capital.join("");
  },
  htmlEntitiesReplace(str = "") {
    const htmlEntities = {
      "&mdash;": "—",
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": "\"",
    };
    return str?.replace(/&(#[0-9]+|[a-z]+);/g, match => htmlEntities[match]);
  },
  stripTrailingSlash(str) {
    return str.endsWith("/") ? str.slice(0, -1) : str;
  },
  truncate(str, maxLength) {
    if (str.length <= maxLength) return str;

    return `${str.slice(0, maxLength)}...`;
  },
};

export default stringHelpers;
