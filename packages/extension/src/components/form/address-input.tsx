import React, {
  CSSProperties,
  FunctionComponent,
  useMemo,
  useState,
} from "react";
import { Modal, InputGroup, Button, ModalBody } from "reactstrap";
import { Input } from "./input";
import { AddressBookPage } from "../../pages/setting/address-book";
import styleAddressInput from "./address-input.module.scss";
import {
  InvalidBech32Error,
  EmptyAddressError,
  IRecipientConfig,
  IMemoConfig,
  ENSNotSupportedError,
  ENSFailedToFetchError,
  ENSIsFetchingError,
  IIBCChannelConfig,
  InvalidEvmAddressError,
  InvalidTronAddressError,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { ObservableEnsFetcher } from "@owallet/ens";

export interface AddressInputProps {
  recipientConfig: IRecipientConfig;
  memoConfig?: IMemoConfig;
  ibcChannelConfig?: IIBCChannelConfig;
  className?: string;
  label?: string;
  placeholder?: string;
  inputStyle?: CSSProperties;
  disableAddressBook?: boolean;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const AddressInput: FunctionComponent<AddressInputProps> = observer(
  ({
    recipientConfig,
    memoConfig,
    ibcChannelConfig,
    className,
    label,
    disableAddressBook,
    disabled = false,
    placeholder,
    inputStyle,
    inputRef,
  }) => {
    const intl = useIntl();

    const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);

    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    const isENSAddress = ObservableEnsFetcher.isValidENS(
      recipientConfig.rawRecipient
    );

    const error = recipientConfig.getError();
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          case EmptyAddressError:
            // No need to show the error to user.
            return;
          case InvalidBech32Error:
            return intl.formatMessage({
              id: "input.recipient.error.invalid-bech32",
            });
          case InvalidEvmAddressError:
            return intl.formatMessage({
              id: "input.recipient.error.invalid-evm-address",
            });
          case InvalidTronAddressError:
            return intl.formatMessage({
              id: "input.recipient.error.invalid-tron-address",
            });
          case ENSNotSupportedError:
            return intl.formatMessage({
              id: "input.recipient.error.ens-not-supported",
            });
          case ENSFailedToFetchError:
            return intl.formatMessage({
              id: "input.recipient.error.ens-failed-to-fetch",
            });
          case ENSIsFetchingError:
            return;
          default:
            return intl.formatMessage({ id: "input.recipient.error.unknown" });
        }
      }
    }, [intl, error]);

    const isENSLoading: boolean = error instanceof ENSIsFetchingError;

    const selectAddressFromAddressBook = {
      setRecipient: (recipient: string) => {
        recipientConfig.setRawRecipient(recipient);
      },
      setMemo: (memo: string) => {
        if (memoConfig) {
          memoConfig.setMemo(memo);
        }
      },
    };

    return (
      <React.Fragment>
        <Modal
          isOpen={isAddressBookOpen}
          toggle={() => setIsAddressBookOpen(false)}
          centered
        >
          <ModalBody>
            <AddressBookPage
              onBackButton={() => setIsAddressBookOpen(false)}
              hideChainDropdown={true}
              selectHandler={selectAddressFromAddressBook}
              ibcChannelConfig={ibcChannelConfig}
              isInTransaction={true}
            />
          </ModalBody>
        </Modal>
        <div className={className}>
          <InputGroup className={styleAddressInput.inputGroup}>
            <Input
              loading={isENSLoading}
              styleInputGroup={inputStyle}
              id={inputId}
              label={label ?? ""}
              className={styleAddressInput.input}
              innerRef={inputRef}
              value={recipientConfig.rawRecipient}
              onChange={(e) => {
                recipientConfig.setRawRecipient(e.target.value);
                e.preventDefault();
              }}
              autoComplete="off"
              disabled={disabled}
              placeholder={placeholder}
              text={
                !isENSLoading && isENSAddress && !error
                  ? recipientConfig.recipient
                  : null
              }
              error={errorText != null ? errorText : null}
              rightIcon={
                !disableAddressBook && memoConfig ? (
                  <Button
                    className={styleAddressInput.addressBookButton}
                    type="button"
                    outline={true}
                    onClick={() => setIsAddressBookOpen(true)}
                    disabled={disabled}
                  >
                    <img
                      src={require("../../public/assets/icon/tdesign_address-book.svg")}
                      alt="logo"
                    />
                  </Button>
                ) : null
              }
            />
          </InputGroup>
          {/* {isENSLoading ? (
            <FormText>
              <i className="fa fa-spinner fa-spin fa-fw" />
            </FormText>
          ) : null} */}
          {/* {!isENSLoading && isENSAddress && !error ? <FormText>{recipientConfig.recipient}</FormText> : null} */}
          {/* {errorText != null ? <FormFeedback style={{ display: "block" }}>{errorText}</FormFeedback> : null} */}
        </div>
      </React.Fragment>
    );
  }
);
