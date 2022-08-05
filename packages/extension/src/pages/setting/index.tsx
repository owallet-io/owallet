import React, { FunctionComponent, ReactElement, useMemo } from 'react';
import { HeaderLayout } from '../../layouts';
import { useHistory } from 'react-router';
import { PageButton, PageButtonAccount } from './page-button';
import style from './style.module.scss';
import { useLanguage } from '@owallet/common';
import { useIntl } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import classNames from 'classnames';
import { Modal, Popover, PopoverBody, PopoverHeader } from 'reactstrap';

const styleTitle = {
  fontWeight: '400',
  fontSize: 14
};

const styleParagraph = {
  color: '#A6A6B0'
};

export const PageButtonSetting: FunctionComponent<{
  paragraph?: string;
  title?: string;
  modalBody?: ReactElement;
}> = ({ paragraph, title, modalBody }) => {
  const [isDepositOpen, setIsDepositOpen] = React.useState(false);
  const [tooltipId] = React.useState(() => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return `tools-${Buffer.from(bytes).toString('hex')}`;
  });
  return (
    <>
      <Popover
        target={tooltipId}
        isOpen={isDepositOpen}
        toggle={() => setIsDepositOpen(!isDepositOpen)}
        placement="bottom"
        className={style.popoverContainer}
        hideArrow
      >
        <PopoverBody
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={style.popoverContainer}
        >
          {modalBody}
        </PopoverBody>
      </Popover>
      <ul>
        <li>
          <div id={tooltipId} onClick={() => setIsDepositOpen(true)}>
            <div>{title}</div>
            <div className={classNames(style.paragraph)}>{paragraph}</div>
          </div>
        </li>
      </ul>
    </>
  );
};

export const SettingPage: FunctionComponent = observer(() => {
  const language = useLanguage();
  const history = useHistory();
  const intl = useIntl();

  const paragraphLang = language.automatic
    ? intl.formatMessage(
        {
          id: 'setting.language.automatic-with-language'
        },
        {
          language: intl.formatMessage({
            id: `setting.language.${language.language}`
          })
        }
      )
    : intl.formatMessage({
        id: `setting.language.${language.language}`
      });

  const paragraphFiat = !language.isFiatCurrencyAutomatic
    ? language.fiatCurrency.toUpperCase()
    : intl.formatMessage(
        {
          id: 'setting.fiat.automatic-with-fiat'
        },
        {
          fiat: language.fiatCurrency.toUpperCase()
        }
      );

  return (
    <>
      <div className={style.container}>
        <PageButtonSetting
          title={intl.formatMessage({
            id: 'setting.language'
          })}
          paragraph={paragraphLang}
          modalBody={
            <div>
              <div>English</div>
              <div>VN</div>
            </div>
          }
          // onClick={() => {
          //   history.push({
          //     pathname: '/setting/language'
          //   });
          // }}
          // icons={useMemo(
          //   () => [<i key="next" className="fas fa-chevron-right" />],
          //   []
          // )}
          // icons={[<KeyRingToolsIcon key="tools" />]}
          // styleTitle={styleTitle}
          // styleParagraph={styleParagraph}
        />
        <PageButtonSetting
          title={intl.formatMessage({
            id: 'setting.fiat'
          })}
          paragraph={paragraphFiat}
          // onClick={() => {
          //   history.push({
          //     pathname: '/setting/fiat'
          //   });
          // }}
          // icons={useMemo(
          //   () => [<i key="next" className="fas fa-chevron-right" />],
          //   []
          // )}
          // icons={[<KeyRingToolsIcon key="tools" />]}
          // styleTitle={styleTitle}
          // styleParagraph={styleParagraph}
        />
        <PageButtonSetting
          title={intl.formatMessage({
            id: 'setting.connections'
          })}
          paragraph={intl.formatMessage({
            id: 'setting.connections.paragraph'
          })}
          // onClick={() => {
          //   history.push({
          //     pathname: '/setting/connections'
          //   });
          // }}
          // icons={useMemo(
          //   () => [<i key="next" className="fas fa-chevron-right" />],
          //   []
          // )}
          // styleTitle={styleTitle}
          // styleParagraph={styleParagraph}
        />
        <PageButtonSetting
          title={intl.formatMessage({
            id: 'setting.export-to-mobile'
          })}
          paragraph={''}
          // onClick={() => {
          //   history.push({
          //     pathname: '/setting/export-to-mobile'
          //   });
          // }}
          // icons={useMemo(
          //   () => [<i key="next" className="fas fa-chevron-right" />],
          //   []
          // )}
          // styleTitle={styleTitle}
        />
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
        <PageButtonSetting
          title={intl.formatMessage({
            id: 'setting.credit'
          })}
          paragraph={''}
          // onClick={() => {
          //   history.push({
          //     pathname: '/setting/credit'
          //   });
          // }}
          // icons={useMemo(
          //   () => [<i key="next" className="fas fa-chevron-right" />],
          //   []
          // )}
          // styleTitle={styleTitle}
        />
      </div>
    </>
  );
});
