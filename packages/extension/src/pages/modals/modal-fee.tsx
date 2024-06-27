import React, { FC, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HeaderModal } from "../home/components/header-modal";
import {
  FeeConfig,
  FeeEvmConfig,
  FeeTronConfig,
  GasConfig,
  GasEvmConfig,
} from "@owallet/hooks";
import { CoinPretty, Dec } from "@owallet/unit";
import { Button } from "../../components/common/button";
import colors from "../../theme/colors";
import { FeeButtons, Input } from "../../components/form";
import { Text } from "../../components/common/text";
import ReactSwitch from "react-switch";

export const ModalFee: FC<{
  isOpen: boolean;
  feeConfig: FeeConfig | FeeEvmConfig | FeeTronConfig;
  gasConfig: GasConfig | GasEvmConfig;
  onRequestClose: () => void;
}> = observer(({ isOpen, onRequestClose, feeConfig, gasConfig }) => {
  const { priceStore, chainStore } = useStore();

  const [customFee, setCustomFee] = useState(false);

  const handleToggle = () => {
    setCustomFee(!customFee);
  };

  const fee =
    feeConfig.fee ??
    new CoinPretty(
      chainStore.getChain(feeConfig.chainId).stakeCurrency,
      new Dec("0")
    );

  const feePrice = priceStore.calculatePrice(fee);

  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalNetwork}
    >
      <div className={styles.contentWrap}>
        <HeaderModal
          title={"Select fee".toUpperCase()}
          onRequestClose={onRequestClose}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottom: "1px solid" + colors["neutral-border-default"],
            alignItems: "center",
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <div
              style={{
                marginRight: 4,
                backgroundColor: colors["neutral-surface-action"],
                borderRadius: 999,
                padding: "8px 12px",
              }}
            >
              <img
                style={{ width: 16, height: 16 }}
                src={require("assets/icon/wrench.svg")}
                alt=""
              />
            </div>
            <Text size={16} weight="600">
              Custom Fee
            </Text>
          </div>

          <ReactSwitch
            onColor={colors["highlight-surface-active"]}
            uncheckedIcon={false}
            checkedIcon={false}
            checked={customFee}
            onChange={handleToggle}
            height={24}
            width={40}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          {customFee ? (
            <div>
              <Input
                label={"Gas"}
                styleInputGroup={{}}
                onChange={(e) => {
                  e.preventDefault();
                  gasConfig.setGas(e.target.value);
                }}
                type="text"
                name="name"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 16,
                }}
              >
                <Text size={16}>Expected Fee</Text>
                <Text size={16}>{feePrice ? feePrice.toString() : "-"}</Text>
              </div>
            </div>
          ) : (
            <>
              <FeeButtons
                feeConfig={feeConfig}
                gasConfig={gasConfig}
                priceStore={priceStore}
                dimensional={"vertical"}
                isGasInput={false}
              />
            </>
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid" + colors["neutral-border-default"],
            position: "absolute",
            bottom: 0,
            width: "90%",
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: colors["neutral-surface-card"],
          }}
        >
          <Button onClick={onRequestClose}>Confirm</Button>
        </div>
      </div>
    </SlidingPane>
  );
});
