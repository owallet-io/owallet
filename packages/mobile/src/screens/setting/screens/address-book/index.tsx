import { Bech32Address } from "@owallet/cosmos";
import {
  IMemoConfig,
  IRecipientConfig,
  useAddressBookConfig,
} from "@owallet/hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { OWButton } from "@src/components/button";
import OWCard from "@src/components/card/ow-card";
import { OWEmpty } from "@src/components/empty";
import { PageHeader } from "@src/components/header/header-new";
import OWIcon from "@src/components/ow-icon/ow-icon";
import OWText from "@src/components/text/ow-text";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useState } from "react";
import { Image, StyleSheet, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AsyncKVStore } from "../../../../common";
import { PageWithScrollView } from "../../../../components/page";
import { RectButton } from "../../../../components/rect-button";
import { useSmartNavigation } from "../../../../navigation.provider";
import { useStore } from "../../../../stores";
import { useStyle } from "../../../../styles";
import { metrics, spacing } from "../../../../themes";

const addressBookItemComponent = {
  inTransaction: RectButton,
  inSetting: View,
};

const DeleteContactModal: FunctionComponent = ({
  addressBookConfig,
  i,
  close,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ alignItems: "center" }}>
      <Image
        style={{
          width: 114,
          height: 126,
        }}
        fadeDuration={0}
        resizeMode="contain"
        source={require("../../../../assets/image/img_delete.png")}
      />
      <View style={{ padding: 16 }}>
        <OWText weight="700" size={16}>
          {"delete contact?".toUpperCase()}
        </OWText>
      </View>
      <OWText color={colors["neutral-text-body"]} weight="500" size={14}>
        {"Are you sure you want to delete this contact?"}
      </OWText>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 48,
        }}
      >
        <OWButton
          onPress={close}
          type="secondary"
          label="Cancel"
          style={[
            {
              borderRadius: 999,
              width: metrics.screenWidth / 2.2,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
          }}
        />
        <OWButton
          onPress={() => {
            close();
            addressBookConfig.removeAddressBook(i);
          }}
          type="danger"
          label="Yes, delete it"
          style={[
            {
              marginLeft: 8,
              borderRadius: 999,
              width: metrics.screenWidth / 2.2,
            },
          ]}
          textStyle={{
            fontSize: 14,
            fontWeight: "600",
          }}
        />
      </View>
    </View>
  );
};

const styling = () => {
  return StyleSheet.create({
    addressBookRoot: {
      padding: spacing["22"],

      marginTop: spacing["16"],
      borderRadius: spacing["24"],
    },
    addressBookItem: {
      marginTop: spacing["16"],

      paddingVertical: spacing["12"],
      paddingHorizontal: spacing["16"],
      borderRadius: spacing["8"],
    },
    addressBookAdd: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });
};

