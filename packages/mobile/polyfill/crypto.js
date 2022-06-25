const { randomBytes } = require('react-native-randombytes');

exports.randomBytes =
  exports.rng =
  exports.pseudoRandomBytes =
  exports.prng =
    randomBytes;

// implement window.getRandomValues(), for packages that rely on it
if (typeof window === 'object') {
  if (!window.crypto) window.crypto = {};
  if (!window.crypto.getRandomValues) {
    window.crypto.getRandomValues = function getRandomValues(arr) {
      let orig = arr;
      if (arr.byteLength != arr.length) {
        // Get access to the underlying raw bytes
        arr = new Uint8Array(arr.buffer);
      }
      const bytes = randomBytes(arr.length);
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i];
      }

      return orig;
    };
  }
}

exports.createHash = exports.Hash = require('create-hash');
exports.createHmac = exports.Hmac = require('create-hmac');

const hashes = [
  'sha1',
  'sha224',
  'sha256',
  'sha384',
  'sha512',
  'md5',
  'rmd160'
].concat(Object.keys(require('browserify-sign/algos')));
exports.getHashes = function () {
  return hashes;
};
exports.createECDH = require('create-ecdh');

// assign from other modules
Object.assign(
  exports,
  require('pbkdf2'),
  require('browserify-cipher'),
  require('diffie-hellman'),
  require('browserify-sign'),
  require('public-encrypt'),
  require('randomfill')
);
