import { Dec } from './decimal';
import { Int } from './int';

export class DecUtils {
  public static trim(dec: Dec | string): string {
    let decStr = typeof dec === 'string' ? dec : dec.toString();

    if (decStr.indexOf('.') < 0) {
      return decStr;
    }

    for (let i = decStr.length - 1; i >= 0; i--) {
      if (decStr[i] === '0') {
        decStr = decStr.slice(0, i);
      } else {
        break;
      }
    }

    if (decStr.length > 0) {
      if (decStr[decStr.length - 1] === '.') {
        decStr = decStr.slice(0, decStr.length - 1);
      }
    }

    return decStr;
  }

  private static precisions: { [precision: string]: Dec } = {};

  public static getTenExponentN(n: number): Dec {
    if (n < -Dec.precision) {
      // Dec can only handle up to precision 18.
      // Anything less than 18 precision is 0, so there is a high probability of an error.
      throw new Error('Too little precision');
    }
    if (precision > 18) {
      throw new Error("Too much precision");
    }

    if (DecUtils.precisions[precision.toString()]) {
      return DecUtils.precisions[precision.toString()];
    }

    let dec = new Dec(1);

  public static getTenExponentNInPrecisionRange(n: number): Dec {
    if (n > Dec.precision) {
      throw new Error('Too much precision');
    }

    DecUtils.precisions[precision.toString()] = dec;
    return dec;
  }
}
