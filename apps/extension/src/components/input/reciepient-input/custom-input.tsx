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
import { Box } from "../../box";
import { AddressBookModal } from "../../address-book-modal";
import { IconButton } from "../../icon-button";
import { ColorPalette } from "../../../styles";
import { useStore } from "../../../stores";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { AppCurrency } from "@owallet/types";
import { ContactIcon } from "components/icon/contact";

export interface RecipientInputWithAddressBookProps {
  historyType: string;
  recipientConfig:
    | IRecipientConfig
    | IRecipientConfigWithICNS
    | IRecipientConfigWithENS;
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
  customCondition?: string;
};

function numOfCharacter(str: string, c: string): number {
  return str.split(c).length - 1;
}

export const CustomRecipientInput = observer<
  RecipientInputProps,
  HTMLInputElement
>(
  (props, ref) => {
    const { analyticsStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();
    const { recipientConfig, memoConfig, customCondition } = props;

    const [isAddressBookModalOpen, setIsAddressBookModalOpen] =
      React.useState(false);

    const isICNSName: boolean = (() => {
      if ("isICNSName" in recipientConfig) {
        return recipientConfig.isICNSName;
      }
      return false;
    })();
    const isICNSEnabled: boolean = (() => {
      if ("isICNSEnabled" in recipientConfig) {
        return recipientConfig.isICNSEnabled;
      }
      return false;
    })();
    const isICNSFetching: boolean = (() => {
      if ("isICNSFetching" in recipientConfig) {
        return recipientConfig.isICNSFetching;
      }
      return false;
    })();

    const isENSName: boolean = (() => {
      if ("isENSName" in recipientConfig) {
        return recipientConfig.isENSName;
      }
      return false;
    })();
    const isENSEnabled: boolean = (() => {
      if ("isENSEnabled" in recipientConfig) {
        return recipientConfig.isENSEnabled;
      }
      return false;
    })();
    const isENSFetching: boolean = (() => {
      if ("isENSFetching" in recipientConfig) {
        return recipientConfig.isENSFetching;
      }
      return false;
    })();

    return (
      <Box>
        <TextInput
          ref={ref}
          border={false}
          label={intl.formatMessage({
            id:
              isICNSEnabled && isENSEnabled
                ? "components.input.recipient-input.wallet-address-label-icns-ens"
                : isENSEnabled
                ? "components.input.recipient-input.wallet-address-label-ens"
                : "components.input.recipient-input.wallet-address-label",
          })}
          value={recipientConfig.value}
          autoComplete="off"
          onChange={(e) => {
            let value = e.target.value;

            if (
              // If icns is possible and users enters ".", complete bech32 prefix automatically.
              "isICNSEnabled" in recipientConfig &&
              isICNSEnabled &&
              value.length > 0 &&
              value[value.length - 1] === "." &&
              numOfCharacter(value, ".") === 1 &&
              numOfCharacter(recipientConfig.value, ".") === 0
            ) {
              value = value + recipientConfig.icnsExpectedBech32Prefix;
            }

            if (
              // If ens is possible and users enters ".", append ens  domain automatically.
              "isENSEnabled" in recipientConfig &&
              isENSEnabled &&
              value.length > 0 &&
              value[value.length - 1] === "." &&
              numOfCharacter(value, ".") === 1 &&
              numOfCharacter(recipientConfig.value, ".") === 0
            ) {
              value = value + recipientConfig.ensExpectedDomain;
            }

            recipientConfig.setValue(value);

            e.preventDefault();
          }}
          placeholder={"Enter recipient address"}
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
                <ContactIcon width="1.5rem" height="1.5rem" />
              </IconButton>
            ) : null
          }
          isLoading={isICNSFetching || isENSFetching}
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

            if (customCondition) {
              return customCondition;
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
