import React, { useEffect, useState } from "react";
import { LayoutWithButtonBottom } from "layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./add-token.module.scss";
import { Input } from "components/form";
import { Bech32Address } from "@owallet/cosmos";
import { AppCurrency, CW20Currency, ERC20Currency } from "@owallet/types";
import useForm from "react-hook-form";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { Form } from "reactstrap";
import { useStore } from "src/stores";
import { useInteractionInfo } from "@owallet/hooks";

import {
  API,
  avatarName,
  ChainIdEnum,
  fetchRetry,
  MapChainIdToNetwork,
  unknownToken,
} from "@owallet/common";
import { ModalNetwork } from "pages/home/modals/modal-network";
import Colors from "theme/colors";
import Web3 from "web3";
import { Text } from "components/common/text";
import { toast } from "react-toastify";
import { ModalConfirm } from "pages/home/modals/modal-confirm";
const getInfoToken = (info) => {
  if (
    !info ||
    info === "UNKNOWN" ||
    info === "https://i.ibb.co/vw91Zbj/Untitled-design-1.png" ||
    info === 0
  ) {
    return "";
  }
  return info;
};
interface FormData {
  contractAddress: string;
  symbol: string;
  decimals: string;
  image: string;
  name: string;
  coinGeckoId: string;
}

