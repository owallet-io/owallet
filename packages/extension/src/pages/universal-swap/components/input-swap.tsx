import React, { FunctionComponent, useEffect, useState } from 'react';

import classnames from 'classnames';
import styleCoinInput from '../../../components/form/coin-input.module.scss';
import style from '../swap.module.scss';

import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input, Label } from 'reactstrap';
import { observer } from 'mobx-react-lite';
import { FormattedMessage, useIntl } from 'react-intl';

export const SwapInput: FunctionComponent<{ tokens: any[]; selectedToken: any }> = observer(
  ({ tokens, selectedToken }) => {
    const [randomId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return Buffer.from(bytes).toString('hex');
    });
    const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);
    const [currentToken, setToken] = useState(1);

    useEffect(() => {
      setToken(selectedToken);
    }, [selectedToken]);

    return (
      <React.Fragment>
        <FormGroup>
          <Label for={`selector-${randomId}`} className="form-control-label" style={{ width: '100%' }}>
            <FormattedMessage id="component.form.coin-input.token.label" />
          </Label>
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
                  <DropdownToggle caret>{selectedToken}</DropdownToggle>
                  <DropdownMenu className={classnames(style.dropdown)}>
                    {tokens.map(token => {
                      return (
                        <DropdownItem
                          key={token}
                          active={token === currentToken}
                          onClick={e => {
                            e.preventDefault();
                            setToken(token);
                          }}
                        >
                          <div className={classnames(style.tokenItem)}>
                            <span>{token}</span>
                            <span>Denom</span>
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
              defaultValue={0}
              onChange={e => {
                e.preventDefault();
              }}
              min={0}
              autoComplete="off"
              placeholder={'Enter your amount'}
            />
          </div>
        </FormGroup>
      </React.Fragment>
    );
  }
);
