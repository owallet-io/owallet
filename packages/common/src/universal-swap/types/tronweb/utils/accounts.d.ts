export function generateAccount(): {
    privateKey: string;
    publicKey: string;
    address: {
        base58: string;
        hex: string;
    };
};
export function generateRandom(options: any): {
    mnemonic: import("@ethersproject/hdnode").Mnemonic;
    privateKey: string;
    publicKey: string;
    address: string;
};
export function generateAccountWithMnemonic(mnemonic: any, path: any, wordlist?: string): {
    mnemonic: import("@ethersproject/hdnode").Mnemonic;
    privateKey: string;
    publicKey: string;
    address: string;
};
