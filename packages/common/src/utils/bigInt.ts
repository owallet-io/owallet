import _BigInt from "big-integer";

export class MyBigInt {
  value;
  constructor(value) {
    if (value instanceof MyBigInt) {
      return value;
    } else {
      if (typeof value === "string" && value.startsWith("0x")) {
        this.value = _BigInt(value.substring(2), 16);
      } else {
        this.value = _BigInt(value);
      }
    }
    // Proxy method calls to _BigInt if possible
    return new Proxy(this, {
      get(obj, field) {
        if (field in obj) return obj[field];
        if (typeof obj.value !== "bigint" && field in obj.value)
          return obj.value[field].bind(obj.value);
        return undefined;
      },
    });
  }

  valueOf() {
    return this.value.valueOf();
  }

  equals(b) {
    if (typeof this.value === "bigint") {
      return this.value === b.value;
    } else if (b instanceof MyBigInt) {
      return this.value.equals(_BigInt(b.value));
    } else {
      return this.value.equals(_BigInt(b));
    }
  }

  toString() {
    return this.value.toString();
  }

  _toUint8ArrayNative(littleEndian = false, elements = 8) {
    const arr = new ArrayBuffer(elements);
    const view = new DataView(arr);
    view.setBigUint64(0, this.value, littleEndian);
    return new Uint8Array(arr);
  }

  _toUint8Array(littleEndian = false, elements = 8) {
    const arr = new ArrayBuffer(elements);
    const uint8arr = new Uint8Array(arr);
    const intarr = this.value.toArray(2 ** 8).value;
    if (littleEndian) uint8arr.set(intarr.reverse(), 0);
    else uint8arr.set(intarr, elements - intarr.length);
    return uint8arr;
  }

  toUint8Array(littleEndian = false, elements = 8) {
    if (typeof this.value === "bigint") {
      return this._toUint8ArrayNative(littleEndian, elements);
    } else {
      return this._toUint8Array(littleEndian, elements);
    }
  }

  /**
   * Get MyBigInt from a uint8 array in specified endianess.
   * Uses native MyBigInt if the environment supports it and detectSupport is true.
   *
   * @param {Uint8Array} uint8arr
   * @param {boolean} littleEndian use little endian byte order, default is false
   * @param {boolean} detectSupport auto-detect support for native MyBigInt, default is true
   */
  static fromUint8Array(uint8arr, littleEndian = false, detectSupport = true) {
    if (detectSupport) {
      const view = new DataView(uint8arr.buffer);
      return new MyBigInt(view.getBigUint64(0, littleEndian));
    }
    let array;
    if (littleEndian) {
      array = Array.from(uint8arr).reverse();
    } else {
      array = Array.from(uint8arr);
    }
    return new MyBigInt(_BigInt.fromArray(array, 2 ** 8));
  }
}
