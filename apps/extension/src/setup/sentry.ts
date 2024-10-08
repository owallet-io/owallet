import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initializeSentry = () => {
  Sentry.init({
    dsn: "https://4ce54db1095b48ab8688e701d7cc8301@o1323226.ingest.sentry.io/4504615445725184",
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: "production",
    ignoreErrors: [
      "Request rejected",
      "Failed to fetch",
      "Load failed",
      "User rejected the request",
    ],
  });
};
