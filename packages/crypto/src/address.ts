import bs58 from 'bs58';
import { Hash } from './hash';
export class Address {
  static getEvmAddress(base58Address: string): string {
    return (
      '0x' +
      Buffer.from(bs58.decode(base58Address).slice(1, -4)).toString('hex')
    );
  }

  static getBase58Address(address: string): string {
    const evmAddress = Buffer.from('41' + address.slice(2), 'hex');
    const hash = Hash.sha256(Hash.sha256(evmAddress));
    const checkSum = Buffer.from(hash.slice(0, 4));
    return bs58.encode(Buffer.concat([evmAddress, checkSum]));
  }
}
