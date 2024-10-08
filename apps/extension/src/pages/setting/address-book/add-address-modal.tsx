import React, { FunctionComponent, useEffect, useState } from "react";
import { AddressInput, Input, MemoInput } from "../../../components/form";
import { Button } from "reactstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import { AddressBookConfig, MemoConfig, RecipientConfig } from "@owallet/hooks";
import style from "./style.module.scss";
/**
 *
 * @param closeModal
 * @param addAddressBook
 * @param chainInfo
 * @param index If index is lesser than 0, it is considered as adding address book. If index is equal or greater than 0, it is considered as editing address book.
 * @param addressBookKVStore
 * @constructor
 */
export const AddAddressModal: FunctionComponent<{
  closeModal: () => void;
  recipientConfig: RecipientConfig;
  memoConfig: MemoConfig;
  addressBookConfig: AddressBookConfig;
  index: number;
  typeAddress?: string;
  chainId: string;
}> = observer(
  ({
    closeModal,
    recipientConfig,
    memoConfig,
    addressBookConfig,
    index,
    typeAddress,
  }) => {
    const intl = useIntl();

    const [name, setName] = useState("");

    useEffect(() => {
      if (index >= 0 && typeAddress === "Edit") {
        const data = addressBookConfig.addressBookDatas[index];
        setName(data.name);
        recipientConfig.setRawRecipient(data.address);
        memoConfig.setMemo(data.memo);
      } else {
        setName("");
        recipientConfig.setRawRecipient("");
        memoConfig.setMemo("");
      }
    }, [
      addressBookConfig.addressBookDatas,
      index,
      memoConfig,
      recipientConfig,
    ]);

    return (
      <>
        <div className={style.textTypeAddress}>{typeAddress + " Address"}</div>
        <form className={style.formAdd}>
          <Input
            type="text"
            label={intl.formatMessage({ id: "setting.address-book.name" })}
            autoComplete="off"
            classNameInputGroup={style.inputGroup}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <AddressInput
            recipientConfig={recipientConfig}
            label={intl.formatMessage({ id: "setting.address-book.address" })}
            disableAddressBook={true}
          />
          <MemoInput
            memoConfig={memoConfig}
            label={intl.formatMessage({ id: "setting.address-book.memo" })}
          />
          <div
            style={{
              display: "flex",
            }}
          >
            <Button
              style={{
                width: "50%",
                border: "1px solid #7664E4",
                color: "#7664E4",
              }}
              onClick={() => closeModal()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={style.buttonSave}
              disabled={
                !name ||
                recipientConfig.getError() != null ||
                memoConfig.getError() != null
              }
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!recipientConfig.recipient) {
                  throw new Error("Invalid address");
                }

                if (index < 0) {
                  await addressBookConfig.addAddressBook({
                    name,
                    address: recipientConfig.recipient,
                    memo: memoConfig.memo,
                  });
                } else {
                  await addressBookConfig.editAddressBookAt(index, {
                    name,
                    address: recipientConfig.recipient,
                    memo: memoConfig.memo,
                  });
                }

                // Clear the recipient and memo before closing
                recipientConfig.setRawRecipient("");
                memoConfig.setMemo("");
                closeModal();
              }}
            >
              <FormattedMessage id={"setting.address-book.button.save"} />
            </Button>
          </div>
        </form>
      </>
    );
  }
);
