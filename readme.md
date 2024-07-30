# OWallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/oraichain/owallet/blob/master/LICENSE.txt)
[![Twitter: OWallet](https://img.shields.io/twitter/follow/owallet_dev.svg?style=social)](https://twitter.com/owallet_dev)

- [OWallet](#owallet)
  - [Overviews](#overviews)
    - [OWallet: Universal gateway to Web3 in single native wallet](#owallet-universal-gateway-to-web3-in-single-native-wallet)
    - [OWallet’s key features](#owallets-key-features)
  - [Technical Overview](#technical-overview)
    - [Context Level](#context-level)
    - [Core Components Level](#core-components-level)
    - [On-chain History Backend Design](#on-chain-history-backend-design)
  - [Technical inquiries](#technical-inquiries)
  - [Install guide](#install-guide)
  - [Chain integration](#chain-integration)
  - [Contributing](#contributing)
  - [Release](#release)
  - [License](#license)

## Overviews

### OWallet: Universal gateway to Web3 in single native wallet
OWallet supports all web3 activities on most common liqudity networks, which are
- Bitcoin
- EVM-based: Ethereum, BNB Chain, Oasis / Oasis Sapphire
- Cosmos-based: Oraichain, Osmosis, Injective, Cosmos Hub...
- TVM-based: TRON network

### OWallet’s key features
- Supports multiple accounts  Bitcoin & Cosmos-based & EVM-based networks simultaneously
- Universal swap across various networks
- Portfolio management with cross-chain assets: Multi accounts, Send/Recieve, Price history...
- History of on-chain activities
- Friendly interface on transaction confirmation

## Technical Overview

### Context Level
![OWallet-Context](https://i.gyazo.com/cfd7f6b47445f76691339e7b1f80b69b.png)

### Core Components Level
![OWallet-Components](https://i.gyazo.com/4aedd5237de889a3603b68b1d24a6914.png)

### On-chain History Backend Design
![OWallet-HistoryBackend](https://i.gyazo.com/1f6f3b78dbd80843dafc54328570baef.png)

## Technical inquiries
- Source code: [https://github.com/oraichain/owallet](https://github.com/oraichain/owallet)
- Support ticket: [https://orai.io/support](https://orai.io/support)
- OWallet website: [https://owallet.dev](https://owallet.dev)
- Discord: [https://discord.gg/XdTVgzKc](https://discord.gg/XdTVgzKc)

You can create a pull request to add your network

## Install guide
1. Git clone this repo to desired directory

```shell
git clone https://github.com/oraichain/owallet
```

2. Install required packages

```shell
yarn
```

3. Build necessary packages

```shell
yarn build:libs
```

4. Build provider

```shell
cd packages/mobile && yarn build:provider
```

5. Install Pod for iOS

```shell
cd packages/mobile/ios && pod install
```

6. Run it

Get into packages/mobile and run
- iOS
```shell
yarn ios
```

- Android
```shell
yarn android
```

# Chain integration

## Chain config

| Property        | Type           | Function  |
| ------------- |:-------------:| -----:|
| rpc      | `string` | RPC of a blockchain |
| rest      | `string`      |   LCD of a blockchain |
| chainId      | `string`      |   Chain ID |
| chainName      | `string`      |  Chain Name |
| networkType      | `string`      |  Network Type `("cosmos" or "evm")`: To declare whether the network is Cosmos-based or Ethereum Virtual Machine (EVM)-based  |
| stakeCurrency      | `{coinDenom: string, coinMinimalDenom: string, coinDecimals: number, coinGeckoId: string, coinImageUrl: string, gasPriceStep: { low: number, average: number, high: number}}` | Native stake currency
| bip44      | `{ coinType: number}`      |  Bip44 config |
| coinType      | `number`      |   The coin type is usually 118 for Cosmos, 60 for EVM |
| bech32Config      | `Bech32Address.defaultBech32Config(string)`      |   Config for bech32 address |
| currencies      | `Array<Currency>`      |   Currencies of the chain |
| feeCurrencies      | `Array<Currency>`      |   Fee currencies of the chain |
| features      | `Array<Currency>`      |   To declare what features this chain have`(ex: ["ibc-transfer", "cosmwasm")])` |
| chainSymbolImageUrl      | `string`      |   Chain symbol image URL |
| txExplorer      | `{name: string, txUrl: string, accountUrl: string}` |   Transaction explorer config |


## How to add a chain into OWallet?
1. Clone this repo to desired directory

```shell
git clone https://github.com/oraichain/owallet
```

2. Checkout to main

```shell
git checkout main
```

3. Checkout to new branch

```shell
git checkout -b feat/add-new-chain-config
```

4. Create PR into main

#### If your chain needs to use special packages, please consider taking a look at the [CONTRIBUTING.md](Packages Usage) section to learn how to implement your chain into OWallet

## Example
```shell
{
    rpc: "https://rpc.ankr.com/eth",
    rest: "https://rpc.ankr.com/eth",
    chainId: "0x01",
    chainName: "Ethereum",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "ETH",
      coinMinimalDenom: "eth",
      coinDecimals: 18,
      coinGeckoId: "ethereum",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    networkType: "evm",
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "eth",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      },
      {
        coinDenom: "OCH",
        coinMinimalDenom:
          "erc20:0x19373EcBB4B8cC2253D70F2a246fa299303227Ba:OCH Token",
        contractAddress: "0x19373EcBB4B8cC2253D70F2a246fa299303227Ba",
        coinDecimals: 18,
        coinGeckoId: "och",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/34236/standard/orchai_logo_white_copy_4x-8_%281%29.png",
      },
      {
        coinDenom: "ORAI",
        coinMinimalDenom:
          "erc20:0x4c11249814f11b9346808179cf06e71ac328c1b5:Oraichain Token",
        contractAddress: "0x4c11249814f11b9346808179cf06e71ac328c1b5",
        coinDecimals: 18,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
      },
      {
        coinDenom: "ORAIX",
        coinMinimalDenom:
          "erc20:0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e:ORAIX Token",
        contractAddress: "0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e",
        coinDecimals: 18,
        coinGeckoId: "oraidex",
        coinImageUrl: "https://i.ibb.co/VmMJtf7/oraix.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Etherscan",
      txUrl: "https://etherscan.io/tx/{txHash}",
      accountUrl: "https://etherscan.io/address/{address}",
    },
  }
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Release
- [iOS](https://apps.apple.com/app/owallet/id1626035069)
- [Android](https://play.google.com/store/apps/details?id=com.io.owallet)
- [Chrome extension](https://chrome.google.com/webstore/detail/owallet/hhejbopdnpbjgomhpmegemnjogflenga)

## License
```shell
/*
 * Copyright 2022 Oraichain Labs Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at

 *      http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.

 * The repository (this work) includes work covered by the following copyright and permission notices:
 *
 *    Copyright 2020 Chainapsis, Inc
 *    Licensed under the Apache License, Version 2.0.
 *
 * NOTICE: The source code branch of Chainapsis Inc. under Apache 2.0 license:
 *  https://github.com/chainapsis/keplr-wallet/tree/0e137373ac4f526caf97b4694de47fe1ba543bd8
 */
```
Full text: [LICENSE.txt](LICENSE.txt)