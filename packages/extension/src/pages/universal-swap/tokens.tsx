import React, { FunctionComponent, useEffect } from 'react';
import { HeaderLayout, LayoutHidePage } from '../../layouts';
import { Card, CardBody } from 'reactstrap';
import style from './token.module.scss';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

import { Input, InputGroup } from 'reactstrap';
import { useIntl } from 'react-intl';
import styleCoinInput from '../../components/form/coin-input.module.scss';

export const UniversalSwapPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, uiConfigStore, keyRingStore } = useStore();
  const { chainId } = chainStore.current;
  const accountInfo = accountStore.getAccount(chainId);

  return (
    <HeaderLayout showChainName canChangeChainInfo>
      {uiConfigStore.showAdvancedIBCTransfer && chainStore.current.features?.includes('ibc-transfer') ? (
        <>
          <InputGroup className={styleCoinInput.inputGroup}>
            <div
              style={{ padding: 7.5, textAlign: 'center', cursor: 'pointer' }}
              onClick={e => {
                e.preventDefault();
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 28,
                  backgroundColor: true ? '#7664E4' : '#f8fafc',
                  borderRadius: 4
                }}
              >
                <span
                  style={{
                    color: true ? 'white' : '#7664E4',
                    fontSize: 14
                  }}
                >
                  MAX
                </span>
              </div>
            </div>
            <Input
              className={classnames('form-control-alternative', styleCoinInput.input)}
              id={`input-${Math.random()}`}
              type="number"
              defaultValue={0}
              onChange={e => {
                e.preventDefault();
              }}
              min={0}
              autoComplete="off"
              placeholder={'Enter your amount'}
            />
          </InputGroup>
        </>
      ) : (
        <></>
      )}
    </HeaderLayout>
  );
});
