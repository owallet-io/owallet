import React, { FunctionComponent, useEffect, useState } from "react";
import { KVStore } from "../kv-store/interface";

import MessagesEn from "./en";
// import MessagesKo from './ko.js';

export type IntlMessage = Record<string, string>;
export type IntlMessages = { [lang: string]: Record<string, string> };

const messages: IntlMessages = {
  en: MessagesEn,
  // ko: MessagesKo
};

function getMessages(
  additionalMessages: IntlMessages,
  language: string
): IntlMessage {
  return Object.assign(
    {},
    MessagesEn,
    messages[language],
    additionalMessages[language]
  );
}

async function initLanguage(
  additionalMessages: IntlMessages,
  storage: KVStore,
  defaultLocale?: string
): Promise<string> {
  try {
    const language = (await storage.get<string>("language")) ?? defaultLocale;
    if (messages[language] || additionalMessages[language]) {
      return language;
    }
  } catch (ex) {
    console.log("[@owallet/common] initLanguage", ex);
  }
  return "en";
}

interface Language {
  language: string;
  automatic: boolean;
  setLanguage: (language: string) => void;
  clearLanguage: () => void;

  fiatCurrency: string;
  isFiatCurrencyAutomatic: boolean;
  // Set the fiat currency. If the argument is null, it will set the fiat currency automatically.
  setFiatCurrency: (fiatCurrency: string | null) => void;
}

const LanguageContext = React.createContext<Language | null>(null);

export const useLanguage = (): Language => {
  const lang = React.useContext(LanguageContext);
  if (!lang) {
    throw new Error("You have forgot to use language provider");
  }
  return lang;
};

export type TypeLanguageToFiatCurrency = { ["default"]: string } & {
  [language: string]: string | undefined;
};

export const AppIntlProvider: FunctionComponent<{
  additionalMessages: IntlMessages;
  children: FunctionComponent<{
    language: string;
    messages: IntlMessage;
    automatic: boolean;
  }>;
  // Set the fiat currency according to the language if the fiat currency is not set (automatic).
  languageToFiatCurrency: TypeLanguageToFiatCurrency;
  defaultLocale?: string;
  storage: KVStore;
}> = ({
  additionalMessages,
  languageToFiatCurrency,
  children,
  defaultLocale,
  storage,
}) => {
  const [language, _setLanguage] = useState("en");
  const [automatic, setAutomatic] = useState(false);
  const [messages, setMessages] = useState(
    getMessages(additionalMessages, language)
  );
  const [fiatCurrency, _setFiatCurrency] = useState<string | null>();

  useEffect(() => {
    initLanguage(additionalMessages, storage, defaultLocale).then((lang) => {
      _setLanguage(lang);
      setAutomatic(lang == null);
      setMessages(getMessages(additionalMessages, lang));
    });
    storage.get("fiat-currency").then(setFiatCurrency);
  }, [additionalMessages]);

  const setLanguage = (language: string) => {
    storage.set("language", language);
    _setLanguage(language);
    setAutomatic(false);
  };

  const clearLanguage = () => {
    storage.set("language", null);
    initLanguage(additionalMessages, storage, defaultLocale).then(_setLanguage);
    setAutomatic(true);
  };

  const setFiatCurrency = (fiatCurrency: string | null) => {
    fiatCurrency =
      fiatCurrency ||
      languageToFiatCurrency[language] ||
      languageToFiatCurrency["default"];
    storage.set("fiat-currency", fiatCurrency);
    _setFiatCurrency(fiatCurrency);
  };

  const isFiatCurrencyAutomatic = fiatCurrency === null;

  return (
    <LanguageContext.Provider
      value={{
        language: language,
        automatic: automatic,
        setLanguage,
        clearLanguage,
        fiatCurrency,
        setFiatCurrency,
        isFiatCurrencyAutomatic,
      }}
    >
      {children({ language, messages, automatic })}
    </LanguageContext.Provider>
  );
};
