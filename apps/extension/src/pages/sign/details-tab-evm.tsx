// import React, { FunctionComponent, useEffect, useState } from "react";
// import { observer } from "mobx-react-lite";
// import { useStore } from "../../stores";
// import styleDetailsTab from "./details-tab.module.scss";
// import { FormattedMessage, useIntl } from "react-intl";
// import { IFeeConfig, IGasConfig, IMemoConfig } from "@owallet/hooks";
// import { toDisplay, useLanguage } from "@owallet/common";
// import { ChainIdEnum } from "@owallet/common";
// import { Bech32Address } from "@owallet/cosmos";
// import Web3 from "web3";
// import { Card } from "../../components/common/card";
// import colors from "../../theme/colors";
// import { Text } from "../../components/common/text";
// import ERC20_ABI from "./abi/erc20-abi.json";
// import BEP20_ABI from "./abi/bep20-abi.json";
// import EVM_PROXY_ABI from "./abi/evm-proxy-abi.json";
// import GRAVITY_ABI from "./abi/gravity-abi.json";
// import PANCAKE_ABI from "./abi/pancake-abi.json";
// import UNISWAP_ABI from "./abi/uniswap-abi.json";
// import { Address } from "../../components/address";
// import { shortenAddress, tryAllABI } from "./helpers/helpers";
// import { EVMRenderArgs } from "./components/render-evm-args";
// import { DataTabEvm } from "./data-tab-evm";
// import withErrorBoundary from "./hoc/withErrorBoundary";

// const EVMRenderArgsWithErrorBoundary = withErrorBoundary(EVMRenderArgs);

// export const DetailsTabEvm: FunctionComponent<{
//   msgSign: any;
//   dataSign: any;
//   memoConfig: IMemoConfig;
//   feeConfig: IFeeConfig;
//   gasConfig: IGasConfig;

//   isInternal: boolean;

//   preferNoSetFee: boolean;
//   preferNoSetMemo: boolean;

//   setOpenSetting: () => void;
// }> = observer(
//   ({
//     msgSign,
//     dataSign,
//     feeConfig,
//     gasConfig,
//     isInternal,
//     preferNoSetFee,
//     setOpenSetting,
//   }) => {
//     const { chainStore, priceStore, accountStore, keyRingStore } = useStore();
//     const intl = useIntl();
//     const language = useLanguage();

//     const account = accountStore.getAccount(chainStore.current.chainId);
//     const signer = account.getAddressDisplay(
//       keyRingStore.keyRingLedgerAddresses,
//       false
//     );

//     const chain = chainStore.getChain(dataSign?.data?.chainId);
//     const [toAddress, setToAddress] = useState(null);
//     const [isRaw, setIsRaw] = useState(null);
//     const [amount, setAmount] = useState(null);
//     const [decodedData, setDecodedData] = useState(null);
//     const [decodeWithABI, setDecodeWithABI] = useState(null);

//     useEffect(() => {
//       if (msgSign?.data) {
//         const inputData = msgSign.data;

//         try {
//           const res = tryAllABI(inputData, [
//             ERC20_ABI,
//             EVM_PROXY_ABI,
//             GRAVITY_ABI,
//             PANCAKE_ABI,
//             UNISWAP_ABI,
//             BEP20_ABI,
//           ]);
//           setDecodeWithABI(res);

//           if (!res.isRaw) {
//             setDecodedData(res.data);
//           } else {
//             setIsRaw(true);
//           }
//         } catch (err) {
//           console.log("err", err);
//         }
//       }
//     }, [msgSign]);

//     const renderMsg = (content) => {
//       return (
//         <div>
//           <Card
//             containerStyle={{
//               flexDirection: "row",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               backgroundColor: colors["neutral-surface-action"],
//               borderTopRightRadius: 12,
//               borderBottomRightRadius: 12,
//               borderLeftWidth: 4,
//               borderLeftStyle: "solid",
//               borderColor: colors["primary-surface-default"],
//               padding: 12,
//               marginTop: 12,
//               width: "100%",
//             }}
//           >
//             {content}
//           </Card>
//         </div>
//       );
//     };

//     // const mode = signDocHelper.signDocWrapper
//     //   ? signDocHelper.signDocWrapper.mode
//     //   : "none";
//     const msgs = msgSign ? msgSign : [];

