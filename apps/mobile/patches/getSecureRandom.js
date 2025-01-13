"use strict";
/**
 * Copyright (c) Whales Corp.
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecureRandomWords = exports.getSecureRandomBytes = void 0;
function getSecureRandomBytes(size) {
    const randomBytes = new Uint8Array(size);  
    window.crypto.getRandomValues(randomBytes);
    return randomBytes;
}
exports.getSecureRandomBytes = getSecureRandomBytes;
function getSecureRandomWords(size) {
    const bytes = getSecureRandomBytes(size * 2);
    // Create a new TypedArray that is of the same type as the given TypedArray but is backed with the
    // array buffer containing random bytes. This is cheap and copies no data.
    return new Uint16Array(bytes.buffer, bytes.byteOffset, size);
}
exports.getSecureRandomWords = getSecureRandomWords;
