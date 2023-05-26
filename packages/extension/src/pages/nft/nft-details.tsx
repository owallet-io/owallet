import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './nft-details.module.scss';
import { HeaderLayout } from '../../layouts';
import { SelectChain } from '../../layouts/header';
import { Button, Card, CardBody } from 'reactstrap';
import { TokensView } from '../main/token';

const arr = [
  {
    txHash: 'EA4031...85E5B8',
    status: true,
    amount: 1138,
    denom: 'ORAI',
    time: 'Wed 28, 2023'
  },
  {
    txHash: 'EA4031...85E5B8',
    status: false,
    amount: 1138,
    denom: 'ORAI',
    time: 'Wed 28, 2023'
  },
  {
    txHash: 'EA4031...85E5B8',
    status: true,
    amount: 1138,
    denom: 'ORAI',
    time: 'Wed 28, 2023'
  }
];

export const NftDetailsPage: FunctionComponent = observer(() => {
  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <SelectChain showChainName canChangeChainInfo />
      <Card className={styles.card}>
        <div
          style={{
            width: '100%',
            padding: 16
          }}
        >
          <img src={require('./details.png')} alt={'details'} />
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              paddingTop: 16
            }}
          >
            Racter-To-Go
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 8,
              color: 'rgba(53, 57, 69, 1)'
            }}
          >
            <div
              style={{
                width: 60,
                height: 24,
                backgroundColor: '#F3F1F5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 4
              }}
            >
              <img src={require('./layer.png')} alt={'layer'} />
              <span style={{ fontSize: 16, paddingLeft: 4 }}>10</span>
            </div>
            <span
              style={{
                fontWeight: 600
              }}
            >
              49.14 ORAI
            </span>
          </div>
          <div
            style={{
              textAlign: 'right',
              paddingTop: 4,
              color: 'rgba(119, 126, 144, 1)',
              fontSize: 14
            }}
          >
            $58.23
          </div>
          <div
            style={{
              paddingTop: 10
            }}
          >
            <Button
              style={{
                width: '100%',
                border: '1px solid #7664E4'
              }}
              className={styles.button}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Transfer
            </Button>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <div
          style={{
            padding: 20
          }}
        >
          <div>Transactions list</div>
          {arr.map((e) => {
            return (
              <div
                style={{
                  paddingTop: 16
                }}
              >
                <div
                  style={{
                    backgroundColor: '#F3F1F5',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'rgba(95, 94, 119, 1)',
                    fontSize: 13
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{e.txHash}</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span>Send </span>
                      {e.status ? (
                        <img src={require('./check.png')} alt={'layer'} />
                      ) : (
                        <img src={require('./shape.png')} alt={'layer'} />
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span
                      style={{
                        color: e.status
                          ? 'rgba(75, 177, 12, 1)'
                          : 'rgba(239, 99, 99, 1)'
                      }}
                    >
                      {e.status ? '+ ' : '- '}
                      {e.amount} {e.denom}
                    </span>
                    <span>{e.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </HeaderLayout>
  );
});
