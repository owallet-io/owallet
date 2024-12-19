import React from "react";
import { TextInput } from "../text-input";
import { observer } from "mobx-react-lite";
import {
  EmptyAddressError,
  IMemoConfig,
  InvalidHexError,
  InvalidTronAddressError,
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
import { AppCurrency, ChainIdEVM } from "@owallet/types";

export interface RecipientInputWithAddressBookProps {
  historyType: string;
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
};

export const TronRecipientInput = observer<
  RecipientInputProps,
  HTMLInputElement
>(
  (props, ref) => {
    const { analyticsStore, tronAccountStore } = useStore();
    const account = tronAccountStore.getAccount(ChainIdEVM.TRON);

    const sender = account.base58Address;
    const intl = useIntl();
    const theme = useTheme();
    const { recipientConfig, memoConfig } = props;

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

    const checkSendMySelft =
      recipientConfig.recipient?.trim() === sender
        ? new InvalidTronAddressError("Cannot transfer TRX to the same account")
        : null;

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

            if (err instanceof InvalidHexError) {
              return;
            }

            if (err) {
              return err.message || err.toString();
            }

            if (checkSendMySelft) {
              return checkSendMySelft.message;
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
