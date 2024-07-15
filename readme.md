# OWallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/oraichain/owallet/blob/master/LICENSE.txt)
[![Twitter: OWallet](https://img.shields.io/twitter/follow/oraichain.svg?style=social)](https://twitter.com/oraichain)

## OWallet: Cosmos x EVM in one Wallet
OWallet is a secure, easy-to-use Web3 crypto wallet that empowers you to manage your digital assets with ease. OWallet supports both Cosmos-based and EVM-based networks, including Cosmos Hub, TRON, Oraichain, Osmosis, Ethereum, BNB Chain, and more.

OWallet is developed based on Keplr extension and currently maintained by Oraichain Labs.

## OWallet’s key features
 • Strategic Portfolio Management: Experience a seamless multi-chain and multi-account management interface. Conveniently manage multiple accounts from a single interface;
 • Multi-Chain Support: Seamlessly track and manage your crypto assets across multiple blockchains, including Oraichain, Bitcoin, Ethereum, BNB Chain, TRON, Injective, Oasis, Osmosis, Noble, and Stargaze;
 • IBC Transfers: Enable secure and efficient Inter-Blockchain Communication (IBC) transfers;
 • CW20 Tokens: Improved sending and receiving of CW20 standard fungible tokens based on CosmWasm;
 • CosmWasm Compatibility: Compatible with CosmWasm;
 • Ledger Support: Future support for Ledger hardware wallets;
 • Universal Wallet & Swap: Utilize a universal wallet for Bitcoin, EVM, Oraichain, and Cosmos-SDK blockchains. Swap assets seamlessly with the Universal Swap and Smart Routing powered by OBridge Technologies;
 • Mobile and Web Extension: Available on mobile apps and web extensions for greater accessibility.


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
yarn build 
or
yarn build:libs
```

4. Install Pod for iOS

```shell
cd packages/mobile/ios 
then
pod install
```

5. Run it

Get into mobile and run
## iOS
```shell
yarn ios
```

## Android
```shell
yarn android
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