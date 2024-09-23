import { Env, Handler, InternalHandler, Message } from "@owallet/router";
import {
  getAddressFromBech32,
  bufferToHex,
  getNetworkTypeByChainId,
  getBase58Address,
} from "@owallet/common";
import {
  GetIsLockedMsg,
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  RequestSignAminoMsg,
  RequestSignEIP712CosmosTxMsg_v0,
  RequestSignDirectMsg,
  LockKeyRingMsg,
  DeleteKeyRingMsg,
  UpdateNameKeyRingMsg,
  ShowKeyRingMsg,
  SimulateSignTronMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg,
  AddLedgerKeyMsg,
  CreateLedgerKeyMsg,
  SetKeyStoreCoinTypeMsg,
  SetKeyStoreLedgerAddressMsg,
  RestoreKeyRingMsg,
  GetIsKeyStoreCoinTypeSetMsg,
  CheckPasswordMsg,
  ExportKeyRingDatasMsg,
  RequestVerifyADR36AminoSignDoc,
  RequestSignEthereumMsg,
  RequestSignEthereumTypedDataMsg,
  RequestSignReEncryptDataMsg,
  RequestSignDecryptDataMsg,
  RequestPublicKeyMsg,
  ChangeChainMsg,
  RequestSignTronMsg,
  RequestSendRawTransactionMsg,
  GetDefaultAddressTronMsg,
  RequestSignProxyReEncryptionDataMsg,
  RequestSignProxyDecryptionDataMsg,
  RequestSignBitcoinMsg,
  TriggerSmartContractMsg,
  RequestSignOasisMsg,
  GetKeySettledMsg,
} from "./messages";
import { KeyRingService } from "./service";
import { KeyRingStatus } from "./keyring";
import { Bech32Address } from "@owallet/cosmos";

