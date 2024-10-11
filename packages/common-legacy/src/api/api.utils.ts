const fetchWrap = require("fetch-retry")(global.fetch);
// Map to keep track of ongoing fetch requests by URL
const ongoingFetches = new Map();

export const fetchRetry = async (url, config = {}) => {
  // Abort any previous fetch for the same URL
  if (ongoingFetches.has(url)) {
    ongoingFetches.get(url).abort();
  }

  const abortController = new AbortController();
  //@ts-ignore
  config.signal = abortController.signal;
  ongoingFetches.set(url, abortController);

  try {
    const response = await fetchWrap(url, {
      retries: 3,
      retryDelay: 1000,
      ...config,
    });

    // Clear the ongoing fetch entry after the fetch completes
    ongoingFetches.delete(url);

    if (response.status !== 200) return;

    const jsonRes = await response.json();
    return jsonRes;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Fetch aborted:", url);
    } else {
      console.error("Fetch failed:", error);
    }
  } finally {
    ongoingFetches.delete(url);
  }
};
