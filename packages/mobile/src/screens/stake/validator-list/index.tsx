import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { PageWithSectionList } from '../../../components/page';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CText as Text } from '../../../components/text';
import { BondStatus, Validator } from '@owallet/stores';
import { SelectorModal, TextInput } from '../../../components/input';
import { CardDivider } from '../../../components/card';
import { useSmartNavigation } from '../../../navigation.provider';
import { CoinPretty, Dec } from '@owallet/unit';
import {
  ArrowOpsiteUpDownIcon,
  ValidatorOutlineIcon
} from '../../../components/icon';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { RouteProp, useRoute, useTheme } from '@react-navigation/native';
import { RectButton } from '../../../components/rect-button';
import { ValidatorThumbnails } from '@owallet/common';
import { colors, spacing, typography } from '../../../themes';
import { API } from '../../../common/api';

type Sort = 'APR' | 'Voting Power' | 'Name';

export const ValidatorListScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorSelector?: (validatorAddress: string) => void;
        }
      >,
      string
    >
  >();

  const { chainStore, queriesStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);
  const { colors } = useTheme();
  const styles = styling(colors);
  const [search, setSearch] = useState('');
  const [validators, setValidators] = useState([]);
  const [sort, setSort] = useState<Sort>('Voting Power');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  useEffect(() => {
    (async function get() {
      try {
        const res = await API.getValidatorList(
          {},
          {
            baseURL: 'https://api.scan.orai.io'
          }
        );
        setValidators(res.data.data);
      } catch (error) {}
    })();
  }, []);

  const data = useMemo(() => {
    let data = bondedValidators.validators;
    if (search) {
      data = data.filter(val =>
        val.description.moniker?.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case 'APR':
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(
            new Dec(val2.commission.commission_rates.rate)
          )
            ? 1
            : -1;
        });
        break;
      case 'Name':
        data.sort((val1, val2) => {
          if (!val1.description.moniker) {
            return 1;
          }
          if (!val2.description.moniker) {
            return -1;
          }
          return val1.description.moniker > val2.description.moniker ? -1 : 1;
        });
        break;
      case 'Voting Power':
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? -1 : 1;
        });
        break;
    }

    return data;
  }, [bondedValidators.validators, search, sort]);

  const items = useMemo(() => {
    return [
      { label: 'APR', key: 'APR' },
      { label: 'Amount Staked', key: 'Voting Power' },
      { label: 'Name', key: 'Name' }
    ];
  }, []);

  const sortItem = useMemo(() => {
    const item = items.find(item => item.key === sort);
    if (!item) {
      throw new Error(`Can't find the item for sort (${sort})`);
    }
    return item;
  }, [items, sort]);

  return (
    <React.Fragment>
      <SelectorModal
        close={() => {
          setIsSortModalOpen(false);
        }}
        isOpen={isSortModalOpen}
        items={items}
        selectedKey={sort}
        setSelectedKey={key => setSort(key as Sort)}
      />

      <PageWithSectionList
        style={{
          marginBottom: 70,
          backgroundColor: colors['background']
        }}
        sections={[
          {
            data
          }
        ]}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item: Validator) => item.operator_address}
        renderSectionFooter={() => {
          return <View style={{ height: spacing['24'] }} />;
        }}
        renderItem={({ item, index }: { item: Validator; index: number }) => {
          const foundValidator = validators.find(
            v => v.operator_address === item.operator_address
          );

          return (
            <View
              style={{
                marginHorizontal: spacing['24'],
                marginVertical: spacing['8'],
                borderRadius: spacing['8']
              }}
            >
              <ValidatorItem
                validatorAddress={item.operator_address}
                apr={foundValidator?.apr ?? 0}
                index={index}
                sort={sort}
                onSelectValidator={route.params.validatorSelector}
              />
            </View>
          );
        }}
        ItemSeparatorComponent={() => <CardDivider />}
        renderSectionHeader={() => {
          return (
            <View>
              <Text
                style={{
                  ...typography.h3,
                  fontWeight: '700',
                  textAlign: 'center',
                  color: colors['primary-text']
                }}
              >
                {`Active validators`}
              </Text>
              <View
                style={{
                  paddingHorizontal: spacing['24'],
                  paddingTop: spacing['12'],
                  paddingBottom: spacing['4']
                }}
              >
                <TextInput
                  label="Search"
                  placeholder="Search"
                  labelStyle={{
                    display: 'none'
                  }}
                  containerStyle={{
                    padding: 0
                  }}
                  value={search}
                  onChangeText={text => {
                    setSearch(text);
                  }}
                  paragraph={
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: spacing['32'],
                        marginHorizontal: spacing['16']
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row'
                        }}
                      >
                        <ValidatorOutlineIcon
                          color={colors['primary-text']}
                          size={16}
                        />
                        <Text
                          style={{
                            ...styles.title,
                            marginLeft: spacing['8'],
                            color: colors['sub-primary-text']
                          }}
                        >
                          {`Validator list`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: spacing['2'],
                          position: 'absolute',
                          right: -25
                        }}
                        onPress={() => {
                          setIsSortModalOpen(true);
                        }}
                      >
                        <Text
                          style={{
                            ...styles.title,
                            marginRight: spacing['10'],
                            textTransform: 'uppercase',
                            color: colors['sub-primary-text'],
                            marginBottom: spacing['8']
                          }}
                        >
                          {sortItem.label}
                        </Text>
                        <ArrowOpsiteUpDownIcon
                          size={24}
                          color={colors['gray-900']}
                        />
                      </TouchableOpacity>
                    </View>
                  }
                />
              </View>
            </View>
          );
        }}
      />
    </React.Fragment>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  apr: number;
  index: number;
  sort: Sort;

  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(({ validatorAddress, index, sort, apr, onSelectValidator }) => {
  const { chainStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const queries = queriesStore.get(chainStore.current.chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );
  const validator = bondedValidators.getValidator(validatorAddress);
  const smartNavigation = useSmartNavigation();

  return validator ? (
    <RectButton
      style={{
        ...styles.container,
        flexDirection: 'row',
        backgroundColor: colors['item'],
        alignItems: 'center'
      }}
      onPress={() => {
        if (onSelectValidator) {
          onSelectValidator(validatorAddress);
          smartNavigation.goBack();
        } else {
          smartNavigation.navigateSmart('Validator.Details', {
            validatorAddress,
            apr
          });
        }
      }}
    >
      <ValidatorThumbnail
        style={{
          marginRight: spacing['8']
        }}
        size={38}
        url={
          ValidatorThumbnails[validator.operator_address] ??
          bondedValidators.getValidatorThumbnail(validator.operator_address)
        }
      />

      <View
        style={{
          ...styles.containerInfo
        }}
      >
        <Text
          style={{
            ...styles.textInfo,
            color: colors['primary-text']
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {validator.description.moniker}
        </Text>

        <Text
          style={{
            ...styles.textInfo,
            color: colors['sub-primary-text']
          }}
        >
          {new CoinPretty(
            chainStore.current.stakeCurrency,
            new Dec(validator.tokens)
          )
            .maxDecimals(0)
            .hideDenom(true)
            .toString() + ' staked'}
        </Text>
      </View>
      <View
        style={{
          flex: 1
        }}
      />
      <Text
        style={{
          ...styles.textInfo,
          color: colors['primary-text']
        }}
      >
        {apr && apr > 0 ? apr.toFixed(2).toString() + '%' : ''}
      </Text>
    </RectButton>
  ) : null;
});

const styling = colors =>
  StyleSheet.create({
    title: {
      ...typography.h7,
      fontWeight: '400',
      color: colors['gray-700']
    },
    container: {
      backgroundColor: colors['background'],
      flexDirection: 'row',
      paddingTop: spacing['8'],
      paddingBottom: spacing['8'],
      paddingLeft: spacing['8'],
      paddingRight: spacing['16']
    },
    containerInfo: {
      marginLeft: spacing['12']
    },
    textInfo: {
      ...typography.h6,
      fontWeight: '400',
      color: colors['gray-900']
    }
  });
