---
title: Use with SecretJs
order: 3
---

## How to detect OWallet
OWallet API may be undefined right after the webpage shown.
Please check the [How to detect OWallet](./README.md#how-to-detect-owallet) first before reading this section.

## Connecting with SecretJS

SecretJS link: [https://www.npmjs.com/package/secretjs](https://www.npmjs.com/package/secretjs)
The basics of using SecretJS is similar to CosmJS. Refer to the [Use with CosmJs](./cosmjs) section for more information.  
  
One difference between CosmJS and SecretJS is that we recommend using OWallet's `EnigmaUtils`.
By using OWallet's `EnigmaUtils`, you can use OWallet to encrypt/decrypt, and the decrypted transaction messages are shown to the user in a human-readable format.

```javascript
// Enabling before using the OWallet is recommended.
// This method will ask the user whether or not to allow access if they haven't visited this website.
// Also, it will request user to unlock the wallet if the wallet is locked.
await window.owallet.enable(chainId);

const offlineSigner = window.getOfflineSigner(chainId);
**const enigmaUtils = window.getEnigmaUtils(chainId);**

// You can get the address/public keys by `getAccounts` method.
// It can return the array of address/public key.
// But, currently, OWallet extension manages only one address/public key pair.
// XXX: This line is needed to set the sender address for SigningCosmosClient.
const accounts = await offlineSigner.getAccounts();

// Initialize the gaia api with the offline signer that is injected by OWallet extension.
const cosmJS = new SigningCosmWasmClient(
    "https://lcd-secret.owallet.app/rest",
    accounts[0].address,
    offlineSigner,
    **enigmaUtils**
);
```

### Suggest Adding SNIP-20 Tokens to OWallet

```javascript
async suggestToken(chainId: string, contractAddress: string): Promise<void>
```

The webpage can request the user permission to add a SNIP-20 token to OWallet's token list. Will throw an error if the user rejects the request.  
If a SNIP-20 with the same contract address already exists, nothing will happen.

### Get SNIP-20 Viewing Key
```javascript
getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
): Promise<string>;
```
Returns the viewing key of a SNIP-20 token registered in OWallet.  
If the SNIP-20 of the contract address doesn't exist, it will throw an error.

### Interaction Options
You can use OWallet native API’s to set interaction options even when using SecretJS. Please refer to [this section](./#interaction-options).
