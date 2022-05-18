import { Window as OWalletWindow } from '@owallet-wallet/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends OWalletWindow {}
}
