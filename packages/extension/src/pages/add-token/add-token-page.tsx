import React, { useEffect, useState } from "react";
import { LayoutWithButtonBottom } from "layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./add-token.module.scss";
import { Input } from "components/form";
import { Bech32Address } from "@owallet/cosmos";
import { CW20Currency, ERC20Currency } from "@owallet/types";
import useForm from "react-hook-form";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { Form } from "reactstrap";
import { useStore } from "src/stores";
import { useInteractionInfo } from "@owallet/hooks";
import { useNotification } from "components/notification";
import { useLoadingIndicator } from "components/loading-indicator";
import { API, MapChainIdToNetwork, unknownToken } from "@owallet/common";
import { ModalNetwork } from "pages/home/modals/modal-network";
import Colors from "theme/colors";
import Web3 from "web3";

interface FormData {
  contractAddress: string;
}

export const AddTokenPage = observer(() => {
  const intl = useIntl();
  const history = useHistory();
  const [isShowNetwork, setIsShowNetwork] = useState(false);
  const onRequestCloseNetwork = () => {
    setIsShowNetwork(false);
  };
  const { chainStore, queriesStore, accountStore, tokensStore } = useStore();
  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const [coingeckoId, setCoingeckoId] = useState<string>("");
  const [coingeckoImg, setCoingeckoImg] = useState<string>("");
  const interactionInfo = useInteractionInfo(() => {
    // When creating the secret20 viewing key, this page will be moved to "/sign" page to generate the signature.
    // So, if it is creating phase, don't reject the waiting datas.
    if (accountInfo.isSendingMsg !== "createSecret20ViewingKey") {
      tokensStore.rejectAllSuggestedTokens();
    }
  });

  const { handleSubmit, watch, setValue, register, errors } = useForm<FormData>(
    {
      defaultValues: {
        contractAddress: "",
      },
    }
  );
  const contractAddress = watch("contractAddress");
  useEffect(() => {
    if (tokensStore.waitingSuggestedToken) {
      chainStore.selectChain(tokensStore.waitingSuggestedToken.data.chainId);
      if (
        contractAddress !==
        tokensStore.waitingSuggestedToken.data.contractAddress
      ) {
        setValue(
          "contractAddress",
          tokensStore.waitingSuggestedToken.data.contractAddress
        );
      }
    }
  }, [chainStore, contractAddress, tokensStore.waitingSuggestedToken]);

  const queries = queriesStore.get(chainStore.current.chainId);
  let query;
  if (chainStore.current.networkType === "cosmos") {
    query = queries.cosmwasm.querycw20ContractInfo;
  } else if (chainStore.current.networkType === "evm") {
    query = queries.evmContract.queryErc20ContractInfo;
  }
  const queryContractInfo = query.getQueryContract(contractAddress);
  const tokenInfo = queryContractInfo.tokenInfo;
  const notification = useNotification();
  const loadingIndicator = useLoadingIndicator();
  const getTokenCoingeckoId = async () => {
    try {
      if (tokenInfo && tokenInfo.symbol) {
        if (contractAddress && contractAddress !== "") {
          const res = await API.getTokenInfo({
            network: MapChainIdToNetwork[chainStore.current.chainId],
            tokenAddress: contractAddress,
          });
          const data = res.data;
          if (data && data.imgUrl) {
            setCoingeckoImg(data.imgUrl);
            setCoingeckoId(data.coingeckoId);
          } else {
            throw new Error("Image URL not found for the Coingecko ID.");
          }
        }
      }
    } catch (err) {
      console.log("getTokenCoingeckoId err", err);
    }
  };
  useEffect(() => {
    if (!tokenInfo?.decimals || !tokenInfo.name || !tokenInfo.symbol) {
      setCoingeckoImg("");
      setCoingeckoId("");
      return;
    }
    getTokenCoingeckoId();
  }, [tokenInfo, contractAddress]);
  const onSubmit = handleSubmit(async (data) => {
    if (tokenInfo?.decimals != null && tokenInfo.name && tokenInfo.symbol) {
      const currency: CW20Currency | ERC20Currency = {
        type: chainStore.current.networkType === "evm" ? "erc20" : "cw20",
        contractAddress: data.contractAddress,
        coinMinimalDenom: tokenInfo.name,
        coinDenom: tokenInfo.symbol,
        coinDecimals: tokenInfo.decimals,
        coinImageUrl: coingeckoImg || unknownToken.coinImageUrl,
        coinGeckoId: coingeckoId || "",
      };

      if (interactionInfo.interaction && tokensStore.waitingSuggestedToken) {
        await tokensStore.approveSuggestedToken(currency);
      } else {
        await tokensOf.addToken(currency);
      }
      notification.push({
        placement: "top-center",
        type: "success",
        duration: 2,
        content: "Add Token Success",
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });

      if (interactionInfo.interaction && !interactionInfo.interactionInternal) {
        window.close();
      } else {
        history.push({
          pathname: "/",
        });
      }
    }
  });
  return (
    <LayoutWithButtonBottom
      titleButton={"Import token"}
      onClickButtonBottom={onSubmit}
      title="Add Token"
    >
      <div className={styles.container}>
        <div className={styles.alert}>
          <img src={require("assets/svg/ow_error-circle.svg")} />
          <span className={styles.textAlert}>
            Before importing a token, ensure {"it's"} trustworthy to avoid scams
            and security risks.
          </span>
        </div>
        <div
          onClick={() => {
            setIsShowNetwork(true);
          }}
          className={styles.chainInfo}
        >
          <div className={styles.leftChain}>
            <img
              className={styles.imgChain}
              src={
                chainStore.current.stakeCurrency.coinImageUrl ||
                unknownToken.coinImageUrl
              }
            />
            <span className={styles.textChain}>
              {chainStore.current.chainName}
            </span>
          </div>
          <img
            className={styles.arrDown}
            src={require("assets/images/tdesign_chevron_down.svg")}
          />
        </div>
        <Form onSubmit={onSubmit}>
          <Input
            type="text"
            label={intl.formatMessage({
              id: "setting.token.add.contract-address",
            })}
            name="contractAddress"
            autoComplete="off"
            readOnly={tokensStore.waitingSuggestedToken != null}
            ref={register({
              required: "Contract address is required",
              //@ts-ignore
              validate: (value: string): string | undefined => {
                try {
                  if (chainStore.current.networkType === "cosmos") {
                    Bech32Address.validate(
                      value,
                      chainStore.current.bech32Config.bech32PrefixAccAddr
                    );
                  } else if (chainStore.current.networkType === "evm") {
                    if (
                      !Web3.utils.isAddress(
                        value,
                        Number(chainStore.current.chainId)
                      )
                    )
                      throw new Error("Invalid address");
                  }
                } catch {
                  return "Invalid address";
                }
              },
            })}
            error={
              errors.contractAddress
                ? errors.contractAddress.message
                : tokenInfo == null
                ? (queryContractInfo.error?.data as any)?.error ||
                  queryContractInfo.error?.message
                : undefined
            }
            text={
              queryContractInfo.isFetching ? (
                <i className="fas fa-spinner fa-spin" />
              ) : undefined
            }
          />
          <Input
            type="text"
            label={intl.formatMessage({
              id: "setting.token.add.name",
            })}
            value={tokenInfo?.name ?? "-"}
            readOnly={true}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            type="text"
            style={{
              color: Colors["neutral-text-body"],
            }}
            label={intl.formatMessage({
              id: "setting.token.add.symbol",
            })}
            value={tokenInfo?.symbol ?? "-"}
            readOnly={true}
          />
          <Input
            type="text"
            style={{
              color: Colors["neutral-text-body"],
            }}
            label={intl.formatMessage({
              id: "setting.token.add.decimals",
            })}
            value={tokenInfo?.decimals ?? "-"}
            readOnly={true}
          />
          <Input
            style={{
              color: Colors["neutral-text-body"],
            }}
            type="text"
            label={"Image"}
            value={coingeckoImg ?? "-"}
            readOnly={true}
          />
        </Form>
      </div>
      <ModalNetwork
        isHideAllNetwork={true}
        isOpen={isShowNetwork}
        onRequestClose={onRequestCloseNetwork}
      />
    </LayoutWithButtonBottom>
  );
});
