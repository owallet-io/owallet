import React from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IMemoConfig,
  InvalidHexError,
  IRecipientConfig,
  IRecipientConfigWithENS,
  IRecipientConfigWithICNS,
} from "@owallet/hooks";
import { ProfileIcon } from "../../icon";
import { Box } from "../../box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../icon-button";
import { ColorPalette } from "../../../styles";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { AppCurrency } from "@owallet/types";

export interface RecipientInputWithAddressBookProps {
  recipientConfig: IRecipientConfig;

  memoConfig: IMemoConfig;
  currency: AppCurrency;

  permitAddressBookSelfKeyInfo?: boolean;
}
export interface RecipientInputWithoutAddressBookProps {
  recipientConfig:
    | IRecipientConfig
    | IRecipientConfigWithICNS
    | IRecipientConfigWithENS;
  memoConfig?: undefined;

  hideAddressBookButton: true;
}

export type RecipientInputProps = (
  | RecipientInputWithAddressBookProps
  | RecipientInputWithoutAddressBookProps
) & {
  bottom?: React.ReactNode;
  checkSendMySelft?: string;
};

export const TronRecipientInput = observer<
  RecipientInputProps,
  HTMLInputElement
>(
  (props, ref) => {
    const { analyticsStore } = useStore();

    const intl = useIntl();
    const theme = useTheme();
    const { recipientConfig, memoConfig, checkSendMySelft } = props;

    console.log("is checkSendMySelft", checkSendMySelft);

    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

    const isICNSName: boolean = (() => {
      if ("isICNSName" in recipientConfig) {
        return recipientConfig.isICNSName;
      }
      return false;
    })();

    const isENSName: boolean = (() => {
      if ("isENSName" in recipientConfig) {
        return recipientConfig.isENSName;
      }
      return false;
    })();

    return (
      <Box>
        <TextInput
          ref={ref}
          label={intl.formatMessage({
            id: "components.input.recipient-input.wallet-address-only-label",
          })}
          value={recipientConfig.value}
          autoComplete="off"
          onChange={(e) => {
            let value = e.target.value;

            recipientConfig.setValue(value);

            e.preventDefault();
          }}
          right={
            memoConfig ? (
              <IconButton
                onClick={() => {
                  analyticsStore.logEvent("click_addressBookButton");
                  setIsAddressBookModalOpen(true);
                }}
                hoverColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-500"]
                }
                padding="0.25rem"
              >
                <ProfileIcon width="1.5rem" height="1.5rem" />
              </IconButton>
            ) : null
          }
          paragraph={(() => {
            if (
              (isICNSName || isENSName) &&
              !recipientConfig.uiProperties.error
            ) {
              return recipientConfig.recipient;
            }
          })()}
          bottom={props.bottom}
          error={(() => {
            const uiProperties = recipientConfig.uiProperties;

            const err = uiProperties.error || uiProperties.warning;

            if (err instanceof EmptyAddressError) {
              return;
            }

            if (checkSendMySelft) {
              return checkSendMySelft;
            }

            if (err instanceof InvalidHexError) {
              return;
            }

            if (err) {
              return err.message || err.toString();
            }
          })()}
        />

        {memoConfig ? (
          <AddressBookModal
            isOpen={isAddressBookModalOpen}
            close={() => setIsAddressBookModalOpen(false)}
            //@ts-ignore
            historyType={props.historyType}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            //@ts-ignore
            currency={props.currency}
            //@ts-ignore
            permitSelfKeyInfo={props.permitAddressBookSelfKeyInfo}
          />
        ) : null}
      </Box>
    );
  },
  {
    forwardRef: true,
  }
);
