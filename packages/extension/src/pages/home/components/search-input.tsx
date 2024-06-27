import React, { FC } from "react";
import styles from "./style.module.scss";
import classnames from "classnames";

export const SearchInput: FC<{
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  containerClassNames?: any;
}> = ({ onChange, placeholder = "Search by name", containerClassNames }) => {
  return (
    <div
      className={classnames([styles.searchInputContainer, containerClassNames])}
    >
      <img
        className={styles.iconSearch}
        src={require("assets/images/owallet_search.svg")}
        alt="Search icon"
      />
      <input
        onChange={onChange}
        className={styles.searchInput}
        name={"search-token"}
        placeholder={placeholder}
      />
    </div>
  );
};
