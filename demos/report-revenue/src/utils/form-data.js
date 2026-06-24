function createFormDataFromObj(obj) {
  const formData = new FormData();
  Object.entries(obj).forEach(entry => {
    const [key, value] = entry;

    formData.append(key, value);
  });

  return formData;
}

export default createFormDataFromObj;
