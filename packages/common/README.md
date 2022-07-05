# Update config

Please use toChecksumAddress to map coinMinimalDenom correctly

```js
const keccak = require('keccak');

function toChecksumAddress(address) {
  const stripAddress = address.replace(/^0x/, '').toLowerCase();

  const keccakHash = keccak('keccak256').update(stripAddress).digest('hex');
  let checksumAddress = '0x';

  for (let i = 0; i < stripAddress.length; i++) {
    checksumAddress +=
      parseInt(keccakHash[i], 16) >= 8
        ? stripAddress[i].toUpperCase()
        : stripAddress[i];
  }

  return checksumAddress;
}


  toChecksumAddress('0x257a8d1e03d17b8535a182301f15290f11674b53');

```