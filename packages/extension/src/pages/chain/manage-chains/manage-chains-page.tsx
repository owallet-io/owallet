import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import style from "./style.module.scss";

import {
  EmbedChainInfos,
  fetchRetry,
  limitString,
  unknownToken,
} from "@owallet/common";
import { useStore } from "src/stores";
// import {showToast} from "mobile/src/utils/helper";
import colors from "theme/colors";
import Switch from "react-switch";
import styles from "pages/home/components/style.module.scss";
import { toast } from "react-toastify";
import { SearchInput } from "pages/home/components/search-input";
import { LayoutWithButtonBottom } from "src/layouts";
import { OwEmpty } from "components/empty/ow-empty";
import { useLoadingIndicator } from "components/loading-indicator";
import { useHistory } from "react-router";

export const ManageChainsPage: FunctionComponent = observer(() => {
  const [chains, setChains] = useState([]);

  const [keyword, setKeyword] = useState("");
  const { chainStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [chainEnables, setChainEnables] = useState({});
  useEffect(() => {
    (async () => {
      try {
        loading.setIsLoading("manage-chains", true);
        const data = await fetchRetry(
          "https://keplr-chain-registry.vercel.app/api/chains"
        );
        if (!data.chains) return;
        const chainsFilter = data.chains.filter(
          (chain) =>
            !EmbedChainInfos.some(
              (embedChain) => embedChain.chainId === chain.chainId
            ) &&
            !/test|dev/i.test(chain?.chainName) &&
            !chain?.chainId.includes("eip155")
        );
        const sortedChains = chainsFilter.sort((a, b) => {
          const aHasChainInfo = chainInfoExists(a.chainId);
          const bHasChainInfo = chainInfoExists(b.chainId);
          // Sort: true comes first, false comes later
          return aHasChainInfo === bHasChainInfo ? 0 : aHasChainInfo ? -1 : 1;
        });

        setChains(sortedChains);
      } finally {
        loading.setIsLoading("manage-chains", false);
      }
    })();
  }, []);
  const onEnableOrDisableChain = useCallback(
    async (item) => {
      if (!chainEnables?.[item.chainId]) {
        try {
          await chainStore.addChain(item);
          setChainEnables((prev) => ({
            ...prev,
            [item.chainId]: true,
          }));
        } catch (e) {
          toast("This chain does not support enabling.", {
            type: "error",
          });
          console.log(e, "err add chain");
        }
      } else {
        try {
          await chainStore.removeChainInfo(item.chainId);
          setChainEnables((prev) => ({
            ...prev,
            [item.chainId]: false,
          }));
        } catch (e) {
          toast("Do not disable chain native from the config.", {
            type: "error",
          });
          console.log(e, "err removeChain chain");
        }
      }
    },
    [chainEnables]
  );
  // Create a function to check if the chainInfo exists
  const chainInfoExists = (chainId) => {
    try {
      if (!chainId.includes("eip155")) {
        const chainInfo = chainStore.getChain(chainId);
        return !!chainInfo; // Returns true if chainInfo exists, false otherwise
      } else {
        const [eip, chainNumber] = chainId.split(":");
        const hex = chainNumber === 1 ? "01" : Number(chainNumber).toString(16);
        const chainInfo = chainStore.getChain(`0x${hex}`);
        return !!chainInfo;
      }
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (!chains?.length) return;
    const chainInfoCheck = {};
    for (const chain of chains) {
      if (!chain?.chainId) continue;
      chainInfoCheck[chain.chainId] = chainInfoExists(chain.chainId);
    }
    setChainEnables(chainInfoCheck);
  }, [chains]);
  const loading = useLoadingIndicator();
  const renderChain = ({ item }) => {
    return (
      <div
        key={item?.chainId}
        onClick={() => onEnableOrDisableChain(item)}
        className={style.chainContainer}
      >
        <div className={style.chainInfo}>
          <div className={style.chainIcon}>
            <img
              className={style.chainIconImage}
              src={item?.chainSymbolImageUrl || unknownToken.coinImageUrl}
            />
          </div>
          <div className={style.wrapInfoChain}>
            <span className={style.titleChain}>
              {limitString(item?.chainName, 20)}
            </span>
            <span className={style.subTitleChain}>
              {item?.chainId?.includes("eip155") ? "Evm" : "Cosmos"}
            </span>
          </div>
        </div>

        <Switch
          onColor={colors["highlight-surface-active"]}
          uncheckedIcon={false}
          checkedIcon={false}
          height={20}
          width={35}
          onChange={() => {}}
          checked={chainEnables?.[item.chainId]}
        />
      </div>
    );
  };
  const dataChains = chains.filter((chain, index) =>
    chain.chainName?.toLowerCase().includes(keyword?.toLowerCase())
  );
  const history = useHistory();
  const onAddChain = () => {
    history.push(`/add-chain`);
    return;
  };
  return (
    <LayoutWithButtonBottom
      CustomRight={() => (
        <div onClick={onAddChain} className={style.wrapIcon}>
          <img
            className={style.imgIcon}
            src={require("assets/svg/tdesign_add_circle.svg")}
          />
        </div>
      )}
      isHideButtonBottom={true}
      title={"Manage chains"}
    >
      <div className={style.container}>
        <SearchInput
          containerClassNames={style.searchInput}
          onChange={(e) => {
            setKeyword(e.target.value);
          }}
          placeholder={"Search for by name"}
        />
        {dataChains?.length > 0 ? (
          dataChains.map((item, index) => {
            return renderChain({ item });
          })
        ) : (
          <div
            style={{
              height: "calc(100vh - 70px)",
            }}
          >
            <OwEmpty />
          </div>
        )}
      </div>
    </LayoutWithButtonBottom>
  );
});
