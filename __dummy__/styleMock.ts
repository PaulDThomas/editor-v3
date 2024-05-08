export default new Proxy(
  {},
  {
    get: (_, name) => name,
  },
);
