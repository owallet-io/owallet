// import React, { FunctionComponent, useEffect, useState } from "react";
// import { AddressInput, CoinInput } from "components/form";
// import { useStore } from "src/stores";
// import { observer } from "mobx-react-lite";
// import style from "../send-evm/style.module.scss";

// import { useIntl } from "react-intl";
// import { useHistory, useLocation } from "react-router";
// import queryString from "querystring";
// import {
//   InvalidTronAddressError,
//   useGetFeeTron,
//   useSendTxTronConfig,
// } from "@owallet/hooks";
// import { fitPopupWindow } from "@owallet/popup";
// import { EthereumEndpoint } from "@owallet/common";
// import { FeeInput } from "components/form/fee-input";
// import { HeaderNew } from "layouts/footer-layout/components/header";
// import { HeaderModal } from "src/pages/home/components/header-modal";
// import { ModalChooseTokens } from "src/pages/modals/modal-choose-tokens";
// import colors from "theme/colors";
// import { Card } from "components/common/card";
// import { Button } from "components/common/button";
// import { toast } from "react-toastify";

// export const SendTronEvmPage: FunctionComponent<{
//   coinMinimalDenom?: string;
//   tokensTrc20Tron?: Array<any>;
// }> = observer(({ coinMinimalDenom }) => {
//   const history = useHistory();
//   let search = useLocation().search || coinMinimalDenom || "";
//   if (search.startsWith("?")) {
//     search = search.slice(1);
//   }
//   const query = queryString.parse(search) as {
//     defaultDenom: string | undefined;
//     defaultRecipient: string | undefined;
//     defaultAmount: string | undefined;
//     defaultMemo: string | undefined;
//     detached: string | undefined;
//   };

//   useEffect(() => {
//     // Scroll to top on page mounted.
//     if (window.scrollTo) {
//       window.scrollTo(0, 0);
//     }
//   }, []);

//   const intl = useIntl();
//   const inputRef = React.useRef(null);

//   const [isShowSelectToken, setSelectToken] = useState(false);

//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [coinMinimalDenom]);

//   const { chainStore, accountStore, queriesStore, keyRingStore } = useStore();
//   const current = chainStore.current;

//   const accountInfo = accountStore.getAccount(current.chainId);

//   const sendConfigs = useSendTxTronConfig(
//     chainStore,
//     current.chainId,
//     //@ts-ignore
//     accountInfo.msgOpts.send,
//     accountInfo.evmosHexAddress,
//     queriesStore.get(current.chainId).queryBalances,
//     EthereumEndpoint
//   );

//   useEffect(() => {
//     if (query.defaultDenom) {
//       const currency = current.currencies.find(
//         (cur) => cur.coinMinimalDenom === query.defaultDenom
//       );

//       if (currency) {
//         sendConfigs.amountConfig.setSendCurrency(currency);
//       }
//     }
//   }, [current.currencies, query.defaultDenom, sendConfigs.amountConfig]);

//   const isDetachedPage = query.detached === "true";

//   useEffect(() => {
//     if (isDetachedPage) {
//       fitPopupWindow();
//     }
//   }, [isDetachedPage]);

//   useEffect(() => {
//     if (query.defaultRecipient) {
//       sendConfigs.recipientConfig.setRawRecipient(query.defaultRecipient);
//     }
//     if (query.defaultAmount) {
//       sendConfigs.amountConfig.setAmount(query.defaultAmount);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [query.defaultAmount, query.defaultRecipient]);
//   const addressTronBase58 = accountInfo.getAddressDisplay(
//     keyRingStore.keyRingLedgerAddresses
//   );

//   const checkSendMySelft =
//     sendConfigs.recipientConfig.recipient?.trim() === addressTronBase58
//       ? new InvalidTronAddressError("Cannot transfer TRX to the same account")
//       : null;
//   const sendConfigError =
//     checkSendMySelft ??
//     sendConfigs.recipientConfig.getError() ??
//     sendConfigs.amountConfig.getError() ??
//     sendConfigs.feeConfig.getError();
//   const txStateIsValid = sendConfigError == null;

