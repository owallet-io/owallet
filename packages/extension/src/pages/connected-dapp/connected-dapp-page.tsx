import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styles from "./connected-dapp.module.scss";
import { LayoutWithButtonBottom } from "../../layouts/button-bottom-layout/layout-with-button-bottom";
import { SearchInput } from "../home/components/search-input";
import { useStore } from "../../stores";
import { getFavicon, limitString, PrivilegedOrigins } from "@owallet/common";

export const ConnectedDappPage = observer(() => {
  const [keyword, setKeyword] = useState<string>("");
  const onChangeSearch = (e) => {
    setKeyword(e.target.value);
  };
  const { permissionStore, chainStore } = useStore();
  const basicAccessInfo = permissionStore.getBasicAccessInfo(
    chainStore.current.chainId
  );
  const data = PrivilegedOrigins.concat(basicAccessInfo.origins).filter(
    (item, index) => item?.toLowerCase().includes(keyword?.toLowerCase())
  );
  const removeDapps = (item) => {
    basicAccessInfo.removeOrigin(item);
    return;
  };
  return (
    <LayoutWithButtonBottom isHideButtonBottom={true} title={"Connected dapp"}>
      <div className={styles.wrapContent}>
        <SearchInput
          containerClassNames={styles.searchInput}
          onChange={onChangeSearch}
          placeholder={"Search for a DApps"}
        />
        <div className={styles.listDapps}>
          {data.map((item, index) => {
            console.log(getFavicon(item), "getFavicon(item)");
            return (
              <div key={index} className={styles.itemDapp}>
                <div className={styles.leftBlock}>
                  <div className={styles.wrapImg}>
                    <img src={getFavicon(item)} className={styles.img} />
                  </div>
                  <span className={styles.urlText}>
                    {limitString(item, 24)}
                  </span>
                </div>
                <div className={styles.rightBlock}>
                  <div
                    style={{
                      opacity: PrivilegedOrigins.includes(item) ? 0.5 : 1,
                    }}
                    onClick={() => removeDapps(item)}
                    className={styles.wrapLink}
                  >
                    <img
                      src={require("../../public/assets/svg/ow_link-unlink.svg")}
                      className={styles.img}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LayoutWithButtonBottom>
  );
});