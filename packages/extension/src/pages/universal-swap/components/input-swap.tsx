import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import classnames from 'classnames';
import styleCoinInput from '../../../components/form/coin-input.module.scss';
import style from '../swap.module.scss';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input, Label } from 'reactstrap';
import { observer } from 'mobx-react-lite';
import { FormattedMessage } from 'react-intl';
import { AmountDetails, CoinGeckoPrices, getTotalUsd, toDisplay, tokenMap } from '@owallet/common';
import { useStore } from '../../../stores';
import _debounce from 'lodash/debounce';

export const SwapInput: FunctionComponent<{
  tokens: any[];
  selectedToken: any;
  prices: CoinGeckoPrices<string>;
  balanceValue: number;
  amount: string;
  editable?: boolean;
  onChangeAmount: Function;
  setToken: Function;
}> = observer(({ tokens, selectedToken, prices, balanceValue, onChangeAmount, setToken, amount, editable = true }) => {
  const [randomId] = useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes).toString('hex');
  });

  const [inputAmount, setAmount] = useState('0');

  useEffect(() => {
    setAmount(amount);
  }, [amount]);

  const { universalSwapStore } = useStore();

  const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);

  const debounceFn = useCallback(_debounce(onChangeAmount, 500), []);

  return (
    <React.Fragment>
      <FormGroup>
        <div className={classnames('form-input-group', style.swapInputGroup)}>
          <div
            style={{ padding: 7.5, textAlign: 'center', cursor: 'pointer' }}
            onClick={e => {
              e.preventDefault();
            }}
          >
            <div
              style={{
                width: 90
              }}
            >
              <ButtonDropdown
                id={`selector-${randomId}`}
                className={classnames(styleCoinInput.tokenSelector, {
                  disabled: false
                })}
                isOpen={isOpenTokenSelector}
                toggle={() => setIsOpenTokenSelector(value => !value)}
                disabled={false}
              >
                <DropdownToggle caret>{selectedToken.name}</DropdownToggle>
                <DropdownMenu className={classnames(style.dropdown)}>
                  {tokens.map((token, index) => {
                    //@ts-ignore
                    const subAmounts = Object.fromEntries(
                      Object?.entries(universalSwapStore?.getAmount ?? {}).filter(
                        ([denom]) => tokenMap?.[denom]?.chainId === token.chainId
                      )
                    ) as AmountDetails;
                    const totalUsd = getTotalUsd(subAmounts, prices, token);

                    return (
                      <DropdownItem
                        key={token.denom + index}
                        active={false}
                        onClick={e => {
                          e.preventDefault();
                          setToken(token.denom);
                        }}
                      >
                        <div className={classnames(style.tokenItem)}>
                          <div>
                            <span>{token.name}</span>
                            <span>{`(${token.org})`}</span>
                          </div>
                          <span>
                            {toDisplay(universalSwapStore?.getAmount?.[token.denom], token.decimals)}
                            {`($${totalUsd.toFixed(2) ?? 0})`}
                          </span>
                        </div>
                      </DropdownItem>
                    );
                  })}
                </DropdownMenu>
              </ButtonDropdown>
            </div>
          </div>
          <Input
            className={classnames('form-control-alternative', styleCoinInput.input, styleCoinInput.right)}
            id={`input-${Math.random()}`}
            type="number"
            defaultValue={amount}
            disabled={!editable}
            onFocus={() => {
              if (!inputAmount || inputAmount === '0') {
                setAmount('');
              }
            }}
            value={inputAmount}
            onChange={e => {
              e.preventDefault();
              const newAmount = e.target.value.replace(/,/g, '.');
              setAmount(newAmount);
              debounceFn(newAmount);
            }}
            min={0}
            autoComplete="off"
            placeholder={'Enter your amount'}
          />
        </div>
      </FormGroup>
      <div className={style.legend}>
        <div className={style.label}>Balance :</div>
        <div style={{ minWidth: '16px' }} />
        <div className={style.value}>
          {balanceValue || 0.0} {selectedToken.name}
        </div>
      </div>
    </React.Fragment>
  );
});
