// Seperate shared config from UI config to prevent code mixup between UI and background process code.
import { RegisterOption } from '@owallet/hooks';
import {
  ADDITIONAL_INTL_MESSAGES,
  ADDITIONAL_SIGN_IN_PREPEND
} from './config.ui.var';
import {
  IntlMessages,
  LanguageToFiatCurrency as TypeLanguageToFiatCurrency
} from './languages';
import { FiatCurrency } from '@owallet/types';

export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: 'usd',
    symbol: '$',
    maxDecimals: 2,
    locale: 'en-US'
  },
  {
    currency: 'eur',
    symbol: '€',
    maxDecimals: 2,
    locale: 'de-DE'
  },
  {
    currency: 'gbp',
    symbol: '£',
    maxDecimals: 2,
    locale: 'en-GB'
  },
  {
    currency: 'cad',
    symbol: 'CA$',
    maxDecimals: 2,
    locale: 'en-CA'
  },
  {
    currency: 'aud',
    symbol: 'AU$',
    maxDecimals: 2,
    locale: 'en-AU'
  },
  {
    currency: 'rub',
    symbol: '₽',
    maxDecimals: 0,
    locale: 'ru'
  },
  {
    currency: 'krw',
    symbol: '₩',
    maxDecimals: 0,
    locale: 'ko-KR'
  },
  {
    currency: 'hkd',
    symbol: 'HK$',
    maxDecimals: 1,
    locale: 'en-HK'
  },
  {
    currency: 'cny',
    symbol: '¥',
    maxDecimals: 1,
    locale: 'zh-CN'
  },
  {
    currency: 'jpy',
    symbol: '¥',
    maxDecimals: 0,
    locale: 'ja-JP'
  },
  {
    currency: 'inr',
    symbol: '₹',
    maxDecimals: 1,
    locale: 'en-IN'
  }
];

export const LanguageToFiatCurrency: TypeLanguageToFiatCurrency = {
  default: 'usd',
  ko: 'krw'
};

export const AdditionalSignInPrepend: RegisterOption[] | undefined =
  ADDITIONAL_SIGN_IN_PREPEND;

export const AdditonalIntlMessages: IntlMessages = ADDITIONAL_INTL_MESSAGES;
