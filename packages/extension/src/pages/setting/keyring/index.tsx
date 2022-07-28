import React, { FunctionComponent, useState } from 'react';

import { HeaderLayout } from '../../../layouts';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';

import { useHistory } from 'react-router';
import { Button, Popover, PopoverBody } from 'reactstrap';

import style from './style.module.scss';
import { useLoadingIndicator } from '../../../components/loading-indicator';
import { PageButton } from '../page-button';
import { MultiKeyStoreInfoWithSelectedElem } from '@owallet/background';
import { FormattedMessage, useIntl } from 'react-intl';

export const SetKeyRingPage: FunctionComponent = observer(() => {
  const intl = useIntl();

  const { keyRingStore } = useStore();
  const history = useHistory();

  const loadingIndicator = useLoadingIndicator();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({ id: 'setting.keyring' })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div className={style.container}>
        <div className={style.innerTopContainer}>
          <div style={{ flex: 1 }} />
          <div className={style.addBtnWrap}>
            <Button
              color=""
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                analyticsStore.logEvent('Add additional account started');

                browser.tabs.create({
                  url: '/popup.html#/register'
                });
              }}
              className={style.addBtn}
            >
              <img
                src={require('../../../public/assets/svg/add-account.svg')}
                alt=""
                style={{ marginRight: '4px', width: 16, height: 16 }}
              />
              <span>
                <FormattedMessage id="setting.keyring.button.add" />
              </span>
            </Button>
          </div>
        </div>
        {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
          const bip44HDPath = keyStore.bip44HDPath
            ? keyStore.bip44HDPath
            : {
                account: 0,
                change: 0,
                addressIndex: 0
              };

          return (
            <PageButton
              key={i.toString()}
              title={`${
                keyStore.meta?.name
                  ? keyStore.meta.name
                  : intl.formatMessage({
                      id: 'setting.keyring.unnamed-account'
                    })
              } ${
                keyStore.selected
                  ? intl.formatMessage({
                      id: 'setting.keyring.selected-account'
                    })
                  : ''
              }`}
              paragraph={
                keyStore.type === 'ledger'
                  ? `Ledger - m/44'/118'/${bip44HDPath.account}'${
                      bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
                        ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
                        : ''
                    }`
                  : keyStore.meta?.email
                  ? keyStore.meta.email
                  : undefined
              }
              onClick={
                keyStore.selected
                  ? undefined
                  : async (e) => {
                      e.preventDefault();
                      loadingIndicator.setIsLoading('keyring', true);
                      try {
                        await keyRingStore.changeKeyRing(i);
                        analyticsStore.logEvent('Account changed');
                        loadingIndicator.setIsLoading('keyring', false);
                        history.push('/');
                      } catch (e) {
                        console.log(`Failed to change keyring: ${e.message}`);
                        loadingIndicator.setIsLoading('keyring', false);
                      }
                    }
              }
              style={keyStore.selected ? { cursor: 'default' } : undefined}
              icons={[
                <KeyRingToolsIcon key="tools" index={i} keyStore={keyStore} />
              ]}
              styleTitle={{
                fontWeight: 400,
                fontSize: 14
              }}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});

const KeyRingToolsIcon: FunctionComponent<{
  index: number;
  keyStore: MultiKeyStoreInfoWithSelectedElem;
}> = ({ index, keyStore }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const history = useHistory();

  const [tooltipId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `tools-${Buffer.from(bytes).toString('hex')}`;
  });

  return (
    <React.Fragment>
      <Popover
        target={tooltipId}
        isOpen={isOpen}
        toggle={toggleOpen}
        placement="bottom"
        className={style.popoverContainer}
        hideArrow
      >
        <PopoverBody
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            history.push('');
          }}
          className={style.popoverContainer}
        >
          {keyStore.type === 'mnemonic' || keyStore.type === 'privateKey' ? (
            <div
              className={style.popoverItem}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                history.push(`/setting/export/${index}?type=${keyStore.type}`);
              }}
            >
              <FormattedMessage
                id={
                  keyStore.type === 'mnemonic'
                    ? 'setting.export'
                    : 'setting.export.private-key'
                }
              />
            </div>
          ) : null}
          <div
            className={style.popoverItem}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              history.push(`/setting/keyring/change/name/${index}`);
            }}
          >
            <FormattedMessage id="setting.keyring.change.name" />
          </div>
          <div
            className={style.popoverItem}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              history.push(`/setting/clear/${index}`);
            }}
          >
            <FormattedMessage id="setting.clear" />
          </div>
        </PopoverBody>
      </Popover>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          padding: '0 8px',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          setIsOpen(true);
        }}
      >
        <i id={tooltipId} className="fas fa-ellipsis-h" />
      </div>
    </React.Fragment>
  );
};