//     useEffect(() => {
//       if (decodedData?.args?._to) {
//         setToAddress(decodedData?.args?._to);
//       }
//       if (msgs && !msgs?.data) {
//         setToAddress(msgs.to);
//       }
//     }, [decodedData]);

//     useEffect(() => {
//       if (decodedData?.args?._amount) {
//         setAmount(decodedData?.args?._amount);
//         return;
//       } else if (decodedData?.args?._value) {
//         setAmount(decodedData?.args?._value);
//         return;
//       } else if (msgs?.value) {
//         setAmount(msgs?.value);
//       }
//     }, [decodedData, msgs]);

//     const renderedMsgs = (() => {
//       const displayAmount = Web3.utils.hexToNumberString(msgs?.value);
//       if (msgs && displayAmount && !msgs?.data) {
//         return (
//           <React.Fragment>
//             {renderMsg(
//               <MsgRender
//                 icon={"fas fa-paper-plane"}
//                 title={intl.formatMessage({
//                   id: "sign.list.message.cosmos-sdk/MsgSend.title",
//                 })}
//               >
//                 Send{" "}
//                 <b>
//                   {`${
//                     chainStore.current.chainId === ChainIdEnum.Oasis
//                       ? Web3.utils.fromWei(displayAmount, "gwei")
//                       : Web3.utils.fromWei(displayAmount, "ether")
//                   } ${chainStore.current.feeCurrencies[0].coinDenom}`}
//                 </b>{" "}
//                 to{" "}
//                 <b>{msgs?.to && Bech32Address.shortenAddress(msgs?.to, 20)}</b>{" "}
//                 on <b>{chainStore.current.chainName}</b>
//               </MsgRender>
//             )}
//             <hr />
//           </React.Fragment>
//         );
//       }

//       if (Object.keys(msgs).length > 0 && decodedData && !decodeWithABI.isRaw) {
//         return (
//           <React.Fragment>
//             {renderMsg(
//               <div>
//                 <div style={{ display: "flex", flexDirection: "row" }}>
//                   <div
//                     style={{
//                       marginRight: 8,
//                       width: 44,
//                       height: 44,
//                       borderRadius: 44,
//                       backgroundColor: colors["neutral-surface-card"],
//                       alignItems: "center",
//                       justifyContent: "center",
//                       display: "flex",
//                     }}
//                   >
//                     <img
//                       style={{ width: 28, height: 28, borderRadius: 28 }}
//                       src={chain?.stakeCurrency.coinImageUrl}
//                     />
//                   </div>

//                   <div style={{ display: "flex", flexDirection: "column" }}>
//                     <Text size={16} weight="600">
//                       {decodedData.name
//                         .replace(/([a-z])([A-Z])/g, "$1 $2")
//                         .toUpperCase()}
//                     </Text>
//                     <Text color={colors["neutral-text-body"]} weight="500">
//                       <Address maxCharacters={18} lineBreakBeforePrefix={false}>
//                         {msgs?.from ?? "..."}
//                       </Address>
//                     </Text>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </React.Fragment>
//         );
//       }

//       return null;
//     })();

//     const renderDestination = (from?, to?) => {
//       if ((msgs && !msgs?.data) || decodedData.name === "transfer") {
//         return (
//           <div
//             style={{
//               marginTop: 14,
//               height: "auto",
//               alignItems: "center",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginBottom: 14,
//               }}
//             >
//               <div
//                 style={{
//                   maxWidth: "50%",
//                 }}
//               >
//                 <div style={{ flexDirection: "column", display: "flex" }}>
//                   <Text color={colors["neutral-text-body"]}>From</Text>
//                   {from ? (
//                     <>
//                       <Address
//                         maxCharacters={6}
//                         lineBreakBeforePrefix={false}
//                         textDecor={"underline"}
//                         textColor={colors["neutral-text-body"]}
//                       >
//                         {from}
//                       </Address>
//                     </>
//                   ) : (
//                     <Text
//                       containerStyle={{
//                         textDecoration: "underline",
//                       }}
//                       color={colors["neutral-text-body"]}
//                     >
//                       {shortenAddress(signer) ?? "-"}
//                     </Text>
//                   )}
//                 </div>
//               </div>
//               <img
//                 style={{ paddingRight: 4 }}
//                 src={require("assets/icon/tdesign_arrow-right.svg")}
//               />
//               <div
//                 style={{
//                   maxWidth: "50%",
//                 }}
//               >
//                 <div style={{ flexDirection: "column", display: "flex" }}>
//                   <Text color={colors["neutral-text-body"]}>To</Text>
//                   {to ? (
//                     <>
//                       <Address
//                         maxCharacters={6}
//                         lineBreakBeforePrefix={false}
//                         textDecor={"underline"}
//                         textColor={colors["neutral-text-body"]}
//                       >
//                         {to}
//                       </Address>
//                     </>
//                   ) : (
//                     <Text color={colors["neutral-text-body"]}>-</Text>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div
//               style={{
//                 width: "100%",
//                 height: 1,
//                 backgroundColor: colors["neutral-border-default"],
//               }}
//             />
//           </div>
//         );
//       }
//     };

