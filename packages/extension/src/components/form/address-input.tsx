import React, {
  CSSProperties,
  FunctionComponent,
  useMemo,
  useState,
} from "react";
import {
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Modal,
  InputGroup,
  Button,
  FormText,
  ModalBody,
} from "reactstrap";
// import Modal from 'react-modal';
import { AddressBookPage } from "../../pages/setting/address-book";

import styleAddressInput from "./address-input.module.scss";
import classnames from "classnames";
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
        <FormGroup className={className}>
          {label ? (
            <Label for={inputId} className="form-control-label">
              {label}
            </Label>
          ) : null}
          <InputGroup className={styleAddressInput.inputGroup}>
            <Input
              id={inputId}
              className={classnames(
                "form-control-alternative",
                styleAddressInput.input
              )}
              innerRef={inputRef}
              value={recipientConfig.rawRecipient}
              onChange={(e) => {
                recipientConfig.setRawRecipient(e.target.value);
                e.preventDefault();
              }}
              autoComplete="off"
              disabled={disabled}
              placeholder={placeholder}
            />
            {!disableAddressBook && memoConfig ? (
              <Button
                className={styleAddressInput.addressBookButton}
                type="button"
                outline={true}
                onClick={() => setIsAddressBookOpen(true)}
                disabled={disabled}
              >
                {/* <i className="fas fa-address-book" /> */}
                <img
                  src={require("../../public/assets/svg/address-book.svg")}
                  alt="logo"
                />
              </Button>
            ) : null}
          </InputGroup>
          {isENSLoading ? (
            <FormText>
              <i className="fa fa-spinner fa-spin fa-fw" />
            </FormText>
          ) : null}
          {!isENSLoading && isENSAddress && !error ? (
            <FormText>{recipientConfig.recipient}</FormText>
          ) : null}
          {errorText != null ? (
            <FormFeedback style={{ display: "block" }}>
              {errorText}
            </FormFeedback>
          ) : null}
        </FormGroup>
      </React.Fragment>
    );
  }
);
