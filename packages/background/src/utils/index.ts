import { isServiceWorker } from "@owallet/common";

export const runIfOnlyAppStart = async (
  key: string,
  fn: () => Promise<void>
): Promise<void> => {
  let skip = false;
  // Service worker can switch between active and inactive states
  // In this case, we ensure the function runs only once by storing the value in the session
  if (isServiceWorker()) {
    try {
      const v = await browser.storage.session.get(key);
      if (v[key]) {
        skip = true;
      }
      await browser.storage.session.set({
        [key]: true,
      });
    } catch (e) {
      console.log(
        `Failed to load from session storage: ${e.message || e.toString()}`
      );
    }
  }

  if (!skip) {
    await fn();
  }
};
