import { Dec } from '@owallet/unit';
// import crashlytics from '@react-native-firebase/crashlytics';
import { SCREENS } from '@src/common/constants';
import { OWButton } from '@src/components/button';
// import OWButtonIcon from '@src/components/button/ow-button-icon';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { showToast } from '@src/utils/helper';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { OWBox } from '../../components/card';
import { useSmartNavigation } from '../../navigation.provider';
import { navigate } from '../../router/root';
import { useStore } from '../../stores';
import { metrics, spacing, typography } from '../../themes';
import { WarningView } from './warning-view';

export const EarningCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const smartNavigation = useSmartNavigation();
  const { chainStore, accountStore, queriesStore, priceStore, analyticsStore } = useStore();
  const { colors } = useTheme();
  const chainId = chainStore.current.chainId;
  const styles = styling(colors);
  const queries = queriesStore.get(chainId);
  const account = accountStore.getAccount(chainId);
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(account.bech32Address);
  const delegated = queryDelegated.total;
  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(account.bech32Address);

  const totalPrice = priceStore.calculatePrice(delegated);

  const stakingReward = queryReward.stakableReward;
  const totalStakingReward = priceStore.calculatePrice(stakingReward);

  const _onPressClaim = async () => {
    // crashlytics().log('earning_card _onPressClaim');
    try {
      await account.cosmos.sendWithdrawDelegationRewardMsgs(
        queryReward.getDescendingPendingRewardValidatorAddresses(8),
        '',
        {},
        {},
        {
          onBroadcasted: txHash => {
            analyticsStore.logEvent('Claim reward tx broadcasted', {
              chainId: chainId,
              chainName: chainStore.current.chainName
            });
            smartNavigation.pushSmart('TxPendingResult', {
              txHash: Buffer.from(txHash).toString('hex')
            });
          }
        },
        stakingReward.currency.coinMinimalDenom
      );
    } catch (e) {
      // crashlytics().recordError(e);
      console.error({ errorClaim: e });

      // if (e?.message === 'Request rejected') {
      //   return;
      // }
      // if (e?.message.includes('Cannot read properties of undefined' || 'undefined is not an object')) {
      //   return;
      // }
      showToast({
        message: e?.message ?? 'Something went wrong! Please try again later.',
        type: 'danger'
      });
    }
  };
  const decimalChain = chainStore?.current?.stakeCurrency?.coinDecimals;
  return (
    <OWBox
      style={{
        marginBottom: spacing['page-pad']
      }}
    >
      <View style={styles.cardBody}>
        <Text style={[{ ...styles['text-earn'] }, { color: colors['primary-text'] }]}>Earnings</Text>
        <Image
          style={{
            width: 120,
            height: 90,
            marginTop: spacing['24']
          }}
          source={require('../../assets/image/money.png')}
          resizeMode="contain"
          fadeDuration={0}
        />
        <Text
          style={[
            {
              ...styles['text-amount']
            },
            { color: colors['primary-text'] }
          ]}
        >
          {stakingReward.toDec().gt(new Dec(0.001))
            ? stakingReward.shrink(true).maxDecimals(6).trim(true).upperCase(true).toString()
            : `< 0.001 ${stakingReward.toCoin().denom.toUpperCase()}`}
        </Text>
        <Text style={[styles['amount']]}>
          {totalStakingReward ? totalStakingReward.toString() : stakingReward.shrink(true).maxDecimals(6).toString()}
        </Text>

        <OWButton
          label="Claim Rewards"
          size="medium"
          onPress={_onPressClaim}
          textStyle={styles.btnTextClaimStyle}
          disabled={
            !account.isReadyToSendMsgs ||
            stakingReward.toDec().equals(new Dec(0)) ||
            queryReward.pendingRewardValidatorAddresses.length === 0
          }
          loading={account.isSendingMsg === 'withdrawRewards'}
          style={styles.btnClaimStyle}
          icon={
            <OWIcon
              name="rewards"
              size={20}
              color={
                !account.isReadyToSendMsgs ||
                stakingReward.toDec().equals(new Dec(0)) ||
                queryReward.pendingRewardValidatorAddresses.length === 0
                  ? colors['text-btn-disable-color']
                  : colors['white']
              }
            />
          }
        />
        <WarningView />

        <OWBox type="shadow" style={styles['view-box-staking']}>
          <Text style={{ marginBottom: 20, color: colors['gray-300'] }}>Total staked</Text>
          <View
            style={{
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Image
                style={{
                  width: 44,
                  height: 44
                }}
                source={require('../../assets/image/orai_earning.png')}
                resizeMode="contain"
                fadeDuration={0}
              />
              <View style={{ paddingLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 22,
                    color: colors['primary-text'],
                    fontWeight: '700'
                  }}
                >
                  {delegated.shrink(true).maxDecimals(6).trim(true).upperCase(true).toString()}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: '700',
                    color: colors['gray-300']
                  }}
                >
                  {totalPrice ? totalPrice.toString() : delegated.shrink(true).maxDecimals(6).toString()}
                </Text>
              </View>
            </View>
            {/* <OWButtonIcon
              style={{
                marginRight: -14
              }}
              fullWidth={false}
              onPress={() => {
                smartNavigation.navigateSmart('Staking.Dashboard', {});
              }}
              name="add"
              sizeIcon={24}
              colorIcon={colors['gray-150']}
            /> */}
          </View>
          <View>
            <OWButton
              type="secondary"
              size="medium"
              label="Manage my staking"
              onPress={() => {
                navigate('MainTab', { screen: SCREENS.TABS.Invest });
              }}
            />
          </View>
        </OWBox>
      </View>
    </OWBox>
  );
});

const styling = colors =>
  StyleSheet.create({
    btnClaimStyle: {
      marginTop: 10
    },
    btnTextClaimStyle: {
      paddingLeft: 6
    },
    card: {
      paddingBottom: spacing['20'],
      marginTop: spacing['32'],
      borderTopLeftRadius: spacing['24'],
      borderTopRightRadius: spacing['24'],
      backgroundColor: colors['primary'],
      padding: spacing['24']
    },
    cardBody: {
      // backgroundColor: colors['primary'],
      alignItems: 'center'
    },
    'flex-center': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },

    'text-earn': {
      fontWeight: '800',
      fontSize: 16,
      lineHeight: 22,
      color: colors['black']
    },
    'text-amount': {
      fontWeight: '900',
      fontSize: 24,
      lineHeight: 34,
      color: colors['black']
    },
    'text-rewards': {
      ...typography['h7'],
      lineHeight: spacing['20'],
      color: colors['white'],
      paddingLeft: spacing['6'],
      fontWeight: '700'
    },
    amount: {
      fontWeight: '700',
      fontSize: 16,
      lineHeight: 22,
      color: colors['gray-300']
    },
    'btn-claim': {
      backgroundColor: colors['primary-surface-default'],
      borderWidth: 0.5,
      marginTop: 16,
      width: metrics.screenWidth - 48,
      borderRadius: spacing['12']
    },
    'btn-manage': {
      backgroundColor: colors['primary-background'],
      borderWidth: 0.5,
      padding: 10,
      width: metrics.screenWidth - 80,
      borderRadius: spacing['12'],
      borderColor: colors['border']
    },
    'view-box-staking': {
      height: 176,
      marginTop: 24,
      width: metrics.screenWidth - 48,
      borderRadius: spacing['12'],
      padding: 16,
      display: 'flex',
      justifyContent: 'space-around',
      shadowColor: '#18274B',
      shadowOffset: {
        width: 0,
        height: 12
      },
      shadowOpacity: 0.12,
      shadowRadius: 16.0
    }
  });
