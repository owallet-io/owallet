import Transport from '@ledgerhq/hw-transport';
import { OWalletError } from '@owallet/router';
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrFailedSign,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected
} from './ledger-types';
import Trx from '@ledgerhq/hw-app-trx';
import { PubKeySecp256k1 } from '@owallet/crypto';
import { LedgerUtils } from '@utils/ledger';
import { SignTronInteractionStore } from '@owallet/stores-core';

export const handleTronPreSignByLedger = async (
  interactionData: NonNullable<SignTronInteractionStore['waitingData']>,
  signingMessage: string,
  getTransport: () => Promise<Transport>
): Promise<Uint8Array | undefined> => {
  const appData = interactionData.data.keyInsensitive;
  if (!appData) {
    throw new Error('Invalid ledger app data');
  }
  if (typeof appData !== 'object') {
    throw new Error('Invalid ledger app data');
  }
  if (!appData['bip44Path'] || typeof appData['bip44Path'] !== 'object') {
    throw new Error('Invalid ledger app data');
  }

  const bip44Path = appData['bip44Path'] as {
    account: number;
    change: number;
    addressIndex: number;
  };

  const publicKey = Buffer.from((appData['Tron'] as any)['pubKey'], 'hex');
  if (publicKey.length === 0) {
    throw new Error('Invalid ledger app data');
  }

  return connectAndSignTrxWithLedger(getTransport, publicKey, bip44Path, signingMessage);
};

export const connectAndSignTrxWithLedger = async (
  getTransport: () => Promise<Transport>,
  expectedPubKey: Uint8Array,
  bip44Path: {
    account: number;
    change: number;
    addressIndex: number;
  },
  message: string // raw tx hex
): Promise<Uint8Array> => {
  let transport: Transport;
  try {
    transport = await getTransport();
  } catch (e) {
    throw new OWalletError(ErrModuleLedgerSign, ErrFailedInit, 'Failed to init transport');
  }

  let trxApp = new Trx(transport);

  try {
    await trxApp.getAddress(`m/44'/195'/'0/0/0`);
  } catch (e) {
    // Device is locked
    if (e?.message.includes('(0x6b0c)')) {
      throw new OWalletError(ErrModuleLedgerSign, ErrCodeDeviceLocked, 'Device is locked');
    } else if (
      // User is in home sceen or other app.
      e?.message.includes('(0x6511)') ||
      e?.message.includes('(0x6e00)')
    ) {
      // Do nothing
    } else {
      await transport.close();

      throw e;
    }
  }

  transport = await LedgerUtils.tryAppOpen(transport, 'Tron');
  trxApp = new Trx(transport);

  try {
    let pubKey: PubKeySecp256k1;
    try {
      const res = await trxApp.getAddress(
        `m/44'/195'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
      );

      pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, 'hex'));
    } catch (e) {
      throw new OWalletError(ErrModuleLedgerSign, ErrFailedGetPublicKey, e.message || e.toString());
    }

    if (
      Buffer.from(new PubKeySecp256k1(expectedPubKey).toBytes()).toString('hex') !==
      Buffer.from(pubKey.toBytes()).toString('hex')
    ) {
      throw new OWalletError(ErrModuleLedgerSign, ErrPublicKeyUnmatched, 'Public key unmatched');
    }

    try {
      const trxSignature = await trxApp.signTransactionHash(
        `m/44'/195'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
        message
      );

      return Buffer.from(trxSignature, 'hex');
    } catch (e) {
      if (e?.message.includes('(0x6985)')) {
        throw new OWalletError(ErrModuleLedgerSign, ErrSignRejected, 'User rejected signing');
      }

      throw new OWalletError(ErrModuleLedgerSign, ErrFailedSign, e.message || e.toString());
    }
  } finally {
    await transport.close();
  }
};