export const AddTokenPage = observer(() => {
  const intl = useIntl();
  const history = useHistory();
  const [isShowNetwork, setIsShowNetwork] = useState(false);
  const [isShowConfirm, setIsConfirm] = useState(false);
  const onRequestCloseNetwork = () => {
    setIsShowNetwork(false);
  };
  const onRequestModalConfirm = () => {
    setIsConfirm(false);
  };
  const { chainStore, queriesStore, accountStore, tokensStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const interactionInfo = useInteractionInfo(() => {
    // When creating the secret20 viewing key, this page will be moved to "/sign" page to generate the signature.
    // So, if it is creating phase, don't reject the waiting datas.
    if (accountInfo.isSendingMsg !== "createSecret20ViewingKey") {
      tokensStore.rejectAllSuggestedTokens();
    }
  });
  const { handleSubmit, watch, setValue, register, errors } =
    useForm<FormData>();
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
  const queryContractInfo = query?.getQueryContract(contractAddress);
  const tokenInfo = queryContractInfo?.tokenInfo;

  const getTokenCoingeckoId = async (contractAddressData) => {
    try {
      if (!contractAddressData || !tokenInfo?.symbol || !tokenInfo?.decimals)
        return;
      const res = await API.getTokenInfo({
        network: MapChainIdToNetwork[chainStore.current.chainId],
        tokenAddress: contractAddressData,
      });
      const data = res.data;
      if (data && data.imgUrl) {
        setValue("image", data.imgUrl);
        setValue("coinGeckoId", data.coingeckoId);
      } else {
        throw new Error("Image URL not found for the Coingecko ID.");
      }
    } catch (err) {
      console.log("getTokenCoingeckoId err", err);
    }
  };
  useEffect(() => {
    if (!contractAddress || !tokenInfo?.symbol || !tokenInfo?.decimals) return;
    setValue("symbol", tokenInfo?.symbol);
    setValue("decimals", tokenInfo?.decimals);
    setValue("name", tokenInfo?.name);
    getTokenCoingeckoId(contractAddress);
  }, [contractAddress, tokenInfo]);
  useEffect(() => {
    setValue("symbol", "");
    setValue("decimals", "");
    setValue("name", "");
    setValue("coinGeckoId", "");
    // setValue("contractAddress", "");
    setValue("image", "");
    if (!contractAddress || chainStore.current?.chainId !== "Oraichain") return;
    const urlCoinMinimalDenom = new URLSearchParams(contractAddress || "")
      .toString()
      .replace("=", "");

    fetchRetry(
      `https://oraicommon.oraidex.io/api/v1/tokens/${urlCoinMinimalDenom}`
    )
      .then((res) => {
        const { name, decimals, coinGeckoId, icon } = res || {};
        setValue("symbol", getInfoToken(name));
        setValue("decimals", getInfoToken(decimals ? `${decimals}` : ""));
        setValue("name", getInfoToken(name));
        setValue("coinGeckoId", getInfoToken(coinGeckoId));
        // setValue("contractAddress", getInfoToken(contractData || denom));
        setValue("image", getInfoToken(icon));
      })
      .catch((err) => {
        setValue("symbol", "");
        setValue("decimals", "");
        setValue("name", "");
        setValue("coinGeckoId", "");
        // setValue("contractAddress", "");
        setValue("image", "");
        return;
      });
  }, [contractAddress, chainStore.current?.chainId]);
  const onSubmit = handleSubmit(async (data) => {
    let currency: CW20Currency | ERC20Currency | AppCurrency = {
      type: chainStore.current.networkType === "evm" ? "erc20" : "cw20",
      contractAddress: data.contractAddress,
      coinMinimalDenom: `${
        chainStore.current.networkType === "evm" ? "erc20" : "cw20"
      }:${data.contractAddress}:${data.name}`,
      coinDenom: data.symbol,
      coinDecimals: Number(data.decimals),
      coinImageUrl:
        data.image ||
        avatarName.replace("{name}", data.symbol) ||
        unknownToken.coinImageUrl,
      coinGeckoId: data.coinGeckoId || unknownToken.coinGeckoId,
    };
    if (
      (data.contractAddress.startsWith("factory") ||
        data.contractAddress.startsWith("ibc")) &&
      chainStore.current.networkType == "cosmos"
    ) {
      currency = {
        coinMinimalDenom: data.contractAddress,
        coinDenom: data.symbol,
        coinDecimals: Number(data.decimals),
        coinImageUrl:
          data.image ||
          avatarName.replace("{name}", data.symbol) ||
          unknownToken.coinImageUrl,
        coinGeckoId: data.coinGeckoId || unknownToken.coinGeckoId,
      };
    }
    try {
      if (interactionInfo.interaction && tokensStore.waitingSuggestedToken) {
        await tokensStore.approveSuggestedToken(currency);
      } else {
        await tokensStore.addToken(chainStore.current.chainId, currency);
      }

      toast("Add Token Success", {
        type: "success",
      });
    } catch (e) {
      toast(e.message || JSON.stringify(e), {
        type: "error",
      });
    }

    if (interactionInfo.interaction && !interactionInfo.interactionInternal) {
      window.close();
    } else {
      history.push({
        pathname: "/",
      });
    }
  });

  return (
    <LayoutWithButtonBottom
      titleButton={"Import token"}
      onClickButtonBottom={handleSubmit(() => {
        if (!isShowConfirm) {
          setIsConfirm(true);
        }
      })}
      title="Add Token"
    >
      <div className={styles.container}>
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
                chainStore.current.chainSymbolImageUrl ||
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
        {chainStore.current.chainId !== ChainIdEnum.Bitcoin ? (
          <Form
            onSubmit={handleSubmit(() => {
              if (!isShowConfirm) {
                setIsConfirm(true);
              }
            })}
          >
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
                      if (
                        value.startsWith(
                          chainStore.current.bech32Config.bech32PrefixAccAddr
                        )
                      ) {
                        Bech32Address.validate(
                          value,
                          chainStore.current.bech32Config.bech32PrefixAccAddr
                        );
                      }
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
              error={errors.contractAddress?.message}
              // text={
              //     queryContractInfo?.isFetching ? (
              //         <i className="fas fa-spinner fa-spin"/>
              //     ) : undefined
              // }
            />
            <Input
              type="text"
              label={intl.formatMessage({
                id: "setting.token.add.name",
              })}
              readOnly={false}
              name="name"
              error={errors.name?.message}
              ref={register({
                required: "Name is required",
              })}
              placeHolder={"Ex: Orai Token"}
            />
            <Input
              type="text"
              label={intl.formatMessage({
                id: "setting.token.add.symbol",
              })}
              name={"symbol"}
              placeHolder={"Ex: ORAI"}
              readOnly={false}
              ref={register({
                required: "Symbol is required",
              })}
              error={errors.symbol?.message}
            />
            <Input
              type="text"
              label={intl.formatMessage({
                id: "setting.token.add.decimals",
              })}
              name={"decimals"}
              placeHolder={"Ex: 6"}
              ref={register({
                required: "Decimals is required",
              })}
              error={errors.decimals?.message}
              readOnly={false}
            />
            <Input
              type="text"
              label={"Image (Optional)"}
              readOnly={false}
              placeHolder={
                "Ex: https://assets.coingecko.com/coins/images/17980/standard/ton_symbol.png?1696517498"
              }
              name={"image"}
              ref={register({
                required: false,
              })}
              error={errors.image?.message}
            />
            <Input
              type="text"
              label={"Coingecko ID (Optional)"}
              readOnly={false}
              placeHolder={"Ex: max-2"}
              name={"coinGeckoId"}
              ref={register({
                required: false,
              })}
              error={errors.coinGeckoId?.message}
            />
          </Form>
        ) : (
          <Text>
            Add token <Text weight="600">{chainStore.current.chainName}</Text>{" "}
            not supported yet! Please try another network.
          </Text>
        )}
        {/*      <div className={styles.alert}>*/}
        {/*          <img src={require("assets/svg/ow_error-circle.svg")}/>*/}
        {/*          <div style={{*/}
        {/*              flexDirection: "column",*/}
        {/*              display: "flex"*/}
        {/*          }}>*/}
        {/*              <span className={styles.textAlert}>*/}
        {/*  • Before importing a token, ensure {"it's"} trustworthy to avoid scams*/}
        {/*  and security risks.*/}
        {/*</span>*/}
        {/*              <span className={styles.textAlert}>*/}
        {/*             • Please disable “Hide Dust” if the added token is not found.*/}
        {/*          </span>*/}
        {/*              <span className={styles.textAlert}>*/}
        {/*             • If the token has no amount, it will not be displayed.*/}
        {/*          </span>*/}
        {/*          </div>*/}
        {/*      </div>*/}
      </div>
      <ModalNetwork
        isHideAllNetwork={true}
        isOpen={isShowNetwork}
        onRequestClose={onRequestCloseNetwork}
      />
      <ModalConfirm
        onSubmit={onSubmit}
        isOpen={isShowConfirm}
        onRequestClose={onRequestModalConfirm}
        content={
          <div className={styles.alert}>
            <img src={require("assets/svg/ow_error-circle.svg")} />
            <div
              style={{
                flexDirection: "column",
                display: "flex",
              }}
            >
              <span className={styles.textAlert}>
                • Before importing a token, ensure {"it's"} trustworthy to avoid
                scams and security risks.
              </span>
              <span className={styles.textAlert}>
                • Please disable “Hide Dust” if the added token is not found.
              </span>
              <span className={styles.textAlert}>
                • If the token has no amount, it will not be displayed.
              </span>
            </div>
          </div>
        }
      />
    </LayoutWithButtonBottom>
  );
});
