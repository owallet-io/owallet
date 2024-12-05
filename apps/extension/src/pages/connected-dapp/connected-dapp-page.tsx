// import React, { useEffect, useState } from "react";
// import { observer } from "mobx-react-lite";
// import styles from "./connected-dapp.module.scss";
// import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
// import { SearchInput } from "../home/components/search-input";
// import { useStore } from "../../stores";
// import { getFavicon, limitString, PrivilegedOrigins } from "@owallet/common";
// import { OwEmpty } from "components/empty/ow-empty";
// import colors from "theme/colors";

// export const ConnectedDappPage = observer(() => {
//   const [keyword, setKeyword] = useState<string>("");
//   const onChangeSearch = (e) => {
//     setKeyword(e.target.value);
//   };
//   const { permissionStore, chainStore } = useStore();
//   const basicAccessInfo = permissionStore.getBasicAccessInfo(
//     chainStore.current.chainId
//   );
//   const data = basicAccessInfo.origins.filter((item, index) =>
//     item?.toLowerCase().includes(keyword?.toLowerCase())
//   );
//   const removeDapps = (item) => {
//     basicAccessInfo.removeOrigin(item);
//     return;
//   };
//   return (
//     <LayoutWithButtonBottom isHideButtonBottom={true} title={"Connected dapp"}>
//       <div className={styles.wrapContent}>
//         <SearchInput
//           containerClassNames={styles.searchInput}
//           onChange={onChangeSearch}
//           placeholder={"Search for a DApps"}
//         />
//         {data?.length > 0 ? (
//           <div className={styles.listDapps}>
//             {data.map((item, index) => {
//               return (
//                 <div key={index} className={styles.itemDapp}>
//                   <div className={styles.leftBlock}>
//                     <div className={styles.wrapImg}>
//                       <img src={getFavicon(item)} className={styles.img} />
//                     </div>
//                     <span className={styles.urlText}>
//                       {limitString(item, 24)}
//                     </span>
//                   </div>
//                   <div className={styles.rightBlock}>
//                     <div
//                       onClick={() => removeDapps(item)}
//                       className={styles.wrapLink}
//                     >
//                       <img
//                         src={require("assets/svg/ow_link-unlink.svg")}
//                         className={styles.img}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div
//             style={{
//               height: "calc(100vh - 200px)",
//             }}
//           >
//             <OwEmpty />
//           </div>
//         )}
//       </div>
//     </LayoutWithButtonBottom>
//   );
// });
