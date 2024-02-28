import { KeyStore } from "../crypto";

export const mockKeyStorePbkdf2Ledger: KeyStore = {
  version: "1.2",
  type: "ledger",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "59cfeeb1626d58817efaaddfedcd69fc" },
    ciphertext:
      "ab2c01ebc8dc07b7a71e8a46cfdd2f0ffceadfb7fb283d7a2f0f780785279f01d49a989d4cb5206340d8527936f1144e7cf33ef2c92f1add7648c86357bfaa3c96c69a187ada634008744fa62fc22cb1bf3a5a67f458ab3797fcd6b0a45e5b93d1df97ba006489677de8279475c7054628616b214e61c441f013279c32110368ffb8",
    kdf: "pbkdf2",
    kdfparams: {
      salt: "2fba644184603574d748555250e23eb9a3a222e3ff1a9c703d1294c5ce3b1618",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "7d218b5b1b7b58e8632b15dd9820f75d4819a40dc8051e44035f64aad8e82633",
  },
  addresses: { cosmos: "cosmos1eu2ecyzedvkvsfcd5vfht4whgx3uf22fjj9a4n" },
};
export const mockKeyStoreSha256Ledger: KeyStore = {
  version: "1.2",
  type: "ledger",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "d370df887b4b99494e84403c42dab733" },
    ciphertext:
      "82d276a5c78f078b70dec548797941365dd05e4a020238487574257efe6fcad982b6077fb7385fcd1f803764ec2333a73e17eafef9ed43e98c5800b534b19d66636aa149cc5d2a9caf678f79cd0a851f799a98e492d38f0a89ebb11866fe6c2b4ed72705d51efa87e3467d7a314e15eb9c11c2c53408f78039ae1ed5d17a8cf76c6e",
    kdf: "sha256",
    kdfparams: {
      salt: "6c5c62b4f1c4a3c32e7f2e8dad16ac20dbdd9e5fc4153068889cb44eb38351e2",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "3dd5ee12675a24ff40948c198d5c20ec3d078773e2fa92c1211e50ea1b7edd62",
  },
  addresses: { cosmos: "cosmos1eu2ecyzedvkvsfcd5vfht4whgx3uf22fjj9a4n" },
};
export const mockKeyStoreScryptLedger: KeyStore = {
  version: "1.2",
  type: "ledger",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "d73ea9a449287bec8521ba66ac017225" },
    ciphertext:
      "a420e42bd04db4762a57ef1da7798b93930e96a8440db295a9f6827d0d345351e72b3ce2aaf1052a3b9d113ed0f1d6207e7e9a6396630b56f1a9d1617215a3680239ca8af236e986c229e98fd657fb155b7d9fec1f6e0d1402b51bbe4eaf55ba320f7773814fa5ed8fd447e3b7cfeec078d77308cdacb1ba9fd547445bea3cab6d09",
    kdf: "scrypt",
    kdfparams: {
      salt: "6346c4a22a8486a5fd5736199fd62a78f8aaf4755fec55c59bdaff1b8adb341f",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "de6417898134a4ac9b2124b0f8aa13250e7c3673d14a910a7f5dfb6fb8cb9c41",
  },
  addresses: { cosmos: "cosmos1eu2ecyzedvkvsfcd5vfht4whgx3uf22fjj9a4n" },
};
export const mockKeyStorePbkdf2PrivateKey: KeyStore = {
  version: "1.2",
  type: "privateKey",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "22e8fa659d4300f8f03b4c4dee969f49" },
    ciphertext:
      "73addd8bd3eaa4ba122209fb8664088e70c2333d9a48f9ac38bfbf7469f854c4e7011dd599553dadb56b57d5c67396923cf54b1c286232f81ed3de10b6d001a2",
    kdf: "pbkdf2",
    kdfparams: {
      salt: "00944e5b193aab750fe96b13ed6d2e7d7e1cc87b48310aeb40b3e695bdad43c6",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "0a7de7b54b270a7687318843d607cebe6ed841fd57578a82a85ac0c1d64e99e6",
  },
  addresses: undefined,
};
export const mockKeyStoreSha256PrivateKey: KeyStore = {
  version: "1.2",
  type: "privateKey",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "3d202c44da34f8cf00ace87de2bc49aa" },
    ciphertext:
      "3c716e178b60958fe067e811272789f11904ded45f16d9ae0f8b40ed72fbcac45eaf4d2b061df974d6eed8ec27c434fd0857f4b0023df012efd98891b4150c50",
    kdf: "sha256",
    kdfparams: {
      salt: "4326a78d5ec418d9c7eb5d30bece06da0e3808123cd57bd399a9ab700af4f33d",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "b02ee797c89da2a7f15740571434be44290140cb1abe583fc3a645b3a449c724",
  },
  addresses: undefined,
};
export const mockKeyStoreScryptPrivateKey: KeyStore = {
  version: "1.2",
  type: "privateKey",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "0d4ce42b903d128f8df229afb8cf4080" },
    ciphertext:
      "edf19e910d37e3b0bab8db7205899a77960abee4b810fd1c3760794a838f5cd2b27e8351022eefe39929d94c7634dbb919dc8a90dab7907d7a49b0a4a49301b2",
    kdf: "scrypt",
    kdfparams: {
      salt: "b1bff5bf9bfa491b861872de1e59071a92ccc7d19dcccc53828b565efbf24870",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "d9b684a86d046bfc3bebc9ee2666f11aa35fa50dea7404d0a1bc3e9d31e9c849",
  },
  addresses: undefined,
};
export const mockKeyStorePbkdf2Mnemonic: KeyStore = {
  version: "1.2",
  type: "mnemonic",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "167f8cd1a7e3d681953b986db8525f32" },
    ciphertext:
      "4359fb016c64b75fdae35808f5eb270b2407dcc13bb25c09edfa2f32309e16c9402cd3a3765f6c05132bc76f3177d8bf3622873138752eeb8962cbe2d99c4804ab641e3d49199a13833faa",
    kdf: "pbkdf2",
    kdfparams: {
      salt: "0946372928597c9af6a4a7b19d1856853e876179166bbd7f6e2b4bdab19e516d",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "86089b1cda6c4e2dd8aabea0c20cc243655309b1180fcf45cf5760e70a2b61e6",
  },
  addresses: undefined,
};
export const mockKeyStoreSha256Mnemonic: KeyStore = {
  version: "1.2",
  type: "mnemonic",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "8d1f68e7c186de526d2e420b75abc627" },
    ciphertext:
      "d4f8df7de1748bf2c76992aa626ed49fa6e7f15d7d85a4bc494988cbb4807022aab1a8ae56d6941ba5e8cbabfafa6401d1f2357a451f6dbadd24ab9e91aa645b9331ac4814d64729b51179",
    kdf: "sha256",
    kdfparams: {
      salt: "2fe79bd0fd4a9bbd6313a2077b0bf773d4d19214df0ad1f5ab5cd89aed555eea",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "42daf306c9ce1088d1ad51a9fdd79f486f9c51fb63c7c4357f94310e2069e4dc",
  },
  addresses: undefined,
};
export const mockKeyStoreScryptMnemonic: KeyStore = {
  version: "1.2",
  type: "mnemonic",
  coinTypeForChain: {},
  bip44HDPath: { coinType: 118, account: 0, change: 0, addressIndex: 0 },
  meta: { name: "orai", __id__: "1" },
  crypto: {
    cipher: "aes-128-ctr",
    cipherparams: { iv: "431ec027de120a4ddcb9d07f8f517958" },
    ciphertext:
      "674a0e79c561f7744766cd0703a4a6d11f1fcd31ebfd99beaf3af8aa24286ef714fe31c7f362a78cf8ebd8f6d369b54236c18a3edd0c5d85b7fcbcda6074ea3b17d4cfe447a8eeb31e2166",
    kdf: "scrypt",
    kdfparams: {
      salt: "f77b4032e4e8d320ad8dbaed9d213fd9a41fcf8a99819d28a132e9b2f66392d7",
      dklen: 32,
      n: 131072,
      r: 8,
      p: 1,
    },
    mac: "0562aeaf44a54bfc943dcc177cb8959d8bea507716d2e5d6bcb1e3f4f57e27f1",
  },
  addresses: undefined,
};