const debounce = (fn, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

export const AddressBookScreen: FunctionComponent = observer(() => {
  const [nameSearch, setNameSearch] = useState<string>("");
  const [contractList, setContractList] = useState<any[]>([]);
  const { chainStore, modalStore } = useStore();
  const { colors } = useTheme();
  const styles = styling();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          recipientConfig?: IRecipientConfig;
          memoConfig?: IMemoConfig;
        }
      >,
      string
    >
  >();

  const recipientConfig = route.params.recipientConfig;
  const memoConfig = route.params.memoConfig;

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const chainId = recipientConfig
    ? recipientConfig.chainId
    : chainStore.current.chainId;

  const addressBookConfig = useAddressBookConfig(
    new AsyncKVStore("address_book"),
    chainStore,
    chainId,
    {
      setRecipient: (recipient: string) => {
        if (recipientConfig) {
          recipientConfig.setRawRecipient(recipient);
        }
      },
      setMemo: (memo: string) => {
        if (memoConfig) {
          memoConfig.setMemo(memo);
        }
      },
    }
  );

  const onPressDeletekModal = (i) => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    // @ts-ignore
    modalStore.setChildren(
      <DeleteContactModal
        addressBookConfig={addressBookConfig}
        i={i}
        close={() => modalStore.close()}
      />
    );
  };

  const isInTransaction = recipientConfig != null || memoConfig != null;
  const AddressBookItem =
    addressBookItemComponent[isInTransaction ? "inTransaction" : "inSetting"];

  const onNameSearch = (txt) => {
    const searchWord = txt ?? nameSearch;
    if (searchWord) {
      const addressList = addressBookConfig.addressBookDatas;
      if (addressList.length > 0) {
        const newAdressList = addressList.filter((address) =>
          address.name.toLowerCase().includes(searchWord.toLowerCase())
        );
        return setContractList(newAdressList);
      }
    }
    return setContractList([]);
  };

  const debouncedHandler = useCallback(debounce(onNameSearch, 300), []);

  const contractData =
    contractList.length > 0
      ? contractList
      : nameSearch !== "" && contractList.length === 0
      ? []
      : addressBookConfig.addressBookDatas;

  return (
    <PageWithScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{}}
      backgroundColor={colors["neutral-surface-bg"]}
    >
      <PageHeader title="Address book" colors={colors} />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors["neutral-surface-action"],
          height: 40,
          borderRadius: 999,
          alignItems: "center",
          paddingHorizontal: 12,
          marginHorizontal: 16,
        }}
      >
        <View style={{ paddingRight: 4 }}>
          <OWIcon
            color={colors["neutral-icon-on-light"]}
            name="tdesign_search"
            size={16}
          />
        </View>
        <TextInput
          style={{
            fontFamily: "SpaceGrotesk-Regular",
            width: "100%",
          }}
          value={nameSearch}
          onChangeText={(text) => {
            setNameSearch(text);
            debouncedHandler(text);
          }}
          placeholderTextColor={colors["neutral-text-body"]}
          placeholder="Search by address or contact name"
        />
      </View>
      <View style={{ padding: 16 }}>
        <OWButton
          textStyle={{
            fontWeight: "600",
            color: colors["primary-text-action"],
          }}
          contentAlign="left"
          onPress={() => {
            smartNavigation.navigateSmart("AddAddressBook", {
              chainId,
              addressBookConfig,
              recipient: "",
            });
          }}
          label="Add contact"
          fullWidth={false}
          type="link"
          style={{
            height: "auto",
          }}
          size="medium"
          icon={
            <OWIcon
              name="add"
              color={colors["primary-text-action"]}
              size={16}
            />
          }
        />
      </View>

      <OWCard type="normal">
        {contractData?.length > 0 ? (
          contractData.map((data, i) => {
            return (
              <React.Fragment key={i.toString()}>
                <AddressBookItem
                  style={styles.addressBookItem}
                  enabled={isInTransaction}
                  onPress={() => {
                    if (isInTransaction) {
                      addressBookConfig.selectAddressAt(i);
                      smartNavigation.goBack();
                    }
                  }}
                >
                  <View
                    style={style.flatten([
                      "flex-row",
                      "justify-between",
                      "items-center",
                    ])}
                  >
                    <View>
                      <OWText weight="600" size={16}>
                        {data.name}
                      </OWText>
                      {/* <Text
                        style={style.flatten([
                          'body3',
                          'color-text-black-low',
                          'margin-bottom-4'
                        ])}
                      >
                        {data.memo}
                      </Text> */}
                      <OWText color={colors["neutral-text-body"]}>
                        {Bech32Address.shortenAddress(data.address, 30)}
                      </OWText>
                    </View>
                    <TouchableOpacity
                      style={{
                        alignItems: "flex-start",
                      }}
                      onPress={() => {
                        //   if (
                        //     await confirmModal.confirm({
                        //       title: "Remove contact",
                        //       paragraph: "Are you sure you want to remove this address?",
                        //       yesButtonText: "Remove",
                        //       noButtonText: "Cancel",
                        //       titleStyleCustom: {
                        //         color: colors["orange-800"]
                        //       },
                        //       modalRootCustom: {
                        //         alignItems: "flex-start"
                        //       },
                        //       contentStyleCustom: {
                        //         textAlign: "left"
                        //       },
                        //       noBtnStyleCustom: {
                        //         backgroundColor: colors["gray-10"],
                        //         color: colors["primary-surface-default"],
                        //         borderColor: "transparent"
                        //       },
                        //       yesBtnStyleCustom: {
                        //         backgroundColor: colors["orange-800"]
                        //       }
                        //     })
                        //   ) {
                        //     await addressBookConfig.removeAddressBook(i);
                        //   }
                        // }}
                        onPressDeletekModal(i);
                      }}
                    >
                      <OWIcon
                        size={20}
                        name="tdesign_delete"
                        color={colors["error-text-action"]}
                      />
                    </TouchableOpacity>
                  </View>
                </AddressBookItem>
              </React.Fragment>
            );
          })
        ) : (
          <OWEmpty />
        )}
      </OWCard>
    </PageWithScrollView>
  );
});

export * from "./add";