import Long from "long";
import { SignDoc } from "@owallet/proto-types/cosmos/tx/v1beta1/tx";
export const getHandler: (service: KeyRingService) => Handler = (
  service: KeyRingService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetIsLockedMsg:
        return handleGetIsLockedMsg(service)(env, msg as GetIsLockedMsg);
      case RestoreKeyRingMsg:
        return handleRestoreKeyRingMsg(service)(env, msg as RestoreKeyRingMsg);
      case DeleteKeyRingMsg:
        return handleDeleteKeyRingMsg(service)(env, msg as DeleteKeyRingMsg);
      case UpdateNameKeyRingMsg:
        return handleUpdateNameKeyRingMsg(service)(
          env,
          msg as UpdateNameKeyRingMsg
        );
      case SimulateSignTronMsg:
        return handleSimulateSignTron(service)(env, msg as SimulateSignTronMsg);
      case ShowKeyRingMsg:
        return handleShowKeyRingMsg(service)(env, msg as ShowKeyRingMsg);
      case CreateMnemonicKeyMsg:
        return handleCreateMnemonicKeyMsg(service)(
          env,
          msg as CreateMnemonicKeyMsg
        );
      case AddMnemonicKeyMsg:
        return handleAddMnemonicKeyMsg(service)(env, msg as AddMnemonicKeyMsg);
      case CreatePrivateKeyMsg:
        return handleCreatePrivateKeyMsg(service)(
          env,
          msg as CreatePrivateKeyMsg
        );
      case AddPrivateKeyMsg:
        return handleAddPrivateKeyMsg(service)(env, msg as AddPrivateKeyMsg);
      case CreateLedgerKeyMsg:
        return handleCreateLedgerKeyMsg(service)(
          env,
          msg as CreateLedgerKeyMsg
        );
      case AddLedgerKeyMsg:
        return handleAddLedgerKeyMsg(service)(env, msg as AddLedgerKeyMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(service)(env, msg as LockKeyRingMsg);
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(service)(env, msg as UnlockKeyRingMsg);
      case GetKeyMsg:
        return handleGetKeyMsg(service)(env, msg as GetKeyMsg);
      case GetKeySettledMsg:
        return handleGetKeySettledMsg(service)(env, msg as GetKeySettledMsg);
      case RequestSignAminoMsg:
        return handleRequestSignAminoMsg(service)(
          env,
          msg as RequestSignAminoMsg
        );
      case RequestSignEIP712CosmosTxMsg_v0:
        return handleRequestSignEIP712CosmosTxMsg_v0(service)(
          env,
          msg as RequestSignEIP712CosmosTxMsg_v0
        );
      case RequestVerifyADR36AminoSignDoc:
        return handleRequestVerifyADR36AminoSignDoc(service)(
          env,
          msg as RequestVerifyADR36AminoSignDoc
        );
      case RequestSignDirectMsg:
        return handleRequestSignDirectMsg(service)(
          env,
          msg as RequestSignDirectMsg
        );
      case RequestSignEthereumMsg:
        return handleRequestSignEthereumMsg(service)(
          env,
          msg as RequestSignEthereumMsg
        );
      case RequestSignBitcoinMsg:
        return handleRequestSignBitcoinMsg(service)(
          env,
          msg as RequestSignBitcoinMsg
        );
      case RequestSignTronMsg:
        return handleRequestSignTronMsg(service)(
          env,
          msg as RequestSignTronMsg
        );
      case RequestSignOasisMsg:
        return handleRequestSignOasisMsg(service)(
          env,
          msg as RequestSignOasisMsg
        );
      case RequestSignEthereumTypedDataMsg:
        return handleRequestSignEthereumTypedData(service)(
          env,
          msg as RequestSignEthereumTypedDataMsg
        );
      case RequestPublicKeyMsg:
        return handleRequestPublicKey(service)(env, msg as RequestPublicKeyMsg);
      case RequestSignDecryptDataMsg:
        return handleRequestSignDecryptionData(service)(
          env,
          msg as RequestSignDecryptDataMsg
        );
      case RequestSignProxyDecryptionDataMsg:
        return handleRequestSignProxyDecryptionData(service)(
          env,
          msg as RequestSignDecryptDataMsg
        );
      case RequestSignProxyReEncryptionDataMsg:
        return handleRequestSignProxyReEncryptionData(service)(
          env,
          msg as RequestSignReEncryptDataMsg
        );
      case GetMultiKeyStoreInfoMsg:
        return handleGetMultiKeyStoreInfoMsg(service)(
          env,
          msg as GetMultiKeyStoreInfoMsg
        );
      case GetDefaultAddressTronMsg:
        return handleGetDefaultAddressMsg(service)(
          env,
          msg as GetDefaultAddressTronMsg
        );
      case RequestSendRawTransactionMsg:
        return handleSendRawTransactionMsg(service)(
          env,
          msg as RequestSendRawTransactionMsg
        );
      case TriggerSmartContractMsg:
        return handleTriggerSmartContractMsg(service)(
          env,
          msg as TriggerSmartContractMsg
        );
      case ChangeKeyRingMsg:
        return handleChangeKeyRingMsg(service)(env, msg as ChangeKeyRingMsg);
      case GetIsKeyStoreCoinTypeSetMsg:
        return handleGetIsKeyStoreCoinTypeSetMsg(service)(
          env,
          msg as GetIsKeyStoreCoinTypeSetMsg
        );
      case SetKeyStoreCoinTypeMsg:
        return handleSetKeyStoreCoinTypeMsg(service)(
          env,
          msg as SetKeyStoreCoinTypeMsg
        );
      case SetKeyStoreLedgerAddressMsg:
        return handleSetKeyStoreLedgerAddressMsg(service)(
          env,
          msg as SetKeyStoreLedgerAddressMsg
        );
      case CheckPasswordMsg:
        return handleCheckPasswordMsg(service)(env, msg as CheckPasswordMsg);
      case ExportKeyRingDatasMsg:
        return handleExportKeyRingDatasMsg(service)(
          env,
          msg as ExportKeyRingDatasMsg
        );
      case ChangeChainMsg:
        return handleChangeChainMsg(service)(env, msg as ChangeChainMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetIsLockedMsg: (
  service: KeyRingService
) => InternalHandler<GetIsLockedMsg> = (service) => {
  return () => {
    return service.keyRingStatus === KeyRingStatus.LOCKED;
  };
};

const handleRestoreKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<RestoreKeyRingMsg> = (service) => {
  return async (_env, _msg) => {
    return await service.restore();
  };
};

const handleDeleteKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<DeleteKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.deleteKeyRing(msg.index, msg.password);
  };
};

const handleUpdateNameKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<UpdateNameKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.updateNameKeyRing(msg.index, msg.name, msg?.email);
  };
};

const handleShowKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<ShowKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.showKeyRing(
      msg.index,
      msg.password,
      msg.chainId,
      msg.isShowPrivKey
    );
  };
};
const handleSimulateSignTron: (
  service: KeyRingService
) => InternalHandler<SimulateSignTronMsg> = (service) => {
  return async (_, msg) => {
    return await service.simulateSignTron(msg.msg);
  };
};

const handleCreateMnemonicKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreateMnemonicKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.createMnemonicKey(
      msg.kdf,
      msg.mnemonic,
      msg.password,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleAddMnemonicKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddMnemonicKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.addMnemonicKey(
      msg.kdf,
      msg.mnemonic,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleCreatePrivateKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreatePrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.createPrivateKey(
      msg.kdf,
      msg.privateKey,
      msg.password,
      msg.meta
    );
  };
};

const handleAddPrivateKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddPrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.addPrivateKey(msg.kdf, msg.privateKey, msg.meta);
  };
};

const handleCreateLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreateLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.createLedgerKey(
      env,
      msg.kdf,
      msg.password,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleAddLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    const result = await service.addLedgerKey(
      env,
      msg.kdf,
      msg.meta,
      msg.bip44HDPath
    );
    return result;
  };
};

const handleLockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<LockKeyRingMsg> = (service) => {
  return () => {
    return {
      status: service.lock(),
    };
  };
};

const handleUnlockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<UnlockKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return {
      status: await service.unlock(msg.password, msg.saving),
    };
  };
};
//@ts-ignore
const handleGetKeySettledMsg: (
  service: KeyRingService
) => InternalHandler<GetKeySettledMsg> = (service) => {
  return async (env, msg) => {
    const paramArray = msg.chainIds.map((chainId) =>
      handleGetKeyMsg(service)(env, { chainId } as GetKeyMsg)
    );
    const data = await Promise.allSettled(paramArray);
    return data;
  };
};

const handleGetKeyMsg: (
  service: KeyRingService
) => InternalHandler<GetKeyMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    const key = await service.getKey(msg.chainId);

    const networkType = getNetworkTypeByChainId(msg.chainId);

    // hereeee

    const isInj = msg.chainId?.startsWith("injective");
    const isBtc = msg.chainId?.startsWith("bitcoin");
    const pubkeyLedger = service.getKeyRingLedgerPubKey();
    const addressesLedger = service.getKeyRingLedgerAddresses();
    const bech32Address = new Bech32Address(key.address);

    const { bech32PrefixAccAddr } = (
      await service.chainsService.getChainInfo(msg.chainId)
    ).bech32Config;
    // hereee
    const bech32Convert =
      networkType === "bitcoin"
        ? bech32Address.toBech32Btc(bech32PrefixAccAddr)
        : bech32Address.toBech32(bech32PrefixAccAddr);

    return {
      name: service.getKeyStoreMeta("name"),
      algo: "secp256k1",
      pubKey: key.pubKey,
      address: key.address,
      bech32Address: (() => {
        if (isInj && key.isNanoLedger) {
          return pubkeyLedger && pubkeyLedger["eth"] ? bech32Convert : "";
        }
        if (isBtc && key.isNanoLedger) {
          return addressesLedger && addressesLedger["btc84"]
            ? addressesLedger["btc84"]
            : "";
        }
        return bech32Convert;
      })(),
      legacyAddress: key.legacyAddress ?? "",
      isNanoLedger: key.isNanoLedger,
    };
  };
};

const handleRequestSignAminoMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignAminoMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.requestSignAmino(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.signDoc,
      msg.signOptions
    );
  };
};

const handleRequestVerifyADR36AminoSignDoc: (
  service: KeyRingService
) => InternalHandler<RequestVerifyADR36AminoSignDoc> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.verifyADR36AminoSignDoc(
      msg.chainId,
      msg.signer,
      msg.data,
      msg.signature
    );
  };
};

const handleRequestSignDirectMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignDirectMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );
    console.log("msg.signDoc handleRequestSignDirectMsg", msg.signDoc);

    const signDoc = SignDoc.create({
      bodyBytes: msg.signDoc.bodyBytes,
      authInfoBytes: msg.signDoc.authInfoBytes,
      chainId: msg.signDoc.chainId,
      accountNumber: msg.signDoc.accountNumber
        ? Long.fromString(msg.signDoc.accountNumber)
        : undefined,
    });

    const response = await service.requestSignDirect(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      signDoc,
      msg.signOptions
    );

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        authInfoBytes: response.signed.authInfoBytes,
        chainId: response.signed.chainId,
        accountNumber: response.signed.accountNumber.toString(),
      },
      signature: response.signature,
    };
  };
};

const handleRequestSignEthereumTypedData: (
  service: KeyRingService
) => InternalHandler<RequestSignEthereumTypedDataMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignEthereumTypedData(
      env,
      msg.chainId,
      msg.data
    );
    return { result: response };
  };
};

const handleRequestPublicKey: (
  service: KeyRingService
) => InternalHandler<RequestPublicKeyMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestPublicKey(env, msg.chainId);
    return { result: JSON.stringify(response) };
  };
};

const handleRequestSignDecryptionData: (
  service: KeyRingService
) => InternalHandler<RequestSignProxyDecryptionDataMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignDecryptData(
      env,
      msg.chainId,
      msg.data
    );
    return { result: JSON.stringify(response) };
  };
};
const handleRequestSignEIP712CosmosTxMsg_v0: (
  service: KeyRingService
) => InternalHandler<RequestSignEIP712CosmosTxMsg_v0> = (service) => {
  return async (env, msg) => {
    return await service.requestSignEIP712CosmosTx_v0_selected(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.eip712,
      msg.signDoc,
      msg.signOptions
    );
  };
};
const handleRequestSignProxyDecryptionData: (
  service: KeyRingService
) => InternalHandler<RequestSignProxyDecryptionDataMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignProxyDecryptionData(
      env,
      msg.chainId,
      msg.data
    );
    return { result: JSON.stringify(response) };
  };
};

