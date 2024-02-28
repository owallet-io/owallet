import React, { FunctionComponent, useCallback } from 'react';

import { Address } from '../../components/address';
import { Address as Add } from '@owallet/crypto';
import styleAccount from './account.module.scss';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useNotification } from '../../components/notification';
import { useIntl } from 'react-intl';
import { WalletStatus } from '@owallet/stores';
import { ChainIdEnum, getKeyDerivationFromAddressType } from '@owallet/common';
import { Input, Label } from 'reactstrap';
import { AddressBtcType } from '@owallet/types';
import { useBIP44Option } from '../register/advanced-bip44';

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, keyRingStore } = useStore();
  const chainId = chainStore.current.chainId;
  const { networkType, bip44, coinType } = chainStore.current;
  const accountInfo = accountStore.getAccount(chainId);

  const intl = useIntl();
  const bip44Option = useBIP44Option();

  const addressDisplay = accountInfo.getAddressDisplay(keyRingStore.keyRingLedgerAddresses);

  const notification = useNotification();

  const copyAddress = useCallback(
    async (address: string) => {
      if (accountInfo.walletStatus === WalletStatus.Loaded) {
        await navigator.clipboard.writeText(address);
        notification.push({
          placement: 'top-center',
          type: 'success',
          duration: 2,
          content: intl.formatMessage({
            id: 'main.address.copied'
          }),
          canDelete: true,
          transition: {
            duration: 0.25
          }
        });
      }
    },
    [accountInfo.walletStatus, addressDisplay, notification, intl]
  );
  const onSwitchAddressType = (type: AddressBtcType) => {
    accountInfo.setAddressTypeBtc(type);
    const keyDerivation = (() => {
      const keyMain = getKeyDerivationFromAddressType(type);
      return keyMain;
    })();
    if (accountInfo.isNanoLedger) {
      const path = `${keyDerivation}'/${bip44.coinType ?? coinType}'/${bip44Option.bip44HDPath.account}'/${
        bip44Option.bip44HDPath.change
      }/${bip44Option.bip44HDPath.addressIndex}`;
      keyRingStore.setKeyStoreLedgerAddress(path, chainId);
    }
  };
  return (
    <div>
      <div className={styleAccount.containerName}>
        <div style={{ flex: 1 }} />
        <div className={styleAccount.name}>
          {accountInfo.walletStatus === WalletStatus.Loaded
            ? accountInfo.name ||
              intl.formatMessage({
                id: 'setting.keyring.unnamed-account'
              })
            : 'Loading...'}
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}></div>
      </div>
      {/* {(networkType === 'cosmos' || networkType === 'bitcoin') && ( */}
        <div className={styleAccount.containerAccount}>
          <div style={{ flex: 1 }} />
          <div className={styleAccount.address} onClick={() => copyAddress(addressDisplay)}>
            <span className={styleAccount.addressText}>
              <Address maxCharacters={22} lineBreakBeforePrefix={false}>
                {accountInfo.walletStatus === WalletStatus.Loaded && addressDisplay ? addressDisplay : '...'}
              </Address>
            </span>
            <div style={{ width: 6 }} />
            <img src={require('../../public/assets/img/filled.svg')} alt="filled" width={16} height={16} />
          </div>
          <div style={{ flex: 1 }} />
        </div>
      
      {networkType === 'bitcoin' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '10px 0px'
          }}
        >
          <Label check>
            <Input
              onClick={() => {
                onSwitchAddressType(AddressBtcType.Bech32);
              }}
              type="radio"
              name="bech32"
              checked={accountInfo.addressType === AddressBtcType.Bech32}
            />{' '}
            Segwit(Bech32)
          </Label>
          <Label check>
            <Input
              onClick={() => {
                onSwitchAddressType(AddressBtcType.Legacy);
              }}
              type="radio"
              name="legacy"
              checked={accountInfo.addressType === AddressBtcType.Legacy}
            />{' '}
            Bitcoin(LEGACY)
          </Label>
        </div>
      )}
      {chainId === ChainIdEnum.BitcoinTestnet && (
        <div className={styleAccount.coinType}>
          <a target="_blank" href="https://bitcoinfaucet.uo1.net/">
            BTC Testnet Faucet
          </a>
        </div>
      )}
    </div>
  );
});
