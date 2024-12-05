// import React, { FunctionComponent, useState } from "react";
// import { observer } from "mobx-react-lite";
// import {
//   FeeConfig,
//   FeeEvmConfig,
//   FeeTronConfig,
//   GasConfig,
//   GasEvmConfig,
// } from "@owallet/hooks";
// import style from "../style.module.scss";
// import { Button } from "../../../components/common/button";
// import colors from "../../../theme/colors";
// import { Text } from "../../../components/common/text";
// import ReactSwitch from "react-switch";
// import { FeeButtons, Input } from "../../../components/form";
// import { useStore } from "../../../stores";
// import { CoinPretty, Dec } from "@owallet/unit";
// import { isRunningInSidePanel } from "src/utils/side-panel";

// export const FeeModal: FunctionComponent<{
//   feeConfig: FeeConfig | FeeEvmConfig;
//   gasConfig: GasConfig | GasEvmConfig;
//   onClose: () => void;
// }> = observer(({ feeConfig, gasConfig, onClose }) => {
//   const { priceStore, chainStore } = useStore();

//   const [customFee, setCustomFee] = useState(false);

//   const handleToggle = () => {
//     setCustomFee(!customFee);
//   };

//   const fee =
//     feeConfig.fee ??
//     new CoinPretty(
//       chainStore.getChain(feeConfig.chainId).stakeCurrency,
//       new Dec("0")
//     );

//   const feePrice = priceStore.calculatePrice(fee);

//   return (
//     <div
//       className={style.feeModal}
//       style={{ height: isRunningInSidePanel() ? "100vh" : 580 }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           padding: 16,
//         }}
//       >
//         <span />
//         <Text size={16} weight="700">
//           {"set fee".toUpperCase()}
//         </Text>
//         <div onClick={onClose}>
//           <img src={require("assets/icon/circle-del.svg")} alt="" />
//         </div>
//       </div>
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           justifyContent: "space-between",
//           padding: 16,
//           borderBottom: "1px solid" + colors["neutral-border-default"],
//           alignItems: "center",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             alignItems: "center",
//           }}
//         >
//           <div
//             style={{
//               marginRight: 4,
//               backgroundColor: colors["neutral-surface-action"],
//               borderRadius: 999,
//               padding: "8px 12px",
//             }}
//           >
//             <img
//               style={{ width: 16, height: 16 }}
//               src={require("assets/icon/wrench.svg")}
//               alt=""
//             />
//           </div>
//           <Text size={16} weight="600">
//             Custom Fee
//           </Text>
//         </div>

//         <ReactSwitch
//           onColor={colors["highlight-surface-active"]}
//           uncheckedIcon={false}
//           checkedIcon={false}
//           checked={customFee}
//           onChange={handleToggle}
//           height={24}
//           width={40}
//         />
//       </div>
//       <div style={{ height: "60%", overflow: "scroll", padding: 16 }}>
//         {customFee ? (
//           <div>
//             <Input
//               label={"Gas"}
//               onChange={(e) => {
//                 e.preventDefault();
//                 gasConfig.setGas(e.target.value);
//               }}
//               type="number"
//               name="gas"
//               min={0}
//               autoComplete="off"
//               placeHolder="0"
//             />
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 paddingTop: 16,
//               }}
//             >
//               <Text size={16}>Expected Fee</Text>
//               <Text size={16}>{feePrice ? feePrice.toString() : "-"}</Text>
//             </div>
//           </div>
//         ) : (
//           <FeeButtons
//             feeConfig={feeConfig}
//             gasConfig={gasConfig}
//             priceStore={priceStore}
//             dimensional={"vertical"}
//             isGasInput={false}
//           />
//         )}
//       </div>

//       <div
//         style={{
//           borderTop: "1px solid" + colors["neutral-border-default"],
//           position: "absolute",
//           bottom: 0,
//           width: "100%",
//           paddingBottom: 16,
//           paddingTop: 8,
//           backgroundColor: colors["neutral-surface-card"],
//         }}
//       >
//         <div
//           style={{
//             marginLeft: 16,
//             marginRight: 16,
//           }}
//         >
//           <Button onClick={onClose}>Confirm</Button>
//         </div>
//       </div>
//     </div>
//   );
// });
