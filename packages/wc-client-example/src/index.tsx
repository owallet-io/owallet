// eslint-disable-next-line import/no-extraneous-dependencies
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import { StoreProvider } from "./stores";

import { App } from "./app";

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById("root")
);