//     const renderInfo = (condition, label, leftContent) => {
//       if (condition && condition !== "") {
//         return (
//           <div
//             style={{
//               marginTop: 14,
//               height: "auto",
//               alignItems: "center",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 marginBottom: 14,
//               }}
//             >
//               <div>
//                 <Text weight="600">{label}</Text>
//               </div>
//               <div
//                 style={{
//                   alignItems: "flex-end",
//                   maxWidth: "60%",
//                   wordBreak: "break-all",
//                 }}
//               >
//                 <div>{leftContent}</div>
//               </div>
//             </div>
//             <div
//               style={{
//                 width: "100%",
//                 height: 1,
//                 backgroundColor: colors["neutral-border-default"],
//               }}
//             />
//           </div>
//         );
//       }
//     };

//     const renderTransactionFee = () => {
//       return (
//         <div>
//           {renderInfo(
//             amount &&
//               Number(
//                 toDisplay(amount.toString(), chain.stakeCurrency.coinDecimals)
//               ) > 0,
//             "Amount",
//             <div
//               style={{
//                 flexDirection: "column",
//                 display: "flex",
//                 alignItems: "flex-end",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "row",
//                   cursor: "pointer",
//                 }}
//               >
//                 <Text size={16} weight="600">
//                   {amount
//                     ? toDisplay(
//                         amount.toString(),
//                         chain.stakeCurrency.coinDecimals
//                       )
//                     : null}
//                 </Text>
//               </div>
//             </div>
//           )}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "row",
//               justifyContent: "space-between",
//               marginTop: 14,
//             }}
//             onClick={() => {
//               if ((msgs && !msgs?.data) || decodedData?.name === "transfer") {
//                 return;
//               }
//               setOpenSetting();
//             }}
//           >
//             <div
//               style={{
//                 flexDirection: "column",
//                 display: "flex",
//               }}
//             >
//               <div>
//                 <Text weight="600">Fee</Text>
//               </div>
//               {msgs?.gas ? (
//                 <div>
//                   <Text color={colors["neutral-text-body"]}>
//                     Gas: {Number(msgs?.gas)}
//                   </Text>
//                 </div>
//               ) : null}
//             </div>
//             <div
//               style={{
//                 flexDirection: "column",
//                 display: "flex",
//                 alignItems: "flex-end",
//                 width: "65%",
//               }}
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "row",
//                   cursor: "pointer",
//                 }}
//               >
//                 <Text
//                   size={16}
//                   weight="600"
//                   color={colors["primary-text-action"]}
//                 >
//                   {feeConfig?.fee?.maxDecimals(8).trim(true).toString() || 0}
//                 </Text>
//                 {(msgs && !msgs?.data) ||
//                 decodedData?.name === "transfer" ? null : (
//                   <img src={require("assets/icon/tdesign_chevron-down.svg")} />
//                 )}
//               </div>
//               <Text
//                 containerStyle={{
//                   alignSelf: "flex-end",
//                   display: "flex",
//                 }}
//                 color={colors["neutral-text-body"]}
//               >
//                 ≈
//                 {priceStore
//                   .calculatePrice(feeConfig?.fee, language.fiatCurrency)
//                   ?.toString() || 0}
//               </Text>
//             </div>
//           </div>
//         </div>
//       );
//     };

//     return (
//       <div className={styleDetailsTab.container}>
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             alignItems: "center",
//           }}
//         >
//           <img
//             style={{ paddingRight: 4 }}
//             src={require("assets/icon/tdesign_code-1.svg")}
//           />
//           <Text color={colors["neutral-text-body"]} weight="500">
//             <FormattedMessage id="sign.list.messages.label" />:
//           </Text>
//           <div
//             className="ml-2"
//             style={{
//               backgroundColor: colors["primary-surface-default"],
//               padding: "0px 8px",
//               borderRadius: 8,
//             }}
//           >
//             <Text
//               size={12}
//               weight="600"
//               color={colors["neutral-text-action-on-dark-bg"]}
//             >
//               {(msgs && msgs.length) ?? 1}
//             </Text>
//           </div>
//         </div>
//         <div id="signing-messages" className={styleDetailsTab.msgContainer}>
//           {renderedMsgs}
//         </div>

