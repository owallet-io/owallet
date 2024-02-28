declare namespace NodeJS {
  interface ProcessEnv {
    /** node environment */
    NODE_ENV: "production" | "development" | undefined;
    INJECTED_PROVIDER_URL: string;
  }
}
