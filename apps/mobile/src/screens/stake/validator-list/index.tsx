// import { ValidatorThumbnails } from "@owallet/common";
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { PageWithView } from '../../../components/page';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@src/components/text';
import { Staking } from '@owallet/stores';
import { CoinPretty, Dec } from '@owallet/unit';
import { RouteProp, useRoute } from '@react-navigation/native';
import { OWSubTitleHeader } from '@src/components/header';
import { useTheme } from '@src/themes/theme-provider';
import { API } from '../../../common/api';
import { CardDivider } from '../../../components/card';
import { AlertIcon, ArrowOpsiteUpDownIcon, ValidatorOutlineIcon } from '../../../components/icon';
import { SelectorModal, TextInput } from '../../../components/input';
import { RectButton } from '../../../components/rect-button';

import { spacing, typography } from '../../../themes';
import OWFlatList from '@src/components/page/ow-flat-list';
import { ValidatorThumbnail } from '@src/components/thumbnail';
import { tracking } from '@src/utils/tracking';
import { goBack, navigate } from '@src/router/root';
import { SCREENS } from '@src/common/constants';
type Sort = 'APR' | 'Amount Staked' | 'Name';

export const ValidatorListScreen: FunctionComponent = observer(() => {
  useEffect(() => {
    tracking(`Stake Screen`);

    return () => {};
  }, []);

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
  const [sort, setSort] = useState<Sort>('Amount Staked');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded);

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
      data = data.filter(val => val?.description?.moniker?.toLowerCase().includes(search.toLowerCase()));
    }

    switch (sort) {
      case 'APR':
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(new Dec(val2.commission.commission_rates.rate))
            ? 1
            : -1;
        });
        break;
      case 'Name':
        data.sort((val1, val2) => {
          if (!val1?.description.moniker) {
            return 1;
          }
          if (!val2?.description.moniker) {
            return -1;
          }
          return val1?.description.moniker > val2?.description.moniker ? -1 : 1;
        });
        break;
      case 'Amount Staked':
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
      { label: 'Amount Staked', key: 'Amount Staked' },
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
  const paragraph = () => {
    return (
      <View style={styles.containerParagraph}>
        <View style={styles.flexRow}>
          <ValidatorOutlineIcon color={colors['primary-text']} size={16} />
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
          style={styles.sortBtn}
          onPress={() => {
            setIsSortModalOpen(true);
          }}
        >
          <Text
            style={[
              styles.title,
              ,
              {
                color: colors['sub-primary-text']
              },
              styles.titleLabel
            ]}
          >
            {sortItem.label}
          </Text>
          <ArrowOpsiteUpDownIcon size={24} color={colors['border']} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Validator; index: number }) => {
    const foundValidator = validators.find(v => v.operator_address === item.operator_address);
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
          uptime={foundValidator?.uptime}
          apr={foundValidator?.apr ?? 0}
          index={index}
          sort={sort}
          onSelectValidator={route.params.validatorSelector}
        />
      </View>
    );
  };
  const separateComponentItem = () => <CardDivider backgroundColor={colors['border-input-login']} />;
  return (
    <PageWithView>
      <SelectorModal
        close={() => {
          setIsSortModalOpen(false);
        }}
        isOpen={isSortModalOpen}
        items={items}
        selectedKey={sort}
        setSelectedKey={key => setSort(key as Sort)}
      />
      <View>
        <OWSubTitleHeader title="Active validators" />
        <View style={styles.containerHeader}>
          <TextInput
            label="Search"
            placeholder="Search"
            labelStyle={{
              display: 'none'
            }}
            containerStyle={styles.containerSearch}
            value={search}
            onChangeText={text => {
              setSearch(text);
            }}
            paragraph={paragraph}
          />
        </View>
      </View>
      <OWFlatList data={data} renderItem={renderItem} ItemSeparatorComponent={separateComponentItem} />
    </PageWithView>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  apr: number;
  index: number;
  sort: Sort;
  uptime: number;
  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(({ validatorAddress, apr, onSelectValidator, uptime }) => {
  const { chainStore, queriesStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const queries = queriesStore.get(chainStore.current.chainId);
  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded);
  const validator = bondedValidators.getValidator(validatorAddress);

  return validator ? (
    <RectButton
      style={{
        ...styles.container,
        flexDirection: 'row',
        backgroundColor: colors['neutral-surface-bg2'],
        alignItems: 'center',
        borderWidth: 0.5
        // borderColor: uptime < 0.9 ? colors["danger"] : colors["background"],
      }}
      onPress={() => {
        if (onSelectValidator) {
          onSelectValidator(validatorAddress);
          goBack();
        } else {
          navigate(SCREENS.ValidatorDetails, {
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
        url={bondedValidators.getValidatorThumbnail(validator.operator_address)}
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
            // color: uptime < 0.9 ? colors['danger'] : colors['primary-text']
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {validator?.description.moniker} {/* {uptime < 0.9 ? <AlertIcon color={colors.danger} size={16} /> : null} */}
        </Text>

        <Text
          style={{
            ...styles.textInfo,
            color: colors['sub-primary-text']
          }}
        >
          {new CoinPretty(chainStore.current.stakeCurrency, new Dec(validator.tokens))
            .maxDecimals(0)
            .hideDenom(true)
            .toString() + ' staked'}
        </Text>
        <Text
          style={{
            ...styles.textInfo,
            color: colors['primary-text']
            // color: uptime < 0.9 ? colors['danger'] : colors['primary-text']
          }}
        >
          {`Uptime: ${(uptime * 100).toFixed(2)}%`}
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
        APR: {apr && apr > 0 ? apr.toFixed(2).toString() + '%' : ''}
      </Text>
    </RectButton>
  ) : null;
});

const styling = colors =>
  StyleSheet.create({
    containerSearch: {
      padding: 0
    },
    titleLabel: {
      marginRight: spacing['10'],
      textTransform: 'uppercase',

      marginBottom: spacing['8']
    },
    sortBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing['2'],
      position: 'absolute',
      right: -25
    },
    flexRow: {
      flex: 1,
      flexDirection: 'row'
    },
    containerParagraph: {
      flexDirection: 'row',
      marginTop: spacing['32'],
      marginHorizontal: spacing['16']
    },
    containerHeader: {
      paddingHorizontal: spacing['24'],
      paddingTop: spacing['24'],
      paddingBottom: spacing['4']
    },
    title: {
      ...typography.h7,
      fontWeight: '400',
      color: colors['gray-700']
    },
    container: {
      backgroundColor: colors['neutral-surface-bg'],
      flexDirection: 'row',
      paddingTop: spacing['8'],
      paddingBottom: spacing['8'],
      paddingLeft: spacing['8'],
      paddingRight: spacing['16'],
      borderRadius: 8
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
