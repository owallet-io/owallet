import { Guard } from '@owallet-wallet/router';
import { ExtensionGuards } from '@owallet-wallet/router-extension';

export class MockGuards {
  static readonly checkOriginIsValid: Guard =
    ExtensionGuards.checkOriginIsValid;

  static readonly checkMessageIsInternal: Guard =
    ExtensionGuards.checkMessageIsInternal;
}
