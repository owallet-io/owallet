import { TypeTextAndCustomizeComponent } from './types';

export const checkFnComponent = (titleRight: TypeTextAndCustomizeComponent, Element: React.ReactNode) => {
  if (!!titleRight) {
    if (typeof titleRight === 'string') {
      return Element;
    } else if (typeof titleRight === 'function') {
      return titleRight();
    }
    return titleRight;
  }
  return null;
};

const OraiIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png';
const OraiLightIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png';
const AtomIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png';
const AiriIcon = 'https://i.ibb.co/m8mCyMr/airi.png';
const UsdtIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png';
const KwtIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/12313.png';
const OsmoLightIcon = 'https://assets.coingecko.com/coins/images/16724/large/osmo.png?1632763885';
const OsmoIcon = 'https://assets.coingecko.com/coins/images/16724/large/osmo.png?1632763885';
const UsdcIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png';
const ScOraiIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png';
const OraixIcon = 'https://assets.coingecko.com/coins/images/28104/standard/oraix.png?1696527113';
const MilkyIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/14418.png';
const TronIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png';
const ScAtomIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png';
const EthIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png';
const BnbIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png';
const InjIcon = 'https://s2.coinmarketcap.com/static/img/coins/64x64/7226.png';
const OraixLightIcon = 'https://assets.coingecko.com/coins/images/28104/standard/oraix.png?1696527113';

const tokenImg = [
  {
    coinGeckoId: 'airight',
    Icon: AiriIcon,
    IconLight: AiriIcon
  },
  {
    coinGeckoId: 'oraichain-token',
    Icon: OraiIcon,
    IconLight: OraiLightIcon
  },
  {
    coinGeckoId: 'tether',
    Icon: UsdtIcon,
    IconLight: UsdtIcon
  },
  {
    coinGeckoId: 'kawaii-islands',
    Icon: KwtIcon,
    IconLight: KwtIcon
  },
  {
    coinGeckoId: 'milky-token',
    Icon: MilkyIcon,
    IconLight: MilkyIcon
  },
  {
    coinGeckoId: 'cosmos',
    Icon: AtomIcon,
    IconLight: AtomIcon
  },
  {
    coinGeckoId: 'binancecoin',
    Icon: BnbIcon,
    IconLight: BnbIcon
  },
  {
    coinGeckoId: 'wbnb',
    Icon: BnbIcon,
    IconLight: BnbIcon
  },
  {
    coinGeckoId: 'injective-protocol',
    Icon: InjIcon,
    IconLight: InjIcon
  },
  {
    coinGeckoId: 'scatom',
    Icon: ScAtomIcon,
    IconLight: ScAtomIcon
  },
  {
    coinGeckoId: 'osmosis',
    Icon: OsmoIcon,
    IconLight: OsmoLightIcon
  },
  {
    coinGeckoId: 'ethereum',
    Icon: EthIcon,
    IconLight: EthIcon
  },
  {
    coinGeckoId: 'tron',
    Icon: TronIcon,
    IconLight: TronIcon
  },
  {
    coinGeckoId: 'usd-coin',
    Icon: UsdcIcon,
    IconLight: UsdcIcon
  },
  {
    coinGeckoId: 'scorai',
    Icon: ScOraiIcon,
    IconLight: ScOraiIcon
  },
  {
    coinGeckoId: 'oraidex',
    Icon: OraixIcon,
    IconLight: OraixLightIcon
  }
];

export default tokenImg;
