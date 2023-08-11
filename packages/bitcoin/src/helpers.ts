const bip39 = require('bip39');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip32 = require('bip32');
import { payments, Network } from 'bitcoinjs-lib';
import { defaultWalletShape, networks } from './networks';
const getKeyPair = ({
  selectedCrypto = 'bitcoin',
  keyDerivationPath = '84',
  addressIndex = 0,
  mnemonic
}: {
  selectedCrypto?: string;
  keyDerivationPath?: string;
  addressIndex?: number;
  mnemonic: string;
}): any => {
  const coinTypePath = defaultWalletShape.coinTypePath[selectedCrypto];
  const network = networks[selectedCrypto]; //Returns the network object based on the selected crypto.

  const root = bip32.fromSeed(bip39.mnemonicToSeedSync(mnemonic), network);
  const addressPath = `m/${keyDerivationPath}'/${coinTypePath}'/0'/0/${addressIndex}`;
  const keyPair = root.derivePath(addressPath);
  console.log("🚀 ~ file: helpers.ts:23 ~ addressPath:", addressPath)
  return keyPair;
};
const getAddress = (
  keyPair: any,
  network: Network | string,
  type: string = 'bech32'
): string => {
  try {
    if (typeof network === 'string' && network in networks) {
      network = networks[network];

      switch (type) {
        case 'bech32':
          // Get Native Bech32 (bc1) addresses
          return payments.p2wpkh({ pubkey: keyPair.publicKey })
            .address;
        case 'segwit':
          // Get Segwit P2SH Address (3)
          return payments.p2sh({
            redeem: payments.p2wpkh({ pubkey: keyPair.publicKey }),
            network
          }).address;
        case 'legacy':
          // Get Legacy Address (1)
          return payments.p2pkh({ pubkey: keyPair.publicKey }).address;
        default:
          return '';
      }
    }
  } catch (e) {
    return '';
  }
};
export { getKeyPair, getAddress };
