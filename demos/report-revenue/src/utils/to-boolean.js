const toBoolean = (string) => {
  switch (String(string).toLowerCase().trim()) {
    case "true":
    case "1":
      return true;
    case "false":
    case "0":
    case "undefined":
    case "null":
      return false;
    default:
      return Boolean(string);
  }
};

export default toBoolean;
