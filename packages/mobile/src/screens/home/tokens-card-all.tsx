import { OWButton } from '@src/components/button';
import { OWEmpty } from '@src/components/empty';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CardBody, OWBox } from '../../components/card';
import { useStore } from '../../stores';
import { spacing } from '../../themes';
import { getTokenInfos, _keyExtract } from '../../utils/helper';
import { useCoinGeckoPrices } from '@owallet/hooks';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import { useSmartNavigation } from '@src/navigation.provider';
import { SCREENS } from '@src/common/constants';
import { navigate } from '@src/router/root';
import { RightArrowIcon } from '@src/components/icon';

export const TokensCardAll: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { accountStore, universalSwapStore, chainStore } = useStore();
  const { colors } = useTheme();
  const [more, setMore] = useState(true);
  const account = accountStore.getAccount(chainStore.current.chainId);

  const { data: prices } = useCoinGeckoPrices();

  const styles = styling();

  const smartNavigation = useSmartNavigation();

  const onPressToken = async item => {
    chainStore.selectChain(item?.chainId);
    await chainStore.saveLastViewChainId();
    if (!account.isNanoLedger) {
      if (chainStore.current.networkType === 'bitcoin') {
        navigate(SCREENS.STACK.Others, {
          screen: SCREENS.SendBtc
        });
        return;
      }
      smartNavigation.navigateSmart('Send', {
        currency: item.denom,
        contractAddress: item.contractAddress
      });
    }
  };

  const renderTokenItem = useCallback(
    item => {
      if (item) {
        return (
          <TouchableOpacity
            onPress={() => {
              onPressToken(item);
            }}
            style={styles.btnItem}
          >
            <View style={styles.leftBoxItem}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: colors['gray-10']
                }}
              >
                <OWIcon type="images" source={{ uri: item.icon }} size={35} />
              </View>
              <View style={styles.pl10}>
                <Text size={16} color={colors['text-title']} weight="500">
                  {item.asset}
                </Text>
                <Text weight="500" color={colors['blue-400']}>
                  {item.chain}
                </Text>
              </View>
            </View>
            <View style={styles.rightBoxItem}>
              <View style={{ flexDirection: 'row' }}>
                <View>
                  <Text color={colors['text-title']}>{item.balance}</Text>
                  <Text weight="500" color={colors['blue-400']}>
                    ${item.value.toFixed(6)}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 0.5,
                    justifyContent: 'center',
                    paddingLeft: 20
                  }}
                >
                  <RightArrowIcon height={12} color={colors['primary-text']} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    },
    [universalSwapStore?.getAmount]
  );

  return (
    <View style={containerStyle}>
      <OWBox
        style={{
          paddingTop: 12
        }}
      >
        <View style={styles.wrapHeaderTitle}>
          <OWButton
            type="link"
            label={'Tokens'}
            textStyle={{
              color: colors['primary-text'],
              fontWeight: '700'
            }}
            style={{
              width: '100%',
              borderBottomColor: colors['primary-text'],
              borderBottomWidth: 2
            }}
          />
        </View>

        <CardBody>
          {getTokenInfos({ tokens: universalSwapStore.getAmount, prices }).length > 0 ? (
            getTokenInfos({ tokens: universalSwapStore.getAmount, prices }).map((token, index) => {
              if (more) {
                if (index < 3) return renderTokenItem(token);
              } else {
                return renderTokenItem(token);
              }
            })
          ) : (
            <OWEmpty />
          )}
        </CardBody>
        <OWButton
          label={more ? 'View all' : 'Hide'}
          size="medium"
          type="secondary"
          onPress={() => {
            setMore(!more);
          }}
        />
      </OWBox>
    </View>
  );
});

const styling = () =>
  StyleSheet.create({
    wrapHeaderTitle: {
      flexDirection: 'row',
      marginHorizontal: spacing['page-pad']
    },
    pl10: {
      paddingLeft: 10
    },
    leftBoxItem: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    rightBoxItem: {
      alignItems: 'flex-end'
    },
    btnItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10
    }
  });
