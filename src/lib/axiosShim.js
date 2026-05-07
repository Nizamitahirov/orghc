// src/lib/axiosShim.js
// Replaces axios for services that still reference it.
// Returns empty/stub responses so the UI doesn't crash, since
// these features are not needed in the headcount+orgchart demo.

const noop = async () => ({ data: {}, status: 200, headers: {} });
const noopArr = async () => ({ data: [], status: 200 });

const makeInstance = () => {
  const instance = {
    get: noop,
    post: noop,
    put: noop,
    patch: noop,
    delete: noop,
    request: noop,
    interceptors: {
      request: { use: () => {}, eject: () => {} },
      response: { use: () => {}, eject: () => {} },
    },
    defaults: { headers: { common: {} } },
  };
  return instance;
};

const axios = {
  create: () => makeInstance(),
  get: noop,
  post: noop,
  put: noop,
  patch: noop,
  delete: noop,
  interceptors: {
    request: { use: () => {}, eject: () => {} },
    response: { use: () => {}, eject: () => {} },
  },
  defaults: { headers: { common: {} } },
  isAxiosError: () => false,
};

export default axios;
