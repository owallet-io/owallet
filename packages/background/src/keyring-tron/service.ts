import { ChainsService } from "../chains";
import { KeyRingService } from "../keyring";
import { InteractionService } from "../interaction";
import { ChainsUIService } from "../chains-ui";
import { ChainIdEVM, Key } from "@owallet/types";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { KeyRingTronBaseService } from "./keyring-base";
import {
  DEFAULT_FEE_LIMIT_TRON,
  EXTRA_FEE_LIMIT_TRON,
  getBase58Address,
  TronWebProvider,
} from "@owallet/common";
import { APP_PORT, Env } from "@owallet/router";
import { Int } from "@owallet/unit";
import { Bech32Address } from "@owallet/cosmos";

export class KeyRingTronService {
  constructor(
    protected readonly chainsService: ChainsService,
    public readonly keyRingService: KeyRingService,
    protected readonly interactionService: InteractionService,
    protected readonly chainsUIService: ChainsUIService,
    protected readonly msgPrivilegedOrigins: string[],
    protected readonly keyRingTronBaseService: KeyRingTronBaseService
  ) {}

  async init() {
    // TODO: ?
    // this.chainsService.addChainSuggestedHandler(
    //   this.onChainSuggested.bind(this)
    // );
  }

  async getKeySelected(chainId: string): Promise<Key> {
    return await this.getKey(this.keyRingService.selectedVaultId, chainId);
  }

  async getKey(vaultId: string, chainId: string): Promise<Key> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    const pubKey = await this.keyRingTronBaseService.getPubKey(
      chainId,
      vaultId
    );
    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    const address = pubKey.getEthAddress();

    const bech32Address = new Bech32Address(address);

    return {
      name: this.keyRingService.getKeyRingName(vaultId),
      algo: "ethsecp256k1",
      pubKey: pubKey.toBytes(),
      address,
      bech32Address: bech32Address.toBech32(
        chainInfo.bech32Config?.bech32PrefixAccAddr ?? ""
      ),
      ethereumHexAddress: bech32Address.toHex(true),
      isNanoLedger: keyInfo.type === "ledger",
      isKeystone: keyInfo.type === "keystone",
    };
  }

  async requestTronAddress(env: Env, origin: string): Promise<object> {
    const vaultId = this.keyRingService.selectedVaultId;
    const key = await this.getKey(vaultId, ChainIdEVM.TRON);
    const res = {
      name: key.name,
      hex: key.ethereumHexAddress,
      base58: getBase58Address(key.ethereumHexAddress),
    };

    return res;
  }

  async requestTriggerSmartContract(
    _: Env,
    chainId: string,
    data: {
      address: string;
      functionSelector: string;
      options: { feeLimit?: number };
      parameters;
      issuerAddress: string;
    }
  ): Promise<{
    result: any;
    transaction: {
      raw_data: any;
      raw_data_hex: string;
      txID: string;
      visible?: boolean;
    };
  }> {
    try {
      const chainInfo = await this.chainsService.getChainInfo(chainId);
      const tronWeb = TronWebProvider(chainInfo.rpc);

      const chainParameters = await tronWeb.trx.getChainParameters();

      const triggerConstantContract =
        await tronWeb.transactionBuilder.triggerConstantContract(
          data.address,
          data.functionSelector,
          {
            ...data.options,
            feeLimit: DEFAULT_FEE_LIMIT_TRON + Math.floor(Math.random() * 100),
          },
          data.parameters,
          data.issuerAddress
        );
      const energyFee = chainParameters.find(
        ({ key }) => key === "getEnergyFee"
      );
      const feeLimit = new Int(energyFee.value)
        .mul(new Int(triggerConstantContract.energy_used))
        .add(new Int(EXTRA_FEE_LIMIT_TRON));

      const triggerSmartContract =
        await tronWeb.transactionBuilder.triggerSmartContract(
          data.address,
          data.functionSelector,
          {
            ...data.options,
            feeLimit: feeLimit?.toString(),
            callValue: 0,
          },
          data.parameters,
          data.issuerAddress
        );

      return triggerSmartContract;
    } catch (error) {
      console.log(error, "error");
      throw error;
    }
  }

  async requestSendRawTransaction(
    _: Env,
    chainId: string,
    transaction: {
      raw_data: any;
      raw_data_hex: string;
      txID: string;
      visible?: boolean;
    }
  ) {
    try {
      const chainInfo = await this.chainsService.getChainInfo(chainId);
      const tronWeb = TronWebProvider(chainInfo.rpc);
      return await tronWeb.trx.sendRawTransaction(transaction);
    } catch (error) {
      throw error;
    }
  }

  async signTronSelected(
    env: Env,
    origin: string,
    chainId: string,
    data: string
  ): Promise<{
    signingData: Uint8Array;
    signature?: any;
  }> {
    return await this.signTron(
      env,
      origin,
      this.keyRingService.selectedVaultId,
      chainId,
      data
    );
  }

  async signTron(
    env: Env,
    origin: string,
    vaultId: string,
    chainId: string,
    data: string
  ): Promise<{
    signingData: Uint8Array;
    signature?: any;
  }> {
    const chainInfo = this.chainsService.getChainInfoOrThrow(chainId);
    if (chainInfo.hideInUI) {
      throw new Error("Can't sign for hidden chain");
    }
    const isTronChain = this.chainsService.isTronChain(chainId);

    if (!isTronChain) {
      throw new Error("Invalid Tron chain");
    }

    const keyInfo = this.keyRingService.getKeyInfo(vaultId);
    if (!keyInfo) {
      throw new Error("Null key info");
    }

    if (keyInfo.type === "ledger") {
      KeyRingCosmosService.throwErrorIfEthermintWithLedgerButNotSupported(
        chainId
      );
    }

    const key = await this.getKey(vaultId, chainId);

    return await this.interactionService.waitApproveV2(
      env,
      "/sign-tron",
      "request-sign-tron",
      {
        origin,
        chainId,
        pubKey: key.pubKey,
        data,
        keyInsensitive: keyInfo.insensitive,
      },
      async (res: { signingData: Uint8Array; signature?: any }) => {
        return await (async () => {
          if (keyInfo.type === "ledger" || keyInfo.type === "keystone") {
            if (!res.signature) {
              throw new Error("Frontend should provide signature");
            }

            return {
              signingData: res.signingData,
              signature: res.signature,
            };
          } else {
            const signature = await this.keyRingTronBaseService.sign(
              chainId,
              vaultId,
              data
            );
            return {
              signingData: res.signingData,
              signature: signature,
            };
          }
        })();
      }
    );
  }
}
