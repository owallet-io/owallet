import React, { FunctionComponent } from "react";
import classnames from "classnames";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import style from "./chain-list.module.scss";
import { ChainInfoWithEmbed } from "@owallet/background";
import { useConfirm } from "../../components/confirm";
import { useIntl } from "react-intl";
import {
  COINTYPE_NETWORK,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import { useNotification } from "../../components/notification";

const ChainElement: FunctionComponent<{
  chainInfo: ChainInfoWithEmbed;
}> = observer(({ chainInfo }) => {
  const { chainStore, analyticsStore, keyRingStore, accountStore } = useStore();
  const selected = keyRingStore?.multiKeyStoreInfo?.find(
    (keyStore) => keyStore?.selected
  );
  const intl = useIntl();
  const confirm = useConfirm();
  const notification = useNotification();
  const handleUpdateChain = async () => {
    analyticsStore.logEvent("Chain changed", {
      chainId: chainStore.current.chainId,
      chainName: chainStore.current.chainName,
      toChainId: chainInfo.chainId,
      toChainName: chainInfo.chainName,
    });
    await keyRingStore.changeChain({
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      networkType: chainInfo.networkType,
      rpc: chainInfo?.rpc ?? chainInfo?.rest,
      // ...chainInfo
    });
    localStorage.setItem("initchain", chainInfo.chainId);
    chainStore.selectChain(chainInfo.chainId);
    chainStore.saveLastViewChainId();
  };
  const account = accountStore.getAccount(chainStore.current.chainId);
  return (
    <div
      className={classnames({
        [style.chainName]: true,
        selected: chainInfo.chainId === chainStore.current.chainId,
      })}
      onClick={async () => {
        if (chainInfo.chainId !== chainStore.current.chainId) {
          if (selected?.type === "ledger") {
            const [getDevicesHID] = await Promise.all([
              window.navigator.hid.getDevices(),
              // window.navigator.usb.getDevices()
            ]);
            if (getDevicesHID.length) {
              if (
                await confirm.confirm({
                  paragraph: `You are switching to ${
                    COINTYPE_NETWORK[
                      chainInfo.coinType ?? chainInfo.bip44.coinType
                    ]
                  } network. Please confirm that you have ${
                    COINTYPE_NETWORK[
                      chainInfo.coinType ?? chainInfo.bip44.coinType
                    ]
                  } App opened before switch network`,
                  styleParagraph: {
                    color: "#A6A6B0",
                  },
                  yes: "Yes",
                  no: "No",
                  styleNoBtn: {
                    background: "#F5F5FA",
                    border: "1px solid #3B3B45",
                    color: "#3B3B45",
                  },
                })
              ) {
                notification.push({
                  placement: "top-center",
                  type: "warning",
                  duration: 5,
                  content: `You are switching to ${
                    COINTYPE_NETWORK[
                      chainInfo.coinType ?? chainInfo.bip44.coinType
                    ]
                  } network. Please confirm that you have ${
                    COINTYPE_NETWORK[
                      chainInfo.coinType ?? chainInfo.bip44.coinType
                    ]
                  } App opened before switch network`,
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
                const { networkType } = chainStore.getChain(chainInfo?.chainId);
                const keyDerivation = (() => {
                  const keyMain = getKeyDerivationFromAddressType(
                    account.addressType
                  );
                  if (networkType === "bitcoin") {
                    return keyMain;
                  }
                  return "44";
                })();
                await keyRingStore.setKeyStoreLedgerAddress(
                  `${keyDerivation}'/${
                    chainInfo.bip44.coinType ?? chainInfo.coinType
                  }'/${selected.bip44HDPath.account}'/${
                    selected.bip44HDPath.change
                  }/${selected.bip44HDPath.addressIndex}`,
                  chainInfo.chainId
                );
                await handleUpdateChain();
              }
            } else {
              browser.tabs.create({
                url: `/popup.html#/confirm-ledger/${
                  COINTYPE_NETWORK[
                    chainInfo.bip44.coinType ?? chainInfo.coinType
                  ]
                }`,
              });
            }
            return;
          }
          await handleUpdateChain();
        }
      }}
    >
      {chainInfo.chainName}
      {!chainInfo.embeded &&
      chainStore.current.chainId !== chainInfo.chainId ? (
        <div className={style.removeBtn}>
          <i
            className="fas fa-times-circle"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                await confirm.confirm({
                  paragraph: intl.formatMessage(
                    {
                      id: "chain.remove.confirm.paragraph",
                    },
                    {
                      chainName: chainInfo.chainName,
                    }
                  ),
                  styleParagraph: {
                    color: "#A6A6B0",
                  },
                  yes: "Yes",
                  no: "No",
                  styleNoBtn: {
                    background: "#F5F5FA",
                    border: "1px solid #3B3B45",
                    color: "#3B3B45",
                  },
                })
              ) {
                await chainStore.removeChainInfo(chainInfo.chainId);
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
});

export const ChainList: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const mainChainList = chainStore.chainInfos;
  const betaChainList = chainStore.chainInfos.filter(
    (chainInfo) => chainInfo.beta && chainInfo.chainId != "Oraichain"
  );

  return (
    <div className={style.chainListContainer}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: "1px solid rgba(255, 255, 255)",
          }}
        />
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255)",
            margin: "0 8px",
          }}
        >
          EVM
        </div>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: "1px solid rgba(255, 255, 255)",
          }}
        />
      </div>
      {mainChainList.map(
        (chainInfo) =>
          chainInfo.networkType === "evm" && (
            <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
          )
      )}
      <div style={{ display: "flex", alignItems: "center" }}>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: "1px solid rgba(255, 255, 255)",
          }}
        />
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255)",
            margin: "0 8px",
          }}
        >
          Cosmos
        </div>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: "1px solid rgba(255, 255, 255)",
          }}
        />
      </div>
      {mainChainList.map(
        (chainInfo) =>
          chainInfo.networkType !== "evm" &&
          !chainInfo.beta && (
            <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
          )
      )}
      <div style={{ display: "flex", alignItems: "center" }}>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: "1px solid rgba(255, 255, 255)",
          }}
        ></hr>
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255)",
            margin: "0 8px",
          }}
        >
          Beta Support
        </div>
        <hr
          className="my-3"
          style={{
            flex: 1,
            borderTop: "1px solid rgba(255, 255, 255)",
          }}
        />
      </div>
      {betaChainList.map((chainInfo) => (
        <ChainElement key={chainInfo.chainId} chainInfo={chainInfo.raw} />
      ))}
    </div>
  );
});