const handleGetDefaultAddressMsg: (
  service: KeyRingService
) => InternalHandler<GetDefaultAddressTronMsg> = (service) => {
  return async (_, msg) => {
    const key = await service.getKey(msg.chainId);
    const ledgerCheck = service.getKeyRingType();
    let base58 = getBase58Address(
      getAddressFromBech32(
        new Bech32Address(key.address).toBech32(
          (await service.chainsService.getChainInfo(msg.chainId)).bech32Config
            .bech32PrefixAccAddr
        )
      )
    );
    if (ledgerCheck === "ledger") {
      const ledgerAddress = service.getKeyRingLedgerAddresses();
      base58 = ledgerAddress?.trx;
    }
    return {
      name: service.getKeyStoreMeta("name"),
      type: Number(key.isNanoLedger),
      hex: bufferToHex(key.pubKey),
      base58,
    };
  };
};

const handleRequestSignProxyReEncryptionData: (
  service: KeyRingService
) => InternalHandler<RequestSignProxyReEncryptionDataMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignReEncryptData(
      env,
      msg.chainId,
      msg.data
    );

    return { result: JSON.stringify(response) };
  };
};

const handleRequestSignBitcoinMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignBitcoinMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignBitcoin(
      env,
      msg.chainId,
      msg.data
    );

    return { rawTxHex: response };
  };
};
const handleRequestSignEthereumMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignEthereumMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignEthereum(
      env,
      msg.chainId,
      msg.data
    );

    return { rawTxHex: response };
  };
};

const handleGetMultiKeyStoreInfoMsg: (
  service: KeyRingService
) => InternalHandler<GetMultiKeyStoreInfoMsg> = (service) => {
  return () => {
    return {
      multiKeyStoreInfo: service.getMultiKeyStoreInfo(),
    };
  };
};

const handleChangeKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<ChangeKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.changeKeyStoreFromMultiKeyStore(msg.index);
  };
};

const handleChangeChainMsg: (
  service: any
) => InternalHandler<ChangeChainMsg> = (service) => {
  return async (_, msg) => {
    return await service.changeChain(msg.chainInfos);
  };
};

const handleGetIsKeyStoreCoinTypeSetMsg: (
  service: KeyRingService
) => InternalHandler<GetIsKeyStoreCoinTypeSetMsg> = (service) => {
  return (_, msg) => {
    return service.getKeyStoreBIP44Selectables(msg.chainId, msg.paths);
  };
};

const handleSetKeyStoreCoinTypeMsg: (
  service: KeyRingService
) => InternalHandler<SetKeyStoreCoinTypeMsg> = (service) => {
  return async (_, msg) => {
    await service.setKeyStoreCoinType(msg.chainId, msg.coinType);
    return service.keyRingStatus;
  };
};

const handleSetKeyStoreLedgerAddressMsg: (
  service: KeyRingService
) => InternalHandler<SetKeyStoreLedgerAddressMsg> = (service) => {
  return async (env, msg) => {
    await service.setKeyStoreLedgerAddress(env, msg.bip44HDPath, msg.chainId);
    return service.keyRingStatus;
  };
};

const handleCheckPasswordMsg: (
  service: KeyRingService
) => InternalHandler<CheckPasswordMsg> = (service) => {
  return (_, msg) => {
    return service.checkPassword(msg.password);
  };
};

const handleExportKeyRingDatasMsg: (
  service: KeyRingService
) => InternalHandler<ExportKeyRingDatasMsg> = (service) => {
  return async (_, msg) => {
    return await service.exportKeyRingDatas(msg.password);
  };
};

const handleRequestSignTronMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignTronMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignTron(env, msg.chainId, msg.data);
    return response;
  };
};

const handleSendRawTransactionMsg: (
  service: KeyRingService
) => InternalHandler<RequestSendRawTransactionMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSendRawTransaction(
      env,
      msg.chainId,
      msg.data
    );
    return { ...response };
  };
};

const handleTriggerSmartContractMsg: (
  service: KeyRingService
) => InternalHandler<TriggerSmartContractMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestTriggerSmartContract(
      env,
      msg.chainId,
      msg.data
    );
    return { ...response };
  };
};

const handleRequestSignOasisMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignOasisMsg> = (service) => {
  return async (env, msg) => {
    const response = await service.requestSignOasis(env, msg.chainId, msg.data);
    return { ...response };
  };
};
