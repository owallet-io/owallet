# OWallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/oraichain/owallet/blob/master/LICENSE.txt)
[![Twitter: OWallet](https://img.shields.io/twitter/follow/oraichain.svg?style=social)](https://twitter.com/oraichain)

## OWallet: Cosmos x EVM in one Wallet
OWallet supports both Cosmos-based and EVM-based networks including Cosmos Hub, Oraichain, Osmosis, Juno, Ethereum, BSC, and more.
OWallet is developed based on Keplr extension and currently maintained by Oraichain Labs.

## OWallet’s key features
- Support Cosmos-based and EVM-based networks
- Enable IBC transfer
- Improved sending and receiving of CW20 (standard fungible tokens based on Cosmwasm)
- Compatible with Cosmwasm v1

## Technical inquiries
- OWallet source code: https://github.com/oraichain/owallet
- Support ticket: https://orai.io/support
- OWallet website: https://owallet.dev
- Discord https://discord.gg/JNyFnU789b
- You can create a pull request to add your network

## Install
1. Git clone this repo to desired directory

```shell
git clone https://github.com/oraichain/owallet
```

2. Clone packages/background
    
    2.1. Delete packages/background
    
    2.2. Then execute folowing commands in terminal:
    ```shell
    git submodule add --force https://github.com/oraichain/owallet-background.git packages/background

    cd packages/background

    git checkout -b develop remotes/origin/develop
    ```

3. Install required packages
    
    3.1. Open package.json and modify version of **lerna**
    ```
    "lerna": "^6.6.2"
    ```
    
    3.2. Open lerna.json and add this line
    ```
    "useWorkspaces": true
    ```
    
    3.3. Run the below command
    ```shell
    yarn bootstrap
    ```

4. Build it
    `yarn build`
    
    When building for the first time, you may encouter the error. Do not worry, try to run `yarn build` again.
    
    And for the last package @owallet/extension, you should go directly into that package then `yarn build`

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