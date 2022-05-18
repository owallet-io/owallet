---
title: Use with CosmJs
order: 2
---

## How to detect OWallet
OWallet API may be undefined right after the webpage shown.
Please check the [How to detect OWallet](./README.md#how-to-detect-owallet) first before reading this section.

## Connecting with CosmJS

CosmJS link: [https://www.npmjs.com/package/@cosmjs/launchpad](https://www.npmjs.com/package/@cosmjs/launchpad), [https://www.npmjs.com/package/@cosmjs/stargate](https://www.npmjs.com/package/@cosmjs/stargate)

You can connect OWallet to CosmJS using the `OfflineSigner`.

```javascript
// Enabling before using the OWallet is recommended.
// This method will ask the user whether or not to allow access if they haven't visited this website.
// Also, it will request user to unlock the wallet if the wallet is locked.
await window.owallet.enable(chainId);

const offlineSigner = window.getOfflineSigner(chainId);

// You can get the address/public keys by `getAccounts` method.
// It can return the array of address/public key.
// But, currently, OWallet extension manages only one address/public key pair.
// XXX: This line is needed to set the sender address for SigningCosmosClient.
const accounts = await offlineSigner.getAccounts();

// Initialize the gaia api with the offline signer that is injected by OWallet extension.
const cosmJS = new SigningCosmosClient(
    "https://lcd-cosmoshub.owallet.app/rest",
    accounts[0].address,
    offlineSigner,
);
```

To get the `OfflineSigner`, you may use `owallet.getOfflineSigner(chainId)` or `window.getOfflineSigner(chainId)`. (`window.getOfflineSigner` is an alias that runs `owallet.getOfflineSigner` and returns the value)

The `window.owallet.enable(chainId)` method will request the user to unlock their OWallet extension if it's locked. If the user has not given permission to connect their extension to the website, it will first ask to connect the website.

If the user cancels the unlock or rejects the permission to connect, an error will be thrown.

If the extension is already unlocked and the website has permission to connect, no action will happen and resolve.

`window.owallet.enable(chainId)` is not mandatory. Even if the method wasn't called, if an API that requests access to OWallet is called the flow above will automatically run. However, it is recommended that `window.owallet.enable(chainId)` is first run.

## Types of Offline Signers

In CosmJS, there are two types of Signers: OfflineSigner and OfflineDirectSigner. OfflineSigner is used to sign SignDoc serialized with Amino in Cosmos SDK Launchpad (Cosmos SDK v0.39.x or below). OfflineDirectSigner is used to sign Protobuf encoded SignDoc.

OWallet supports both types of Signers. OWallet’s `owallet.getOfflineSigner(chainId)` or `window.getOfflineSigner(chainId)` returns a Signer that satisfies both the OfflineSigner and OfflineDirectSigner. Therefore, when using CosmJS with this Signer, Amino is used for Launchpad chains and Protobuf is used for Stargate chains.

However, if the msg to be sent is able to be serialized/deserialized using Amino codec you can use a signer for Amino. Also, as there are some limitations to protobuf type sign doc, there may be cases when Amino is necessary. For example, Protobuf formatted sign doc is currently not supported by Ledger Nano’s Cosmos app. Also, because protobuf sign doc is binary formatted, msgs not natively supported by OWallet may not be human-readable.

If you’d like to enforce the use of Amino, you can use the following APIs: `owallet.getOfflineSignerOnlyAmino(chainId)` or `window.getOfflineSignerOnlyAmino(chainId: string)`. Because this will always return an Amino compatible signer, any CosmJS requested msg that is Amino compatible will request an Amino SignDoc to OWallet.

Also, `window.getOfflineSignerAuto(chainId: string): Promise<OfflineSigner | OfflineDirectSigner>` or `window.getOfflineSignerAuto(chainId: string): Promise<OfflineSigner | OfflineDirectSigner>` API is supported. Please note that the value returned is async. This API automatically returns a signer that only supports Amino if the account is a Ledger-based account, and returns a signer that is compatible for both Amino and Protobuf if the account is a mnemonic/private key-based account. Because this API is affected by the type of the connected OWallet account, if [owallet_keystorechange](./README.md#change-key-store-event) event is used to detect account changes the signer must be changed using the API when this event has been triggered.

## Use with Stargate

OWallet's `OfflineSigner` implements the `OfflineDirectSigner` interface. Use `SigningStargateClient` with OWallet's `OfflineSigner`, and OWallet will sign the transaction in Proto sign doc format.

### Example
Refer to the [owallet-example](https://github.com/chainapsis/owallet-example/blob/master/src/main.js) repository for example code on how to integrate OWallet with CosmJS.

### Interaction Options
You can use OWallet native API’s to set interaction options even when using CosmJS. Please refer to [this section](./#interaction-options).

### Adding a custom blockchain to OWallet
If OWallet doesn't natively support your blockchain within the extension, please refer to the [Suggest chain](./suggest-chain.md#suggest-chain) section.
