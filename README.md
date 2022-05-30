# Oraichain Wallet
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Twitter: Oraichain Wallet](https://img.shields.io/twitter/follow/owalletwallet.svg?style=social)](https://twitter.com/owalletwallet)

> Keplr is a browser extension wallet for the Inter blockchain ecosystem.
>
This repository is still under development  

This repository containts submodules that are not open sourced and are only available through the Chainapsis’ official Keplr Extension release. However, all primary features of the extension will work without the closed sourced submodules.  

> NOTE: We do not accept native integrations to the official releases through pull requests. Please feel free to check out OWallet's [suggest chain](https://docs.owallet.app/api/suggest-chain.html) feature for permissionless intergrations to your chain.

You can find the latest versions of the official managed releases on these links:
- [Browser Extension](https://chrome.google.com/webstore/detail/owallet/dmkamcknogkgcdfhhbddcghachkejeap)
- [IOS App](https://apps.apple.com/us/app/owallet-wallet/id1567851089)
- [Android App](https://play.google.com/store/apps/details?id=com.chainapsis.owallet)

For help using Oraichain Wallet, Visit our [User Support Site](https://owallet.crunch.help).

## Building browser extension locally
This repo uses git-secret to encrypt the endpoints and the api keys. **So, you can't build this without creating your own config file.** You should create your own `config.var.ts`, `config.ui.var.ts` files inside the `packages/extension/src` folder. Refer to the `config.var.example.ts`, ``config.ui.var.example.ts`` sample files to create your own configuration.

Clone this repo and run:
```sh
yarn bootstrap
yarn dev
```

You can add your chain by adding the chain infomation into `chain-info.ts`. 

This repo contains submodules that are not open sourced and are only available through the Chainapsis’ official OWallet Browser Extension release. However, all primary features of the extension will work without the closed sourced submodules.

Source code for moblie app is also placed in `packages/mobile`.

### Example
Refer to the [OWallet Example repository](https://github.com/chainapsis/owallet-example) for examples of how to integrate OWallet signing support for your web interface/application.

## Author

👤 **Chainapsis**

* Twitter: [@chainapsis](https://twitter.com/chainapsis)
* Github: [@chainapsis](https://github.com/chainapsis)
