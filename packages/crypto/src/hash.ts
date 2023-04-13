import { sha256 } from 'ethereum-cryptography/sha256';
import { keccak256 } from 'ethereum-cryptography/keccak';

export class Hash {
  static sha256(data: Uint8Array): Uint8Array {
    return sha256(data);
  }

  static keccak256(data: Uint8Array): Uint8Array {
    return keccak256(data);
  }

  static truncHashPortion(
    str: string,
    firstCharCount = str.length,
    endCharCount = 0
  ): string {
    return (
      str.substring(0, firstCharCount) +
      '…' +
      str.substring(str.length - endCharCount, str.length)
    );
  }
}
