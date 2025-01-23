// for checking
window = {};
import * as Sentry from "@sentry/browser";
import { CaptureConsole as CaptureConsoleIntegration } from "@sentry/integrations";

try {
  importScripts("browser-polyfill.js", "background.bundle.js" /*, and so on */);

  // chrome.alarms.onAlarm.addListener((a) => {
  //   console.log('Alarm! Alarm!', a);
  // });

  // chrome.runtime.onInstalled.addListener(() => {
  //   chrome.alarms.get('alarm', (a) => {
  //     if (!a) {
  //       chrome.alarms.create('alarm', { periodInMinutes: 0.3 });
  //     }
  //   });
  // });

  /**
   * Tracks when a service worker was last alive and extends the service worker
   * lifetime by writing the current time to extension storage every 20 seconds.
   * You should still prepare for unexpected termination - for example, if the
   * extension process crashes or your extension is manually stopped at
   * chrome://serviceworker-internals.
   */
  let heartbeatInterval;

  async function runHeartbeat() {
    await chrome.storage.local.set({ "last-heartbeat": new Date().getTime() });
  }

  /**
   * Starts the heartbeat interval which keeps the service worker alive. Call
   * this sparingly when you are doing work which requires persistence, and call
   * stopHeartbeat once that work is complete.
   */
  async function startHeartbeat() {
    // Run the heartbeat once at service worker startup.
    runHeartbeat().then(() => {
      // Then again every 20 seconds.
      heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);
    });
  }

  startHeartbeat();
  Sentry.init({
    dsn: "https://ab29c6e64d65418cb3b9f133dc601c23@o1323226.ingest.sentry.io/4504632450023424",
    tracesSampleRate: 0.5,
    integrations: [
      new CaptureConsoleIntegration({ levels: ["error"] }), // Capture console.errors
    ],
    // Optional: Tag errors for filtering in Sentry
    initialScope: {
      tags: { context: "background" },
    },
  });
  // async function stopHeartbeat() {
  //   clearInterval(heartbeatInterval);
  // }

  // /**
  //  * Returns the last heartbeat stored in extension storage, or undefined if
  //  * the heartbeat has never run before.
  //  */
  // async function getLastHeartbeat() {
  //   return (await chrome.storage.local.get('last-heartbeat'))['last-heartbeat'];
  // }
} catch (e) {
  console.error(e);
}
