import React, { useState } from "react";
import { LayoutWithButtonBottom } from "layouts/button-bottom-layout/layout-with-button-bottom";
import styles from "./add-chain.module.scss";
import { Input } from "components/form";

import useForm from "react-hook-form";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { observer } from "mobx-react-lite";
import { Form } from "reactstrap";
import { useStore } from "src/stores";

import Colors from "theme/colors";

import { toast } from "react-toastify";
import { checkValidDomain, unknownToken } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";

import { simpleFetch } from "@owallet/simple-fetch";
import { useLoadingIndicator } from "components/loading-indicator";
import { StatusRpcResponse } from "@owallet/types";
interface IFormData {
  rpc: string;
  lcd: string;
  chainName: string;
  addressPrefix: string;
  coinMinimalDenom: string;
  coinSymbol: string;
  coinType: string;
  decimals: string;
  explorerUrl?: string;
  coinImageUrl: string;
  coinGeckoId?: string;
}

export const AddChainPage = observer(() => {
  const intl = useIntl();
  const history = useHistory();
  const { chainStore } = useStore();
  const { handleSubmit, getValues, register, errors } = useForm<IFormData>();
  const getChainId = async () => {
    const urlRpc = getValues()["rpc"];
    if (!urlRpc) return;
    const url = urlRpc.replace(/\/$/, "");
    if (checkValidDomain(url)) {
      try {
        const res = await simpleFetch<StatusRpcResponse>(`${url}/status`);
        const chainId = res.data?.result.node_info.network;
        if (!chainId) return;
        return chainId;
      } catch (e) {
        console.log(e, "err fetch rpc");
        return;
      }
    }
  };
  const loading = useLoadingIndicator();
  const onSubmit = handleSubmit(async () => {
    try {
      // setIsLoading(true);
      loading.setIsLoading("addChain", true);
      const chainId = await getChainId();
      if (!chainId) {
        toast("RPC not active", {
          type: "warning",
        });
        return;
      }
      const {
        rpc,
        lcd,
        chainName,
        explorerUrl,
        addressPrefix,
        coinImageUrl,
        coinType,
        decimals,
        coinSymbol,
        coinMinimalDenom,
        coinGeckoId,
      } = getValues();
      const infoConfig = {
        rpc: rpc,
        rest: lcd,
        chainId: chainId,
        chainName: chainName,
        chainSymbolImageUrl: coinImageUrl,
        stakeCurrency: {
          coinDenom: coinSymbol,
          coinMinimalDenom: coinMinimalDenom,
          coinDecimals: decimals,
          coinImageUrl: coinImageUrl,
          coinGeckoId: coinGeckoId || unknownToken.coinGeckoId,
        },
        bip44: {
          coinType: coinType,
        },
        coinType: coinType,
        bech32Config: Bech32Address.defaultBech32Config(addressPrefix),
        get currencies() {
          return [this.stakeCurrency];
        },
        get feeCurrencies() {
          return [this.stakeCurrency];
        },
        features: ["no-legacy-stdTx"],
        txExplorer: {
          name: "Scan",
          txUrl: explorerUrl
            ? `${explorerUrl?.replace(/\/$/, "")}/{txHash}`
            : "",
          accountUrl: "",
        },
        // beta: true // use v1beta1
      };

      await chainStore.addChain(infoConfig);
      toast("Add chain success", {
        type: "success",
      });
      history.push("/");
      return;
    } catch (e) {
      console.log(e, "errr");
    } finally {
      // setIsLoading(false);
      loading.setIsLoading("addChain", false);
    }
  });
  return (
    <LayoutWithButtonBottom
      titleButton={intl.formatMessage({
        id: "setting.token.add.button.submit",
      })}
      onClickButtonBottom={onSubmit}
      title={intl.formatMessage({
        id: "setting.chain.add",
      })}
    >
      <div className={styles.container}>
        <div className={styles.alert}>
          <img src={require("assets/svg/ow_error-circle.svg")} />
          <span className={styles.textAlert}>
            Before importing a chain, ensure {"it's"} trustworthy to avoid scams
            and security risks.
          </span>
        </div>
        <Form onSubmit={onSubmit}>
          <Input
            type="text"
            label={intl.formatMessage({
              id: "setting.chain.add.network-type",
            })}
            readOnly={true}
            value={"Cosmos"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            type="text"
            label={intl.formatMessage({
              id: "setting.chain.add.rpc",
            })}
            ref={register({
              required: "RPC is required",
            })}
            name="rpc"
            error={errors.rpc?.message}
            placeholder={"Ex: https://rpc.orai.io"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            ref={register({
              required: "LCD is required",
            })}
            type="text"
            error={errors.lcd?.message}
            label={intl.formatMessage({
              id: "setting.chain.add.lcd",
            })}
            name={"lcd"}
            placeholder={"Ex: https://lcd.orai.io"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            ref={register({
              required: "Chain Name is required",
            })}
            error={errors.chainName?.message}
            type="text"
            label={intl.formatMessage({
              id: "setting.chain.add.name",
            })}
            name={"chainName"}
            placeholder={"Ex: Oraichain Testnet"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            type="text"
            error={errors.addressPrefix?.message}
            label={intl.formatMessage({
              id: "setting.chain.add.address-prefix",
            })}
            ref={register({
              required: "Address Prefix is required",
            })}
            placeholder={"Ex: orai"}
            name={"addressPrefix"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            error={errors.coinMinimalDenom?.message}
            type="text"
            ref={register({
              required: "Coin Minimal Denom is required",
            })}
            name="coinMinimalDenom"
            label={intl.formatMessage({
              id: "setting.chain.add.coin-minimal-denom",
            })}
            placeholder={"Ex: orai"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            error={errors.coinSymbol?.message}
            ref={register({
              required: "Symbol is required",
            })}
            type="text"
            label={intl.formatMessage({
              id: "setting.chain.add.symbol",
            })}
            name={"coinSymbol"}
            placeholder={"Ex: ORAI"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            error={errors.decimals?.message}
            ref={register({
              required: "Decimal is required",
            })}
            type="text"
            label={intl.formatMessage({
              id: "setting.chain.add.decimals",
            })}
            name={"decimals"}
            placeholder={"Ex: 6"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            error={errors.coinType?.message}
            ref={register({
              required: "Coin Type is required",
            })}
            type="text"
            label={intl.formatMessage({
              id: "setting.chain.add.coin-type",
            })}
            name={"coinType"}
            placeholder={"Ex: 118"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            type="text"
            error={errors.explorerUrl?.message}
            label={`${intl.formatMessage({
              id: "setting.chain.add.explorer",
            })} (Optional)`}
            ref={register({
              required: false,
            })}
            name={"explorerUrl"}
            placeholder={"Ex: https://scan.orai.io/txs"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            type="text"
            error={errors.coinGeckoId?.message}
            label={`${intl.formatMessage({
              id: "setting.chain.add.coingecko-id",
            })} (Optional)`}
            ref={register({
              required: false,
            })}
            name={"coinGeckoId"}
            placeholder={"Ex: oraichain-token"}
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
          <Input
            type="text"
            label={intl.formatMessage({
              id: "setting.chain.add.images",
            })}
            error={errors.coinImageUrl?.message}
            ref={register({
              required: "Coin Images is required",
            })}
            name={"coinImageUrl"}
            placeholder={
              "Ex: https://assets.coingecko.com/coins/images/12931/standard/orai.png?1696512718"
            }
            style={{
              color: Colors["neutral-text-body"],
            }}
          />
        </Form>
      </div>
    </LayoutWithButtonBottom>
  );
});
