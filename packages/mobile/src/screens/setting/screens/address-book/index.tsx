import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { observer } from 'mobx-react-lite';
import { useStyle } from '../../../../styles';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text } from '@src/components/text';
import { useSmartNavigation } from '../../../../navigation.provider';
import {
  IMemoConfig,
  IRecipientConfig,
  useAddressBookConfig
} from '@owallet/hooks';
import { AsyncKVStore } from '../../../../common';
import { useStore } from '../../../../stores';
import { AddIcon, SearchIcon, TrashCanIcon } from '../../../../components/icon';
import { Bech32Address } from '@owallet/cosmos';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTheme } from '@src/themes/theme-provider';
import { RectButton } from '../../../../components/rect-button';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import {
  HeaderLeftButton,
  HeaderRightButton
} from '../../../../components/header';
import {
  HeaderAddIcon,
  HeaderBackButtonIcon
} from '../../../../components/header/icon';
import { AddressBookIcon } from '../../../../components/icon';
import { useConfirmModal } from '../../../../providers/confirm-modal';
import { spacing, typography } from '../../../../themes';
import { TextInput } from '../../../../components/input';
import { CustomHeader } from '../../../../navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/stack';
import { PageWithScrollView } from '../../../../components/page';

const addressBookItemComponent = {
  inTransaction: RectButton,
  inSetting: View
};

const styling = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    addressBookRoot: {
      padding: spacing['22'],
      backgroundColor: colors['primary'],
      marginTop: spacing['16'],
      borderRadius: spacing['24']
    },
    addressBookItem: {
      marginTop: spacing['16'],
      backgroundColor: colors['background-item-list'],
      paddingVertical: spacing['12'],
      paddingHorizontal: spacing['16'],
      borderRadius: spacing['8']
    },
    addressBookAdd: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    }
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
  const [nameSearch, setNameSearch] = useState<string>('');
  const [contractList, setContractList] = useState<any[]>([]);
  const { chainStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const confirmModal = useConfirmModal();

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
    new AsyncKVStore('address_book'),
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
      }
    }
  );

  const isInTransaction = recipientConfig != null || memoConfig != null;
  const AddressBookItem =
    addressBookItemComponent[isInTransaction ? 'inTransaction' : 'inSetting'];

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
      : nameSearch !== '' && contractList.length === 0
      ? []
      : addressBookConfig.addressBookDatas;

  return (
    <PageWithScrollView backgroundColor={colors['background']}>
      <View style={{ alignItems: 'center', marginTop: spacing['16'] }}>
        <Text
          style={{
            ...typography.h3,
            fontWeight: '700',
            color: colors['primary-text']
          }}
        >
          Address book
        </Text>
      </View>
      <View
        style={{
          ...styles.addressBookRoot
        }}
      >
        <View>
          <TextInput
            inputRight={
              <RectButton onPress={onNameSearch}>
                <SearchIcon color={colors['purple-900']} size={20} />
              </RectButton>
            }
            placeholder="Search by address, namespace"
            inputContainerStyle={{
              borderColor: colors['purple-400'],
              borderTopLeftRadius: spacing['8'],
              borderTopRightRadius: spacing['8'],
              borderBottomLeftRadius: spacing['8'],
              borderBottomRightRadius: spacing['8']
            }}
            value={nameSearch}
            onChangeText={(text) => {
              setNameSearch(text);
              debouncedHandler(text);
            }}
          />
        </View>
        <View style={styles.addressBookAdd}>
          <Text
            style={{
              fontWeight: '400',
              fontSize: 16,
              color: colors['gray-300']
            }}
          >
            Contact list
          </Text>
          <RectButton
            onPress={() => {
              smartNavigation.navigateSmart('AddAddressBook', {
                chainId,
                addressBookConfig,
                recipient: ''
              });
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ marginTop: 4 }}>
                <AddIcon color={colors['purple-900']} size={16} />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  lineHeight: 20,
                  color: colors['purple-900']
                }}
              >
                Add new contract
              </Text>
            </View>
          </RectButton>
        </View>

        <View>
          {contractData.map((data, i) => {
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
                      'flex-row',
                      'justify-between',
                      'items-center'
                    ])}
                  >
                    <View>
                      <Text
                        variant='body1'
                        typo='bold'
                      >
                        {data.name}
                      </Text>
                      {/* <Text
                        style={style.flatten([
                          'body3',
                          'color-text-black-low',
                          'margin-bottom-4'
                        ])}
                      >
                        {data.memo}
                      </Text> */}
                      <Text
                        variant='caption'
                        typo='bold'
                        color={colors['gray-300']}
                      >
                        {Bech32Address.shortenAddress(data.address, 30)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        alignItems: 'flex-start'
                      }}
                      onPress={async () => {
                        if (
                          await confirmModal.confirm({
                            title: 'Remove contact',
                            paragraph:
                              'Are you sure you want to remove this address?',
                            yesButtonText: 'Remove',
                            noButtonText: 'Cancel',
                            titleStyleCustom: {
                              color: colors['orange-800']
                            },
                            modalRootCustom: {
                              alignItems: 'flex-start'
                            },
                            contentStyleCustom: {
                              textAlign: 'left'
                            },
                            noBtnStyleCustom: {
                              backgroundColor: colors['gray-10'],
                              color: colors['purple-900'],
                              borderColor: 'transparent'
                            },
                            yesBtnStyleCustom: {
                              backgroundColor: colors['orange-800']
                            }
                          })
                        ) {
                          await addressBookConfig.removeAddressBook(i);
                        }
                      }}
                    >
                      <TrashCanIcon
                        color={
                          style.get('color-text-black-very-very-low').color
                        }
                        size={24}
                      />
                    </TouchableOpacity>
                  </View>
                </AddressBookItem>
                {addressBookConfig.addressBookDatas.length - 1 !== i ? (
                  <View
                    style={style.flatten([
                      'height-1',
                      'background-color-border-white'
                    ])}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </PageWithScrollView>
  );
});

export * from './add';
