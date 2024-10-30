import { ChainsService } from '../chains';
import { KeyRingService } from '../keyring';
import { InteractionService } from '../interaction';
import { ChainsUIService } from '../chains-ui';
import { Key } from '@owallet/types';
import { KeyRingCosmosService } from '../keyring-cosmos';
import { KeyRingTronBaseService } from './keyring-base';

export class KeyRingTronService {
  constructor(
    protected readonly chainsService: ChainsService,
    public readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly msgPrivilegedOrigins: string[],
    protected readonly keyRingTronBaseService: KeyRingTronBaseService,
    protected readonly keyRingCosmosService: KeyRingCosmosService
  ) {}

  async init() {
    // TODO: ?
    // this.chainsService.addChainSuggestedHandler(
    //   this.onChainSuggested.bind(this)
    // );
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return this.keyRingCosmosService.getKeySelected(chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    return this.keyRingCosmosService.getKey(vaultId, chainId);
  }
}
