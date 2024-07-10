const fetchWrap = require("fetch-retry")(global.fetch);

export const fetchRetry = async (url, config?: any) => {
  const response = await fetchWrap(url, {
    retries: 3,
    retryDelay: 1000,
    ...config,
  });
  if (response.status !== 200) return;
  const jsonRes = await response.json();
  return jsonRes;
};
