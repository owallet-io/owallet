import React, { FunctionComponent } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.scss";
import "react-sliding-pane/dist/react-sliding-pane.css";
import "react-toastify/dist/ReactToastify.css";
import { HashRouter } from "react-router-dom";
import { configure } from "mobx";
import { ErrorBoundary } from "react-error-boundary";
import { ToastContainer, Zoom } from "react-toastify";
import { useMatchPopupSize } from "../popup-size";
// import "./ledger";
import { StoreProvider } from "./stores";
import { LoadingIndicatorProvider } from "./components/loading-indicator";
import { ConfirmProvider } from "./components/confirm";
// import { LogPageViewWrapper } from "./components/analytics";
import { AppRoutes } from "./setup/Routes";
import { ErrorFallback } from "./components/ErrorFallback/ErrorFallback";
import { initializeWalletProviders } from "./setup/walletProviders";
import { setupModalStyles } from "./setup/modalStyles";
import { initializeSentry } from "./setup/sentry";

// import "./styles/global.scss";

import { isProdMode } from "helpers/helper";
import { isRunningInSidePanel } from "./utils/side-panel";
import { GlobalPopupStyle, GlobalSidePanelStyle } from "./styles";
import { GlobalStyle } from "./styles/global";

// Initialize wallet providers
initializeWalletProviders();

// Configure MobX
configure({ enforceActions: "always" });

// Set up Modal styles
setupModalStyles();

// Initialize Sentry in production mode
if (isProdMode) {
  initializeSentry();
}

// Ensure icon files are included in the bundle
require("./public/assets/orai_wallet_logo.png");
require("./public/assets/icon/icon-16.png");
require("./public/assets/icon/icon-48.png");
require("./public/assets/icon/icon-128.png");

const logError = (error: Error, info: { componentStack: string }) => {
  console.error("Error:", error);
  console.error("Component Stack:", info.componentStack);
};

const App: FunctionComponent = () => {
  useMatchPopupSize();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      <StoreProvider>
        <LoadingIndicatorProvider>
          <ConfirmProvider>
            {/* <GlobalStyle /> */}
            {isRunningInSidePanel() ? <GlobalSidePanelStyle /> : null}
            <HashRouter>
              {/* <LogPageViewWrapper> */}
              <AppRoutes />
              {/* </LogPageViewWrapper> */}
            </HashRouter>
          </ConfirmProvider>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastStyle={{ borderRadius: 8 }}
            style={{
              maxWidth: "calc(100vw - 32px)",
              margin: 16,
            }}
            bodyStyle={{ fontSize: 14 }}
            transition={Zoom}
          />
        </LoadingIndicatorProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById("app")).render(<App />);
