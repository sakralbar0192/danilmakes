export function externalImage(imgUrl) {
  imgUrl = imgUrl || "";
  if (imgUrl.indexOf("http") === 0) {
    return imgUrl;
  }
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${imgUrl.replace(/^\//, "")}`;
}

export function localImage(imgUrl) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}img/${imgUrl || ""}`;
}