//   const onSend = async (e: any) => {
//     e.preventDefault();
//     try {
//       await accountInfo.sendTronToken(
//         sendConfigs.amountConfig.amount,
//         sendConfigs.amountConfig.sendCurrency!,
//         sendConfigs.recipientConfig.recipient,
//         addressTronBase58,
//         {
//           onFulfill: (tx) => {
//             toast(
//               tx?.code === 0 ? `Transaction successful` : `Transaction failed`,
//               {
//                 type: tx?.code === 0 ? "success" : "error",
//               }
//             );
//           },
//         }
//       );
//       if (!isDetachedPage) {
//         history.replace("/");
//       }
//     } catch (error) {
//       if (!isDetachedPage) {
//         history.replace("/");
//       }
//       toast(`Fail to send token: ${error.message}`, {
//         type: "error",
//       });
//     } finally {
//       if (isDetachedPage) {
//         window.close();
//       }
//     }
//   };

//   useEffect(() => {
//     //@ts-ignore
//     const token = history.location.state?.token;

//     if (token) {
//       const selectedKey = token.token?.currency?.coinMinimalDenom;
//       const currency = sendConfigs.amountConfig.sendableCurrencies.find(
//         (cur) => cur.coinMinimalDenom === selectedKey
//       );
//       sendConfigs.amountConfig.setSendCurrency(currency);
//     }
//     //@ts-ignore
//   }, [history.location.state?.token]);

//   const queries = queriesStore.get(current.chainId);
//   const { feeTrx } = useGetFeeTron(
//     addressTronBase58,
//     sendConfigs.amountConfig,
//     sendConfigs.recipientConfig,
//     queries.tron,
//     chainStore.current,
//     keyRingStore,
//     null
//   );
//   useEffect(() => {
//     sendConfigs.feeConfig.setManualFee(feeTrx);
//     return () => {
//       sendConfigs.feeConfig.setManualFee(null);
//     };
//   }, [feeTrx]);

//   return (
//     <>
//       <div
//         style={{
//           height: "100%",
//           width: "100vw",
//           overflowX: "auto",
//           backgroundColor: colors["neutral-surface-bg"],
//         }}
//       >
//         <ModalChooseTokens
//           onRequestClose={() => {
//             setSelectToken(false);
//           }}
//           amountConfig={sendConfigs.amountConfig}
//           isOpen={isShowSelectToken}
//         />

//         <HeaderNew
//           showNetwork={true}
//           isDisableCenterBtn={true}
//           isGoBack
//           isConnectDapp={false}
//         />
//         <HeaderModal title={"Send".toUpperCase()} />
//         <form className={style.formContainer} onSubmit={onSend}>
//           <div className={style.formInnerContainer}>
//             <div style={{ padding: 16, paddingTop: 0 }}>
//               <AddressInput
//                 inputStyle={{
//                   borderWidth: 0,
//                   padding: 0,
//                   margin: 0,
//                 }}
//                 inputRef={inputRef}
//                 recipientConfig={sendConfigs.recipientConfig}
//                 memoConfig={sendConfigs.memoConfig}
//                 label={intl.formatMessage({ id: "send.input.recipient" })}
//                 placeholder="Enter recipient address"
//               />
//               <CoinInput
//                 openSelectToken={() => setSelectToken(true)}
//                 amountConfig={sendConfigs.amountConfig}
//                 label={intl.formatMessage({ id: "send.input.amount" })}
//                 balanceText={intl.formatMessage({
//                   id: "send.input-button.balance",
//                 })}
//                 placeholder="Enter your amount"
//               />

//               <Card
//                 containerStyle={{
//                   backgroundColor: colors["neutral-surface-card"],
//                   padding: 16,
//                   borderRadius: 12,
//                 }}
//               >
//                 <FeeInput
//                   label={"Fee"}
//                   //@ts-ignore
//                   feeConfig={sendConfigs.feeConfig}
//                 />
//               </Card>
//             </div>
//           </div>
//           <div
//             style={{
//               position: "absolute",
//               bottom: 0,
//               width: "100%",
//               height: "12%",
//               backgroundColor: colors["neutral-surface-card"],
//               borderTop: "1px solid" + colors["neutral-border-default"],
//             }}
//           >
//             <div
//               style={{
//                 flexDirection: "row",
//                 display: "flex",
//                 padding: 16,
//                 paddingTop: 0,
//               }}
//             >
//               <Button
//                 type="submit"
//                 data-loading={accountInfo.isSendingMsg === "send"}
//                 disabled={!accountInfo.isReadyToSendMsgs || !txStateIsValid}
//                 className={style.sendBtn}
//                 style={{
//                   cursor:
//                     accountInfo.isReadyToSendMsgs || !txStateIsValid
//                       ? ""
//                       : "pointer",
//                 }}
//               >
//                 <span className={style.sendBtnText}>
//                   {intl.formatMessage({
//                     id: "send.button.send",
//                   })}
//                 </span>
//               </Button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// });
