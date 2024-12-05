// import React from "react";
// import { IntlProvider } from "react-intl";
// import {
//   AppIntlProvider,
//   AdditonalIntlMessages,
//   LanguageToFiatCurrency,
// } from "@owallet/common";
// import { useStore } from "../stores";

// export const AppIntlProviderWithStorage: React.FC = ({ children }) => {
//   const store = useStore();

//   return (
//     <AppIntlProvider
//       additionalMessages={AdditonalIntlMessages}
//       languageToFiatCurrency={LanguageToFiatCurrency}
//       // language without region code
//       defaultLocale={navigator.language.split(/[-_]/)[0]}
//       storage={store.uiConfigStore.Storage}
//     >
//       {({ language, messages, automatic }) => (
//         <IntlProvider
//           locale={language}
//           messages={messages}
//           key={`${language}${automatic ? "-auto" : ""}`}
//         >
//           {children}
//         </IntlProvider>
//       )}
//     </AppIntlProvider>
//   );
// };