//         <Card
//           containerStyle={{
//             borderRadius: 12,
//             border: "1px solid" + colors["neutral-border-default"],
//             padding: 8,
//           }}
//         >
//           {renderInfo(
//             chain?.chainName,
//             "Network",
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 alignItems: "center",
//               }}
//             >
//               <img
//                 style={{
//                   width: 14,
//                   height: 14,
//                   borderRadius: 28,
//                   marginRight: 4,
//                 }}
//                 src={chain?.stakeCurrency.coinImageUrl}
//               />
//               <Text weight="600">{chain?.chainName}</Text>
//             </div>
//           )}
//           {/* Render raw data */}
//           {isRaw ? (
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 borderBottom: "1px solid" + colors["neutral-border-default"],
//                 alignItems: "center",
//                 marginTop: 4,
//               }}
//             >
//               <div
//                 style={{
//                   height: "60%",
//                   overflow: "scroll",
//                   backgroundColor: colors["neutral-surface-bg"],
//                   borderRadius: 12,
//                   padding: 8,
//                   width: "100vw",
//                 }}
//               >
//                 <DataTabEvm data={dataSign} />
//               </div>
//             </div>
//           ) : null}

//           {toAddress ? renderDestination(msgs?.from, toAddress) : null}

//           {decodedData && decodedData.name !== "transfer" ? (
//             <>
//               {renderInfo(
//                 decodedData.name,
//                 "Method",
//                 <Text>{decodedData.name}</Text>
//               )}
//               {decodedData?.args ? (
//                 <EVMRenderArgsWithErrorBoundary
//                   msgs={msgs}
//                   args={decodedData.args}
//                   renderInfo={renderInfo}
//                   chain={chain}
//                 />
//               ) : null}
//             </>
//           ) : null}
//         </Card>
//         <Card
//           containerStyle={{
//             borderRadius: 12,
//             padding: 8,
//             marginTop: 12,
//             border: "1px solid" + colors["neutral-border-default"],
//           }}
//         >
//           {renderTransactionFee()}
//         </Card>
//         {feeConfig.getError() !== null && feeConfig.getError() !== undefined ? (
//           <div
//             style={{
//               display: "flex",
//               backgroundColor: colors["warning-surface-subtle"],
//               borderRadius: 12,
//               flexDirection: "row",
//               marginTop: 12,
//               padding: "8px",
//             }}
//           >
//             <img
//               style={{ paddingRight: 4 }}
//               src={require("assets/icon/tdesign_error-circle.svg")}
//             />
//             <Text size={12} weight="600">
//               {feeConfig.getError().message}
//             </Text>
//           </div>
//         ) : null}
//         {gasConfig.getError() !== null && gasConfig.getError() !== undefined ? (
//           <div
//             style={{
//               display: "flex",
//               backgroundColor: colors["warning-surface-subtle"],
//               borderRadius: 12,
//               flexDirection: "row",
//               marginTop: 12,
//               padding: "8px",
//             }}
//           >
//             <img
//               style={{ paddingRight: 4 }}
//               src={require("assets/icon/tdesign_error-circle.svg")}
//             />
//             <Text size={12} weight="600">
//               {gasConfig.getError().message}
//             </Text>
//           </div>
//         ) : null}
//       </div>
//     );
//   }
// );

// export const MsgRender: FunctionComponent<{
//   icon?: string;
//   title: string;
// }> = ({ icon = "fas fa-question", title, children }) => {
//   return (
//     <div style={{ width: "125%" }} className={styleDetailsTab.msg}>
//       <div className={styleDetailsTab.icon}>
//         <div style={{ height: "2px" }} />
//         <i className={icon} />
//         <div style={{ flex: 1 }} />
//       </div>
//       <div className={styleDetailsTab.contentContainer}>
//         <div className={styleDetailsTab.contentTitle}>{title}</div>
//         <div className={styleDetailsTab.content}>{children}</div>
//       </div>
//     </div>
//   );
// };
