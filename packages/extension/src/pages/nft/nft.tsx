import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

const arrayTest = [
  {
    name: 'Monkey King',
    amount: '49145456',
    denom: 'orai',
    usd: '58.23',
    img: ''
  },
  {
    name: 'Bleed',
    amount: '49145456',
    denom: 'orai',
    usd: '58.23',
    img: ''
  },
  {
    name: 'The Empire State Building',
    amount: '49145456',
    denom: 'orai',
    usd: '58.23',
    img: ''
  }
];
export const NftPage: FunctionComponent = observer(() => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // code to fetch the token data and update state
  }, []);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <div>ERC-721</div>
        {arrayTest.map((t) => (
          <NftItem token={t} />
        ))}
      </div>
      <div>
        <div>ERC-1155</div>
      </div>
    </div>
  );
});

export const NftItem = (token) => {
  return (
    <div>
      <img src={token.image} alt={token.name} />
      <div>{token.name}</div>
      <div>{token.amount}</div>
      <div>{token.usd}</div>
    </div>
  );
};
