import React, { FunctionComponent } from "react";

import classmames from "classnames";
import style from "./style.module.scss";
import { Text } from "../common/text";

interface Props {
  icon: string;
  logo?: string;
  title?: string;
  subtitle: string;
  subtitle2?: string;
}

export const Banner: FunctionComponent<Props> = ({
  icon,
  title = "OWallet",
  logo,
  subtitle,
  subtitle2,
}) => {
  return (
    <div>
      <div className={style.logoGroup}>
        <img className={style.logo} src={logo} alt="logo" />
        <Text size={18} weight="600">
          {title}
        </Text>
      </div>
      <div className={classmames(style.container)}>
        <div className={style.logoContainer}>
          <div>
            <img className={style.icon} src={icon} alt="icon" />
          </div>
          <div className={style.logoInnerContainer}>
            <div className={style.title}>{subtitle}</div>
            <div className={style.title}>{subtitle2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
