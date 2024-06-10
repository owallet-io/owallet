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
    </div>
  );
};
