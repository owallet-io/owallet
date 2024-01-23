import React, { FunctionComponent, useState } from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import { useConfirm } from '../../components/confirm';
import { FormattedMessage, useIntl } from 'react-intl';
import { action, computed, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { BIP44HDPath } from '@owallet/types';

export class BIP44Option {
  @observable
  protected _coinType: number = 0;

  @observable
  protected _account: number = 0;

  @observable
  protected _change: number = 0;

  @observable
  protected _index: number = 0;

  constructor(coinType?: number) {
    this._coinType = coinType;

    makeObservable(this);
  }

  get coinType(): number | undefined {
    return this._coinType;
  }

  get account(): number {
    return this._account;
  }

  get change(): number {
    return this._change;
  }

  get index(): number {
    return this._index;
  }

  @computed
  get bip44HDPath(): BIP44HDPath {
    return {
      account: this.account,
      change: this.change,
      addressIndex: this.index,
      coinType: this.coinType
    };
  }

  @action
  setCoinType(coinType: number | undefined) {
    this._coinType = coinType;
  }

  @action
  setAccount(account: number) {
    this._account = account;
  }

  @action
  setChange(change: number) {
    this._change = change;
  }

  @action
  setIndex(index: number) {
    this._index = index;
  }
}

// CONTRACT: Use with `observer`
export const useBIP44Option = (coinType?: number) => {
  const [bip44Option] = useState(() => new BIP44Option(coinType));

  return bip44Option;
};

export const AdvancedBIP44Option: FunctionComponent<{
  bip44Option: BIP44Option;
}> = observer(({ bip44Option }) => {
  const intl = useIntl();

  const confirm = useConfirm();

  const [isOpen, setIsOpen] = useState(
    bip44Option.account !== 0 ||
      bip44Option.change !== 0 ||
      bip44Option.index !== 0 ||
      bip44Option.coinType !== undefined
  );
  const toggleOpen = async () => {
    if (isOpen) {
      if (
        await confirm.confirm({
          paragraph: intl.formatMessage({
            id: 'register.bip44.confirm.clear'
          }),
          styleParagraph: {
            color: '#A6A6B0'
          },
          yes: 'Yes',
          no: 'No',
          styleNoBtn: {
            background: '#F5F5FA',
            border: '1px solid #3B3B45',
            color: '#3B3B45'
          }
        })
      ) {
        setIsOpen(false);
        bip44Option.setAccount(0);
        bip44Option.setChange(0);
        bip44Option.setIndex(0);
        bip44Option.setCoinType(118);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <React.Fragment>
      <Button
        type="button"
        color="link"
        onClick={(e) => {
          e.preventDefault();
          toggleOpen();
        }}
        style={{ color: '#8f63ec', border: '1px solid #7664e4' }}
      >
        <FormattedMessage id="register.bip44.button.advanced" />
      </Button>
      <div style={{ height: 10 }} />
      {isOpen ? (
        <FormGroup>
          <Label target="bip44-path" className="form-control-label">
            <FormattedMessage id="register.bip44.input.hd-path" />
          </Label>
          <div
            id="bip44-path"
            style={{
              display: 'flex',
              alignItems: 'baseline'
            }}
          >
            {/* <div>{`m/44'/${
              bip44Option.coinType != null ? bip44Option.coinType : '···'
            }'/`}</div> */}
            <div>{`m/44’/`}</div>
            <Input
              type="number"
              className="form-control-alternative"
              style={{ maxWidth: '92px', textAlign: 'right' }}
              disabled={true}
              value={bip44Option.coinType != null ? bip44Option?.coinType?.toString() : 0}
              onChange={(e) => {
                e.preventDefault();

                let value = e.target.value;
                if (value) {
                  if (value.replace(/^0+/, '')) {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === '0') {
                        value = value.replace('0', '');
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (Number.isInteger(parsed) && parsed >= 0) {
                    bip44Option.setCoinType(parsed);
                  }
                } else {
                  bip44Option.setCoinType(undefined);
                }
              }}
            />
            <div>{`'/`}</div>
            <Input
              type="number"
              className="form-control-alternative"
              style={{ maxWidth: '92px', textAlign: 'right' }}
              value={bip44Option.account.toString()}
              onChange={(e) => {
                e.preventDefault();

                let value = e.target.value;
                if (value) {
                  if (value.replace(/^0+/, '')) {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === '0') {
                        value = value.replace('0', '');
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (Number.isInteger(parsed) && parsed >= 0) {
                    bip44Option.setAccount(parsed);
                  }
                } else {
                  bip44Option.setAccount(0);
                }
              }}
            />
            <div>{`'/`}</div>
            <Input
              type="number"
              className="form-control-alternative"
              style={{ maxWidth: '92px', textAlign: 'right' }}
              value={bip44Option.change.toString()}
              onChange={(e) => {
                e.preventDefault();

                let value = e.target.value;
                if (value) {
                  if (value.replace(/^0+/, '')) {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === '0') {
                        value = value.replace('0', '');
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (Number.isInteger(parsed) && (parsed === 0 || parsed === 1)) {
                    bip44Option.setChange(parsed);
                  }
                } else {
                  bip44Option.setChange(0);
                }
              }}
            />
            <div>/</div>
            <Input
              type="number"
              className="form-control-alternative"
              style={{ maxWidth: '92px', textAlign: 'right' }}
              value={bip44Option.index.toString()}
              onChange={(e) => {
                e.preventDefault();

                let value = e.target.value;
                if (value) {
                  if (value.replace(/^0+/, '')) {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === '0') {
                        value = value.replace('0', '');
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (Number.isInteger(parsed) && parsed >= 0) {
                    bip44Option.setIndex(parsed);
                  }
                } else {
                  bip44Option.setIndex(0);
                }
              }}
            />
          </div>
        </FormGroup>
      ) : null}
      <div style={{ height: 10 }} />
    </React.Fragment>
  );
});
