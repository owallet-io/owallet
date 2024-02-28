import React, { FunctionComponent } from "react";

import styleMenu from "./menu.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";

import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router";
import { HeaderLayout } from "../../layouts";
import { AddressBookPage } from "../setting/address-book";
import { Card, CardBody } from "reactstrap";
import classnames from "classnames";
import { SettingPage } from "../setting";
import { AddTokenPage } from "../setting/token/add";
import { AddEvmTokenPage } from "../setting/token-evm/add";
import { ManageTokenPage } from "../setting/token/manage";

export const Menu: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();
  const [isNumberTabs, setIsNumberTabs] = React.useState<number>(0);
  const history = useHistory();

  return (
    <HeaderLayout showChainName canChangeChainInfo>
      <div className={styleMenu.container}>
        <div
          className={styleMenu.item}
          onClick={() => {
            if (isNumberTabs === 1) return setIsNumberTabs(0);
            setIsNumberTabs(1);
          }}
        >
          <FormattedMessage id="main.menu.address-book" />
          <div
          // style={{
          //   marginRight: isNumberTabs ? -10 : 0
          // }}
          >
            <img
              src={require(isNumberTabs === 1
                ? "../../public/assets/img/arrow-up.svg"
                : "../../public/assets/img/arrow-down.svg")}
              alt="total-balance"
              width={14}
            />
          </div>
        </div>
        {isNumberTabs === 1 && (
          <Card className={classnames(styleMenu.card, "shadow")}>
            <CardBody>
              <AddressBookPage
                onBackButton={() => setIsNumberTabs(0)}
                hideChainDropdown={false}
                isCloseIcon={true}
                isInTransaction={true}
              />
            </CardBody>
          </Card>
        )}
        <div
          className={styleMenu.item}
          onClick={() => {
            if (isNumberTabs === 2) return setIsNumberTabs(0);
            setIsNumberTabs(2);
          }}
        >
          <FormattedMessage id="main.menu.settings" />
          <div>
            <img
              src={require(isNumberTabs === 2
                ? "../../public/assets/img/arrow-up.svg"
                : "../../public/assets/img/arrow-down.svg")}
              alt="total-balance"
              width={14}
            />
          </div>
        </div>
        {isNumberTabs === 2 && (
          <div className={classnames(styleMenu.settings)}>
            <SettingPage />
          </div>
        )}

        {(chainStore.current.features ?? []).find(
          (feature) =>
            feature === "cosmwasm" ||
            feature === "secretwasm" ||
            feature === "isEvm"
        ) ? (
          <div
            className={styleMenu.item}
            onClick={() => {
              if (isNumberTabs === 3) return setIsNumberTabs(0);
              setIsNumberTabs(3);
            }}
          >
            <FormattedMessage id="setting.token.add" />
            <div>
              <img
                src={require("../../public/assets/img/arrow-down.svg")}
                alt="total-balance"
                width={14}
              />
            </div>
          </div>
        ) : null}
        {isNumberTabs === 3 && (
          <Card className={classnames(styleMenu.cardAddToken, "shadow")}>
            <CardBody>
              {chainStore.current.features.includes("cosmwasm") ||
              chainStore.current.features.includes("secretwasm") ? (
                <AddTokenPage />
              ) : (
                <AddEvmTokenPage />
              )}
            </CardBody>
          </Card>
        )}
        {(chainStore.current.features ?? []).find(
          (feature) => feature === "cosmwasm" || feature === "secretwasm"
        ) ? (
          <div
            className={styleMenu.item}
            onClick={() => {
              if (isNumberTabs === 4) return setIsNumberTabs(0);
              setIsNumberTabs(4);
            }}
          >
            <FormattedMessage id="main.menu.token-list" />
            <div>
              <img
                src={require("../../public/assets/img/arrow-down.svg")}
                alt="total-balance"
                width={14}
              />
            </div>
          </div>
        ) : null}
        {isNumberTabs === 4 && (
          <Card className={classnames(styleMenu.card, "shadow")}>
            <CardBody>
              <ManageTokenPage />
            </CardBody>
          </Card>
        )}
        {/* Empty div for separating last item */}
        <div style={{ flex: 1 }} />
        <div
          className={`${styleMenu.itemSignOut} ${styleMenu.signOut}`}
          onClick={async () => {
            await keyRingStore.lock();
            history.push("/");
          }}
        >
          <FormattedMessage id="main.menu.sign-out" />
        </div>
        <div className={styleMenu.footer}>
          <a
            className={styleMenu.inner}
            href="https://github.com/oraichain/oraichain-wallet-v2.git"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-github" />
            {/* <div style={{ padding: 6, backgroundColor: 'rgba(119, 126, 144, 0.12)' }}> */}
            <FormattedMessage id="main.menu.footer.github" />
            {/* </div> */}
          </a>
        </div>
      </div>
    </HeaderLayout>
  );
});
