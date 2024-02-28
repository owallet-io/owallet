import React, {
  CSSProperties,
  FunctionComponent,
  ReactElement,
  useCallback,
  useMemo,
} from "react";
import { useHistory } from "react-router";
import { PageButton, PageButtonAccount } from "./page-button";
import style from "./style.module.scss";
import { useLanguage } from "@owallet/common";
import { useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import classNames from "classnames";
import {
  Card,
  CardBody,
  Modal,
  ModalBody,
  Popover,
  PopoverBody,
  PopoverHeader,
} from "reactstrap";
import { ExportToMobilePage } from "../setting/export-to-mobile";
import { CreditPage } from "../setting/credit";
import { SettingConnectionsPage } from "../setting/connections";

export const PageButtonSetting: FunctionComponent<{
  paragraph?: string;
  title?: string;
  modalBody?: ReactElement;
  styles?: CSSProperties;
  classNameSetting?: any;
  disable?: boolean;
  isHasTabs?: number;
  setIsHasTabs?: any;
  type?: number;
}> = ({
  paragraph,
  title,
  modalBody,
  styles,
  classNameSetting,
  disable,
  isHasTabs,
  setIsHasTabs,
  type,
}) => {
  const [isDepositOpen, setIsDepositOpen] = React.useState(false);
  const intl = useIntl();
  const [tooltipId] = React.useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `tools-${Buffer.from(bytes).toString("hex")}`;
  });
  return (
    <>
      {!disable && (
        <Popover
          target={tooltipId}
          isOpen={isDepositOpen}
          toggle={() => setIsDepositOpen(!isDepositOpen)}
          style={styles}
          className={classNameSetting ?? style.popoverContainer}
          hideArrow
        >
          <PopoverBody
            onClick={(e) => {
              if (
                title !=
                intl.formatMessage({
                  id: "setting.export-to-mobile",
                })
              ) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            style={styles}
            className={classNameSetting ?? style.popoverContainer}
          >
            {modalBody}
          </PopoverBody>
        </Popover>
      )}
      <ul style={{ cursor: "pointer" }}>
        <li>
          <div
            id={tooltipId}
            onClick={() =>
              setIsHasTabs
                ? setIsHasTabs(type == isHasTabs ? 0 : type)
                : setIsDepositOpen(true)
            }
          >
            <div>{title}</div>
            <div className={classNames(style.paragraph)}>{paragraph}</div>
          </div>
        </li>
      </ul>
    </>
  );
};

export const SettingPage: FunctionComponent = observer(() => {
  const { uiConfigStore, priceStore } = useStore();
  const [isHasTabs, setIsHasTabs] = React.useState(0);
  const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();
  const selectedIcon = useMemo(
    () => [<i key="selected" className="fas fa-check" />],
    []
  );

  const paragraphLang = language.automatic
    ? intl.formatMessage(
        {
          id: "setting.language.automatic-with-language",
        },
        {
          language: intl.formatMessage({
            id: `setting.language.${language.language}`,
          }),
        }
      )
    : intl.formatMessage({
        id: `setting.language.${language.language}`,
      });

  const paragraphFiat = !language.isFiatCurrencyAutomatic
    ? language.fiatCurrency.toUpperCase()
    : intl.formatMessage(
        {
          id: "setting.fiat.automatic-with-fiat",
        },
        {
          fiat: language.fiatCurrency.toUpperCase(),
        }
      );

  return (
    <>
      <div className={style.container}>
        <PageButtonSetting
          title={intl.formatMessage({
            id: "setting.language",
          })}
          paragraph={paragraphLang}
          disable={true}
          // modalBody={
          //   <div style={{ padding: 10 }}>
          //     {[
          //       {
          //         lang: 'en',
          //         title: 'English',
          //         text: 'English'
          //       },
          //       {
          //         lang: 'ko',
          //         title: 'Korea',
          //         text: '한국어'
          //       }
          //     ].map((la, i) => {
          //       return (
          //         <div className={style.settingModalLang} key={i}>
          //           <img
          //             src={require(la.lang === 'en'
          //               ? '../../public/assets/flag/english.svg'
          //               : '../../public/assets/flag/korea.svg')}
          //             alt="total-balance"
          //             width={20}
          //           />
          //           <div style={{ width: 12 }} />
          //           <span
          //             className={classNames(style.textLang)}
          //             style={{
          //               color: paragraphLang == la.text ? '#7664E4' : '#353945'
          //             }}
          //             onClick={useCallback(() => {
          //               language.setLanguage(la.lang);
          //               history.replace('/');
          //               // history.push({
          //               //   pathname: '/'
          //               // });
          //             }, [history, language])}
          //           >
          //             {la.title}
          //           </span>
          //         </div>
          //       );
          //     })}
          //   </div>
          // }
        />
        <PageButtonSetting
          title={intl.formatMessage({
            id: "setting.fiat",
          })}
          paragraph={paragraphFiat}
          modalBody={
            <div style={{ padding: 10, height: 250, overflow: "auto" }}>
              {Object.keys(priceStore.supportedVsCurrencies).map((currency) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const fiatCurrency =
                  priceStore.supportedVsCurrencies[currency]!;

                return (
                  <div
                    key={fiatCurrency.currency}
                    className={style.settingModalCur}
                    onClick={() => {
                      language.setFiatCurrency(fiatCurrency.currency);
                      history.push({
                        pathname: "/",
                      });
                    }}
                    style={{
                      color:
                        paragraphFiat.toUpperCase() ==
                        fiatCurrency.currency.toUpperCase()
                          ? "#7664E4"
                          : "#353945",
                    }}
                  >
                    {!language.isFiatCurrencyAutomatic
                      ? language.fiatCurrency === fiatCurrency.currency
                        ? selectedIcon
                        : undefined
                      : undefined}
                    <div style={{ width: 6 }} />
                    <span className={classNames(style.textCurrency)}>
                      {fiatCurrency.currency.toUpperCase()}
                    </span>
                    <div style={{ width: 6 }} />
                    <span>{fiatCurrency.symbol}</span>
                  </div>
                );
              })}
            </div>
          }
        />
        <PageButtonSetting
          title={intl.formatMessage({
            id: "setting.connections",
          })}
          paragraph={intl.formatMessage({
            id: "setting.connections.paragraph",
          })}
          disable={true}
          setIsHasTabs={setIsHasTabs}
          isHasTabs={isHasTabs}
          type={1}
        />
        {isHasTabs === 1 && (
          <Modal isOpen={!!isHasTabs} centered toggle={() => setIsHasTabs(0)}>
            <ModalBody>
              <SettingConnectionsPage toggleModal={() => setIsHasTabs(0)} />
            </ModalBody>
          </Modal>
        )}

        {/* <PageButtonSetting
          title={intl.formatMessage({
            id: 'setting.export-to-mobile'
          })}
          paragraph={''}
          disable={true}
          setIsHasTabs={setIsHasTabs}
          isHasTabs={isHasTabs}
          type={2}
        />
        {isHasTabs === 2 && (
          <Card>
            <CardBody>
              <ExportToMobilePage />
            </CardBody>
          </Card>
        )} */}

        {/* <PageButton
          title="Show Advanced IBC Transfers"
          onClick={() => {
            uiConfigStore.setShowAdvancedIBCTransfer(
              !uiConfigStore.showAdvancedIBCTransfer
            );
          }}
          icons={[
            <label
              key="toggle"
              className={classNames('custom-toggle', style.toggleBtn)}
            >
              <input
                type="checkbox"
                checked={uiConfigStore.showAdvancedIBCTransfer}
                onChange={() => {
                  uiConfigStore.setShowAdvancedIBCTransfer(
                    !uiConfigStore.showAdvancedIBCTransfer
                  );
                }}
              />
              <span
                className={classNames(
                  'custom-toggle-slider rounded-circle',
                  style.toggleSlider
                )}
              />
            </label>
          ]}
          styleTitle={styleTitle}
        /> */}
        {/* <PageButtonSetting
          title={intl.formatMessage({
            id: 'setting.credit'
          })}
          paragraph={''}
          modalBody={
            <div style={{ width: 175 }}>
              <CreditPage />
            </div>
          }
          // icons={useMemo(
          //   () => [<i key="next" className="fas fa-chevron-right" />],
          //   []
          // )}
        /> */}
      </div>
    </>
  );
});
