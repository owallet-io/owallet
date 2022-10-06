import React, { FunctionComponent, useEffect } from 'react';
import { StoreProvider, useStore } from './stores';
import { StyleProvider } from './styles';
import { AppNavigation } from './navigation';
import { ModalsProvider } from './modals/base';
import { Platform, StatusBar, LogBox, Text } from 'react-native';
import { AdditonalIntlMessages, LanguageToFiatCurrency } from '@owallet/common';
import { InteractionModalsProivder } from './providers/interaction-modals-provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingScreenProvider } from './providers/loading-screen';
import * as SplashScreen from 'expo-splash-screen';
import { ConfirmModalProvider } from './providers/confirm-modal';
import { AppIntlProvider } from '@owallet/common/src/languages';
import { IntlProvider } from 'react-intl';
import crashlytics from '@react-native-firebase/crashlytics';

if (Platform.OS === 'android' || typeof HermesInternal !== 'undefined') {
  // https://github.com/web-ridge/react-native-paper-dates/releases/tag/v0.2.15

  // Even though React Native supports the intl on android with "org.webkit:android-jsc-intl:+" option,
  // it seems that android doesn't support all intl API and this bothers me.
  // So, to reduce this problem on android, just use the javascript polyfill for intl.
  require('@formatjs/intl-getcanonicallocales/polyfill');
  require('@formatjs/intl-locale/polyfill');

  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/locale-data/en.js');

  require('@formatjs/intl-displaynames/polyfill');
  require('@formatjs/intl-displaynames/locale-data/en.js');

  // require("@formatjs/intl-listformat/polyfill");
  // require("@formatjs/intl-listformat/locale-data/en.js");

  require('@formatjs/intl-numberformat/polyfill');
  require('@formatjs/intl-numberformat/locale-data/en.js');

  require('@formatjs/intl-relativetimeformat/polyfill');
  require('@formatjs/intl-relativetimeformat/locale-data/en.js');

  require('@formatjs/intl-datetimeformat/polyfill');
  require('@formatjs/intl-datetimeformat/locale-data/en.js');

  require('@formatjs/intl-datetimeformat/add-golden-tz.js');

  // https://formatjs.io/docs/polyfills/intl-datetimeformat/#default-timezone
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // const RNLocalize = require("react-native-localize");
  // if ("__setDefaultTimeZone" in Intl.DateTimeFormat) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // Intl.DateTimeFormat.__setDefaultTimeZone(RNLocalize.getTimeZone());
  // }
  // On android, setting the timezone makes that the hour in date looks weird if the hour exceeds 24. Ex) 00:10 AM -> 24:10 AM.
  // Disable the timezone until finding the solution.
}

// Prevent native splash screen from autohiding.
// UnlockScreen will hide the splash screen
SplashScreen.preventAutoHideAsync()
  .then(result =>
    console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`)
  )
  .catch(console.warn);

// we already log in debugging tools
LogBox.ignoreAllLogs();

const AppIntlProviderWithStorage = ({ children }) => {
  const store = useStore();

  return (
    <AppIntlProvider
      additionalMessages={AdditonalIntlMessages}
      languageToFiatCurrency={LanguageToFiatCurrency}
      storage={store.uiConfigStore.Storage}
    >
      {({ language, messages, automatic }) => (
        <IntlProvider
          locale={language}
          messages={messages}
          key={`${language}${automatic ? '-auto' : ''}`}
          formats={{
            date: {
              en: {
                // Prefer not showing the year.
                // If the year is different with current time, recommend to show the year.
                // However, this recomendation should be handled in the component logic.
                // year: "numeric",
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                hour12: false,
                minute: '2-digit',
                timeZoneName: 'short'
              }
            }
          }}
        >
          {children}
        </IntlProvider>
      )}
    </AppIntlProvider>
  );
};

export const App = () => {
  return (
    <StyleProvider>
      <StoreProvider>
        <AppIntlProviderWithStorage>
          <StatusBar
            translucent={true}
            backgroundColor="#FFFFFF00"
            barStyle="dark-content"
          />
          <SafeAreaProvider>
            <ModalsProvider>
              <LoadingScreenProvider>
                <ConfirmModalProvider>
                  <InteractionModalsProivder>
                    <AppNavigation />
                  </InteractionModalsProivder>
                </ConfirmModalProvider>
              </LoadingScreenProvider>
            </ModalsProvider>
          </SafeAreaProvider>
        </AppIntlProviderWithStorage>
      </StoreProvider>
    </StyleProvider>
  );
};
