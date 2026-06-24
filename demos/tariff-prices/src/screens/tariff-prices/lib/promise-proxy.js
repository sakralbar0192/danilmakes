function createPromiseProxy() {
  const proxy = {};
  proxy.promise = new Promise((resolve, reject) => {
    proxy.resolve = resolve;
    proxy.reject = reject;
  });
  return proxy;
}

export default createPromiseProxy;
