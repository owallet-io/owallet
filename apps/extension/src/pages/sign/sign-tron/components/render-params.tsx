// import React, {
//   FunctionComponent,
//   ReactElement,
//   useEffect,
//   useState,
// } from "react";
// import { observer } from "mobx-react-lite";
// import { EmbedChainInfos, getBase58Address, toDisplay } from "@owallet/common";
// import { Text } from "../../../../components/common/text";
// import colors from "../../../../theme/colors";
// import { AppChainInfo } from "@owallet/types";
// import {
//   calculateJaccardIndex,
//   findKeyBySimilarValue,
//   getTokenInfo,
// } from "../../helpers/helpers";
// import { LIST_ORAICHAIN_CONTRACT } from "../../helpers/constant";
// import { decodeBase64, numberWithCommas } from "../../../../helpers/helper";

// export const TronRenderParams: FunctionComponent<{
//   params: Array<any>;
//   chain: AppChainInfo;
//   contractAddress: string;
//   renderInfo: (condition, label, content) => ReactElement;
// }> = observer(({ params, renderInfo, chain, contractAddress }) => {
//   const [token, setToken] = useState(null);

//   const findToken = async (contractAddress) => {
//     if (chain?.chainId && contractAddress) {
//       try {
//         const tokenData = await getTokenInfo(contractAddress, chain.chainId);
//         setToken(tokenData.data);
//       } catch (err) {
//         const chainInfo = EmbedChainInfos.find(
//           (c) => c.chainId === chain.chainId
//         );
//         if (chainInfo) {
//           const token = chainInfo.currencies.find(
//             //@ts-ignore
//             (cu) => cu.contractAddress === contractAddress
//           );
//           setToken(token);
//         }
//       }
//     }
//   };

//   useEffect(() => {
//     params?.forEach((p) => {
//       if (p.type === "address") {
//         findToken(getBase58Address(p.value));
//       }
//     });
//   }, [params]);

//   useEffect(() => {
//     if (chain?.chainId && contractAddress) {
//       findToken(contractAddress);
//     }
//   }, [chain?.chainId, contractAddress]);

//   const getInfoFromDecodedData = (decodedData) => {
//     if (!decodedData) return null;

//     const pattern = /[\x00-\x1F]+/;
//     const addressPattern = /[a-zA-Z0-9]+/g;
//     const array = decodedData.split(pattern).filter(Boolean);

//     if (array.length < 1) {
//       array.push(decodedData);
//     }

//     const des = array.shift();
//     const tokenStr = array.pop();

//     let tokenInfo;
//     if (tokenStr) {
//       const matchedToken = tokenStr.match(addressPattern)?.join("");

//       for (const chain of EmbedChainInfos) {
//         if (chain.stakeCurrency.coinMinimalDenom === matchedToken) {
//           tokenInfo = chain.stakeCurrency;
//           break;
//         }

//         const foundCurrency = chain.currencies.find(
//           (cr) =>
//             cr.coinMinimalDenom === matchedToken ||
//             //@ts-ignore
//             cr.contractAddress === matchedToken ||
//             calculateJaccardIndex(cr.coinMinimalDenom, tokenStr) > 0.85
//         );

//         if (foundCurrency) {
//           tokenInfo = foundCurrency;
//           break;
//         }
//       }

//       if (!tokenInfo) {
//         const key = findKeyBySimilarValue(
//           LIST_ORAICHAIN_CONTRACT,
//           matchedToken
//         )?.split("_")?.[0];
//         if (key) {
//           tokenInfo = { coinDenom: key, contractAddress: matchedToken };
//         }
//       }
//     }

//     return { des: des.match(addressPattern)?.join(""), tokenInfo };
//   };

//   const convertDestinationToken = (value) => {
//     if (!value) return null;

//     const encodedData = value.split(":")?.[1];
//     if (encodedData) {
//       const decodedData = decodeBase64(encodedData);
//       return getInfoFromDecodedData(decodedData);
//     }
//   };

//   const renderParams = () => {
//     return (
//       <div>
//         {params?.map((p) => {
//           if (p.type === "uint256") {
//             return renderInfo(
//               p?.value,
//               "Amount In",
//               <Text>
//                 {numberWithCommas(
//                   toDisplay(
//                     (p?.value).toString(),
//                     chain.stakeCurrency.coinDecimals
//                   )
//                 )}
//               </Text>
//             );
//           }
//           if (p.type === "address") {
//             return renderInfo(
//               p?.value,
//               "To Contract",
//               <Text>{getBase58Address(p?.value)}</Text>
//             );
//           }
//           if (p.type === "string") {
//             const { des, tokenInfo } = convertDestinationToken(p?.value) || {};
//             return (
//               <>
//                 {des &&
//                   renderInfo(des, "Destination Address", <Text>{des}</Text>)}
//                 {tokenInfo &&
//                   renderInfo(
//                     tokenInfo.coinDenom,
//                     "Token Out",
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "row",
//                         alignItems: "center",
//                       }}
//                     >
//                       <img
//                         style={{
//                           width: 14,
//                           height: 14,
//                           borderRadius: 28,
//                           marginRight: 4,
//                           backgroundColor: colors["neutral-surface-pressed"],
//                         }}
//                         src={tokenInfo?.coinImageUrl}
//                       />
//                       <Text weight="600">{tokenInfo?.coinDenom}</Text>
//                     </div>
//                   )}
//               </>
//             );
//           }
//         })}
//       </div>
//     );
//   };

//   return (
//     <div>
//       {renderParams()}
//       {token &&
//         renderInfo(
//           token,
//           "Token In",
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "row",
//               alignItems: "center",
//             }}
//           >
//             <img
//               style={{
//                 width: 14,
//                 height: 14,
//                 borderRadius: 28,
//                 marginRight: 4,
//                 backgroundColor: colors["neutral-surface-pressed"],
//               }}
//               src={token?.imgUrl ?? token?.coinImageUrl}
//             />
//             <Text weight="600">{token?.abbr ?? token?.coinDenom}</Text>
//           </div>
//         )}
//     </div>
//   );
// });
