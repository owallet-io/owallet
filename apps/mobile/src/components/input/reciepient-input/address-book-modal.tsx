import React, { useEffect, useState } from "react";
// import {BaseModalHeader} from '../../modal';
import { IMemoConfig, IRecipientConfig } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { Box } from "../../box";
import { FormattedMessage, useIntl } from "react-intl";
import { RecentSendHistory } from "@owallet/background";
import { AppCurrency, Key } from "@owallet/types";
import { useStore } from "../../../stores";
import { Stack } from "../../stack";
import { Text, View } from "react-native";
import { ScrollView } from "../../scroll-view/common-scroll-view";
import { useStyle } from "../../../styles";
import { DenomHelper } from "@owallet/common";
import { Bech32Address } from "@owallet/cosmos";
import { registerModal } from "@src/modals/base";
import OWText from "@components/text/ow-text";
import { AddressItem } from "@components/address-item";
import { OWEmpty } from "@components/empty";
import WrapViewModal from "@src/modals/wrap/wrap-view-modal";
import { OWButton } from "@components/button";
import { useTheme } from "@src/themes/theme-provider";

type Type = "recent" | "contacts" | "accounts";

export const AddressBookModal = registerModal(
  observer<{
    historyType: string;
    recipientConfig: IRecipientConfig;
    memoConfig: IMemoConfig;
    permitSelfKeyInfo?: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currency: AppCurrency;
  }>(
    ({
      historyType,
      recipientConfig,
      memoConfig,
      permitSelfKeyInfo,
      setIsOpen,
      currency,
    }) => {
      const { uiConfigStore, keyRingStore, chainStore } = useStore();

      const intl = useIntl();
      const style = useStyle();

      const [type, setType] = useState<Type>("recent");
      const [recents, setRecents] = useState<RecentSendHistory[]>([]);
      const [accounts, setAccounts] = useState<
        (Key & {
          vaultId: string;
        })[]
      >([]);

      useEffect(() => {
        uiConfigStore.addressBookConfig
          .getRecentSendHistory(recipientConfig.chainId, historyType)
          .then((res) => {
            setRecents(res);
          });
      }, [
        historyType,
        recipientConfig.chainId,
        uiConfigStore.addressBookConfig,
      ]);

      useEffect(() => {
        uiConfigStore.addressBookConfig
          .getVaultCosmosKeysSettled(
            recipientConfig.chainId,
            permitSelfKeyInfo ? undefined : keyRingStore.selectedKeyInfo?.id
          )
          .then((keys) => {
            setAccounts(
              keys
                .filter((res) => {
                  return res.status === "fulfilled";
                })
                .map((res) => {
                  if (res.status === "fulfilled") {
                    return res.value;
                  }
                  throw new Error("Unexpected status");
                })
            );
          });
      }, [
        keyRingStore.selectedKeyInfo?.id,
        permitSelfKeyInfo,
        recipientConfig.chainId,
        uiConfigStore.addressBookConfig,
      ]);

      const chainInfo = chainStore.getChain(recipientConfig.chainId);
      const isEvmChain = chainInfo.evm !== undefined;
      const isErc20 =
        new DenomHelper(currency.coinMinimalDenom).type === "erc20";

      const datas: {
        timestamp?: number;
        name?: string;
        address: string;
        memo?: string;

        isSelf?: boolean;
      }[] = (() => {
        switch (type) {
          case "recent": {
            return recents
              .map((recent) => {
                return {
                  timestamp: recent.timestamp,
                  address: recent.recipient,
                  memo: recent.memo,
                };
              })
              .filter((recent) => {
                if (isErc20 && !recent.address.startsWith("0x")) {
                  return false;
                }

                return true;
              });
          }
          case "contacts": {
            return uiConfigStore.addressBookConfig
              .getAddressBook(recipientConfig.chainId)
              .map((addressData) => {
                return {
                  name: addressData.name,
                  address: addressData.address,
                  memo: addressData.memo,
                };
              })
              .filter((contact) => {
                if (isErc20 && !contact.address.startsWith("0x")) {
                  return false;
                }

                return true;
              });
          }
          case "accounts": {
            return accounts.reduce<
              { name: string; address: string; isSelf: boolean }[]
            >((acc, account) => {
              const isSelf =
                keyRingStore.selectedKeyInfo?.id === account.vaultId;

              if (!isErc20 && !isEvmChain) {
                acc.push({
                  name: account.name,
                  address: account.bech32Address,
                  isSelf,
                });
              }

              if (isEvmChain) {
                acc.push({
                  name: account.name,
                  address: account.ethereumHexAddress,
                  isSelf,
                });
              }

              return acc;
            }, []);
          }
          default: {
            return [];
          }
        }
      })();
      const { colors } = useTheme();
      const navBar = [
        {
          id: "recent",
          label: intl.formatMessage({
            id: "components.address-book-modal.recent-tab",
          }),
        },
        {
          id: "contacts",
          label: intl.formatMessage({
            id: "components.address-book-modal.contacts-tab",
          }),
        },
        {
          id: "accounts",
          label: intl.formatMessage({
            id: "components.address-book-modal.my-wallets-tab",
          }),
        },
      ];
      return (
        <WrapViewModal
          title={intl.formatMessage({
            id: "components.address-book-modal.title",
          })}
        >
          <Box paddingX={12} paddingBottom={12}>
            <View
              style={{
                flexDirection: "row",
                paddingTop: 8,
                paddingBottom: 24,
                marginHorizontal: -27,
              }}
            >
              {navBar.map((item) => {
                return (
                  <OWButton
                    key={item.id}
                    size={"medium"}
                    type="link"
                    fullWidth={false}
                    label={item.label}
                    textStyle={{
                      color:
                        item.id === type
                          ? colors["primary-surface-default"]
                          : colors["neutral-text-body"],
                      fontWeight: item.id === type ? "600" : "500",
                      fontSize: item.id === type ? 15 : 14,
                    }}
                    onPress={() => setType(item.id as Type)}
                    style={[
                      {
                        borderRadius: 0,
                        flex: 1,
                      },
                      type === item.id
                        ? {
                            borderBottomColor:
                              colors["primary-surface-default"],
                            borderBottomWidth: 2,
                          }
                        : {
                            borderBottomColor: colors["neutral-border-default"],
                            borderBottomWidth: 1,
                          },
                    ]}
                  />
                );
              })}
            </View>

            <ScrollView isGestureScrollView={true} style={{ height: 450 }}>
              {datas.length > 0 ? (
                <Stack gutter={12}>
                  {(() => {
                    if (type !== "accounts" || !permitSelfKeyInfo) {
                      return datas.map((data, i) => {
                        return (
                          <AddressItem
                            key={i}
                            timestamp={data.timestamp}
                            name={data.name}
                            address={data.address}
                            memo={data.memo}
                            isShowMemo={type !== "accounts"}
                            onClick={() => {
                              recipientConfig.setValue(data.address);
                              memoConfig.setValue(data.memo ?? "");
                              setIsOpen(false);
                            }}
                          />
                        );
                      });
                    }
                    console.log(datas, "datas");
                    const selfAccount = datas.find((data) => data.isSelf);
                    console.log(selfAccount, "selfAccount");
                    const otherAccounts = datas.filter((data) => !data.isSelf);

                    return (
                      <React.Fragment>
                        {selfAccount ? (
                          <React.Fragment>
                            <OWText size={12} weight={"600"}>
                              <FormattedMessage id="components.address-book-modal.current-wallet" />
                            </OWText>
                            <AddressItem
                              name={selfAccount.name}
                              address={selfAccount.address}
                              isShowMemo={false}
                              onClick={() => {
                                recipientConfig.setValue(selfAccount.address);
                              }}
                              highlight={true}
                            />
                          </React.Fragment>
                        ) : null}

                        {otherAccounts.length > 0 ? (
                          <React.Fragment>
                            <OWText size={12} weight={"600"}>
                              <FormattedMessage id="components.address-book-modal.other-wallet" />
                            </OWText>
                            {otherAccounts.map((data, i) => {
                              return (
                                <AddressItem
                                  key={i}
                                  name={data.name}
                                  address={data.address}
                                  isShowMemo={false}
                                  onClick={() => {
                                    recipientConfig.setValue(data.address);
                                    setIsOpen(false);
                                  }}
                                />
                              );
                            })}
                          </React.Fragment>
                        ) : null}
                      </React.Fragment>
                    );
                  })()}
                </Stack>
              ) : (
                <Box alignX="center" alignY="center" height={400}>
                  <OWEmpty />
                </Box>
              )}
            </ScrollView>
          </Box>
        </WrapViewModal>
      );
    }
  )
);
