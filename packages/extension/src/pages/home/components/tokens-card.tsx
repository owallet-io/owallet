import React from "react";
import styles from "./style.module.scss";

export const TokensCard = () => {
  return (
    <div className={styles.containerTokenCard}>
      <div className={styles.searchInputContainer}>
        <img
          className={styles.iconSearch}
          src={require("../../../public/assets/images/owallet_search.svg")}
          alt="Search icon"
        />
        <input
          className={styles.searchInput}
          name={"search-token"}
          placeholder="Search by name"
        />
      </div>
      <div className={styles.listTokens}>
        {["1", "2"].map((item, index) => (
          <TokenItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

const TokenItem = ({ item }) => {
  return (
    <div className={styles.tokenItem}>
      <div className={styles.wrapLeftBlock}>
        <div className={styles.logoTokenAndChain}>
          <div className={styles.tokenWrap}>
            <img
              className={styles.token}
              src={require("../../../public/assets/images/default-avatar.png")}
            />
            <div className={styles.chainWrap}>
              <img
                className={styles.chain}
                src={require("../../../public/assets/images/default-avatar.png")}
              />
            </div>
          </div>
        </div>
        <div className={styles.bodyTokenItem}>
          <span className={styles.title}>USDT</span>
          <span className={styles.subTitle}>Oraichain</span>
        </div>
      </div>
      <div className={styles.rightBlock}>
        <span className={styles.title}>12,655,436.54</span>
        <span className={styles.subTitle}>$12,654,546.24</span>
      </div>
    </div>
  );
};
