---
title: Basic API
order: 1
---

## How to detect OWallet

You can determine whether OWallet is installed on the user device by checking `window.owallet`. If `window.owallet` returns `undefined` after document.load, OWallet is not installed. There are several ways to wait for the load event to check the status. Refer to the examples below:

You can register the function to `window.onload`:

```javascript
window.onload = async () => {
    if (!window.owallet) {
        alert("Please install owallet extension");
    } else {
        const chainId = "cosmoshub-4";

        // Enabling before using the OWallet is recommended.
        // This method will ask the user whether to allow access if they haven't visited this website.
        // Also, it will request that the user unlock the wallet if the wallet is locked.
        await window.owallet.enable(chainId);
    
        const offlineSigner = window.owallet.getOfflineSigner(chainId);
    
        // You can get the address/public keys by `getAccounts` method.
        // It can return the array of address/public key.
        // But, currently, OWallet extension manages only one address/public key pair.
        // XXX: This line is needed to set the sender address for SigningCosmosClient.
        const accounts = await offlineSigner.getAccounts();
    
        // Initialize the gaia api with the offline signer that is injected by OWallet extension.
        const cosmJS = new SigningCosmosClient(
            "https://lcd-cosmoshub.owallet.app",
            accounts[0].address,
            offlineSigner,
        );
    }
}
```

or track the document's ready state through the document event listener:

```javascript
async getOWallet(): Promise<OWallet | undefined> {
    if (window.owallet) {
        return window.owallet;
    }
    
    if (document.readyState === "complete") {
        return window.owallet;
    }
    
    return new Promise((resolve) => {
        const documentStateChange = (event: Event) => {
            if (
                event.target &&
                (event.target as Document).readyState === "complete"
            ) {
                resolve(window.owallet);
                document.removeEventListener("readystatechange", documentStateChange);
            }
        };
        
        document.addEventListener("readystatechange", documentStateChange);
    });
}
```

There may be multiple ways to achieve the same result, and no preferred method.

## OWallet-specific features

If you were able to connect OWallet with CosmJS, you may skip to the [Use OWallet with CosmJS](./cosmjs.md) section.

While OWallet supports an easy way to connect to CosmJS, there are additional functions specific to OWallet which provides additional features.

### Using with Typescript
**`window.d.ts`**
```javascript
import { Window as OWalletWindow } from "@owallet/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends OWalletWindow {}
}
```

The `@owallet/types` package has the type definition related to OWallet.  
If you're using TypeScript, run `npm install --save-dev @owallet/types` or `yarn add -D @owallet/types` to install `@owallet/types`.  
Then, you can add the `@owallet/types` window to a global window object and register the OWallet related types.

### Enable Connection

```javascript
enable(chainIds: string | string[]): Promise<void>
```

The `window.owallet.enable(chainIds)` method requests the extension to be unlocked if it's currently locked. If the user hasn't given permission to the webpage, it will ask the user to give permission for the webpage to access OWallet.

`enable` method can receive one or more chain-id as an array. When the array of chain-id is passed, you can request permissions for all chains that have not yet been authorized at once.

If the user cancels the unlock or rejects the permission, an error will be thrown.

### Get Address / Public Key

```javascript
getKey(chainId: string): Promise<{
    // Name of the selected key store.
    name: string;
    algo: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    bech32Address: string;
}>
```

If the webpage has permission and OWallet is unlocked, this function will return the address and public key in the following format:

```javascript
{
    // Name of the selected key store.
    name: string;
    algo: string;
    pubKey: Uint8Array;
    address: Uint8Array;
    bech32Address: string;
    isNanoLedger: boolean;
}
```

It also returns the nickname for the key store currently selected, which should allow the webpage to display the current key store selected to the user in a more convenient mane.  
`isNanoLedger` field in the return type is used to indicate whether the selected account is from the Ledger Nano. Because current Cosmos app in the Ledger Nano doesn't support the direct (protobuf) format msgs, this field can be used to select the amino or direct signer. [Ref](./cosmjs.md#types-of-offline-signers)

### Sign Amino

```javascript
signAmino(chainId: string, signer: string, signDoc: StdSignDoc): Promise<AminoSignResponse>
```

Similar to CosmJS `OfflineSigner`'s `signAmino`, but OWallet's `signAmino` takes the chain-id as a required parameter. Signs Amino-encoded `StdSignDoc`.

### Sign Direct / Protobuf

```javascript
signDirect(chainId:string, signer:string, signDoc: {
    /** SignDoc bodyBytes */
    bodyBytes?: Uint8Array | null;

    /** SignDoc authInfoBytes */
    authInfoBytes?: Uint8Array | null;

    /** SignDoc chainId */
    chainId?: string | null;

    /** SignDoc accountNumber */
    accountNumber?: Long | null;
  }): Promise<DirectSignResponse>
```

Similar to CosmJS `OfflineDirectSigner`'s `signDirect`, but OWallet's `signDirect` takes the chain-id as a required parameter. Signs Proto-encoded `StdSignDoc`.

### Request Transaction Broadcasting

```javascript
sendTx(
    chainId: string,
    stdTx: StdTx,
    mode: BroadcastMode
): Promise<Uint8Array>;
```

This function requests OWallet to delegates the broadcasting of the transaction to OWallet's LCD endpoints (rather than the webpage broadcasting the transaction).
This method returns the transaction hash if it succeeds to broadcast, if else the method will throw an error.
When OWallet broadcasts the transaction, OWallet will send the notification on the transaction's progress.

### Interaction Options

```javascript
export interface OWalletIntereactionOptions {
  readonly sign?: OWalletSignOptions;
}

export interface OWalletSignOptions {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;
}
```
OWallet v0.8.11+ offers additional options to customize interactions between the frontend website and OWallet extension.

If `preferNoSetFee` is set to true, OWallet will prioritize the frontend-suggested fee rather than overriding the tx fee setting of the signing page.

If `preferNoSetMemo` is set to true, OWallet will not override the memo and set fix memo as the front-end set memo.

You can set the values as follows:
```javascript
window.owallet.defaultOptions = {
    sign: {
        preferNoSetFee: true,
        preferNoSetMemo: true,
    }
}
```

## Custom event

### Change Key Store Event

```javascript
owallet_keystorechange
```

When the user switches their key store/account after the webpage has received the information on the key store/account the key that the webpage is aware of may not match the selected key in OWallet which may cause issues in the interactions.

To prevent this from happening, when the key store/account is changed, OWallet emits a `owallet_keystorechange` event to the webpage's window. You can request the new key/account based on this event listener.

```javascript
window.addEventListener("owallet_keystorechange", () => {
    console.log("Key store in OWallet is changed. You may need to refetch the account info.")
})
```
