import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './nft.module.scss';
import { useHistory } from 'react-router';

const arrayTest = [
  {
    name: 'Monkey King',
    amount: '1000',
    denom: 'orai',
    usd: '$58.23',
    img: ''
  },
  {
    name: 'Bleed',
    amount: '1000',
    denom: 'orai',
    usd: '58.23',
    img: ''
  },
  {
    name: 'Bleed',
    amount: '1000',
    denom: 'orai',
    usd: '58.23',
    img: ''
  }
  // {
  //   name: 'The Empire State Building',
  //   amount: '1000',
  //   denom: 'orai',
  //   usd: '58.23',
  //   img: ''
  // }
];
export const NftPage: FunctionComponent = observer(() => {
  const [token, setToken] = useState(null);
  const [isDetails, setIsDetails] = useState(false);
  const history = useHistory();
  useEffect(() => {
    // code to fetch the token data and update state
    setToken(arrayTest);
  }, []);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <div className={styles.label}>ERC-721</div>
        <div className={styles.list}>
          {/* {token.map((t) => {
            return <NftItem token={t} history={history} />;
          })} */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <img src={require('./no-data.png')} alt={'no-data'} />
          </div>
        </div>
      </div>
      <div style={{ height: 26 }} />
      <div>
        <div className={styles.label}>ERC-1155</div>
        <div className={styles.list}>
          {/* {token.map((t) => {
            return <NftItem token={t} history={history} />;
          })} */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <img src={require('./no-data.png')} alt={'no-data'} />
          </div>
        </div>
      </div>
    </div>
  );
});

export const NftItem = ({ token, history }) => {
  return (
    <div
      className={styles.card}
      onClick={() => history.push(`/token/${token.name}`)}
    >
      <div className={styles.img}>
        <img src={require('./image.png')} alt={token.name} />
      </div>
      <div className={styles.info}>
        <div>{token.name}</div>
        <div>
          {token.amount} {token.denom}
        </div>
        <div className={styles.usd}>{token.usd}</div>
      </div>
    </div>
  );
};
