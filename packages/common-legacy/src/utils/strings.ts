export const trimWordsStr = (str: string): string =>
  str.trim().replace(/\s{2,}/g, " ");

export const isPrivateKey = (str: string): boolean =>
  /(?:0x)?[0-9a-fA-F]{64}/.test(str);
