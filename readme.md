# OWallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/oraichain/owallet/blob/master/LICENSE.txt)
[![Twitter: OWallet](https://img.shields.io/twitter/follow/oraichain.svg?style=social)](https://twitter.com/oraichain)

## OWallet: Cosmos x EVM in one Wallet
OWallet is a secure, easy-to-use Web3 crypto wallet that empowers you to manage your digital assets with ease. OWallet supports both Cosmos-based and EVM-based networks, including Cosmos Hub, TRON, Oraichain, Osmosis, Ethereum, BNB Chain, and more.

OWallet is developed based on Keplr extension and currently maintained by Oraichain Labs.

## OWallet’s key features
 - Strategic Portfolio Management: Experience a seamless multi-chain and multi-account management interface. Conveniently manage multiple accounts from a single interface;
 - Multi-Chain Support: Seamlessly track and manage your crypto assets across multiple blockchains, including Oraichain, Bitcoin, Ethereum, BNB Chain, TRON, Injective, Oasis, Osmosis, Noble, and Stargaze;
 - IBC Transfers: Enable secure and efficient Inter-Blockchain Communication (IBC) transfers;
 - CW20 Tokens: Improved sending and receiving of CW20 standard fungible tokens based on CosmWasm;
 - CosmWasm Compatibility: Compatible with CosmWasm;
 - Ledger Support: Future support for Ledger hardware wallets;
 - Universal Wallet & Swap: Utilize a universal wallet for Bitcoin, EVM, Oraichain, and Cosmos-SDK blockchains. Swap assets seamlessly with the Universal Swap and Smart Routing powered by OBridge Technologies;
 - Mobile and Web Extension: Available on mobile apps and web extensions for greater accessibility.


## Technical inquiries
- OWallet source code: https://github.com/oraichain/owallet
- Support ticket: https://orai.io/support
- OWallet website: https://owallet.dev
- Discord https://discord.gg/XdTVgzKc
- You can create a pull request to add your network

## Install
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
| rpc      | string | RPC of a blockchain |
| rest      | string      |   LCD of a blockchain |
| chainId      | string      |   Chain ID |
| chainName      | string      |  Chain Name |
| networkType      | `cosmos || evm`      |  `Network Type (cosmos || evm): To declare whether the network is Cosmos-based or Ethereum Virtual Machine (EVM)-based`  |
| stakeCurrency      | `{coinDenom: string, coinMinimalDenom: string, coinDecimals: number, coinGeckoId: string, coinImageUrl: string, gasPriceStep: { low: number, average: number, high: number}}` | Native stake currency
| bip44      | { coinType: number,}      |   Chain ID |

## How to add a chain into OWallet?

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
- iOS: https://apps.apple.com/app/owallet/id1626035069
- Android: https://play.google.com/store/apps/details?id=com.io.owallet 
- Chrome extension: https://chrome.google.com/webstore/detail/owallet/hhejbopdnpbjgomhpmegemnjogflenga

## License
```shell
/*
 * Copyright 2022 Oraichain Labs JSC.
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