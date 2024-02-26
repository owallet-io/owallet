declare module 'bip32-path' {
  export class BipPath {
    validatePathArray(path: number[]): boolean;
    validateString(path: string): boolean;
    toPathArray(): number[];
    toString(): string;
  }

  export function fromPathArray(path: number[]): BipPath;
  export function fromString(path: string): BipPath;
}
