// eslint-disable-next-line import/no-extraneous-dependencies
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { StoreProvider } from "./stores";

import { App } from "./app";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <StoreProvider>
    <App />
  </StoreProvider>
);
