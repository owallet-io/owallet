import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { Card, CardBody } from '../../../components/card';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CText as Text } from '../../../components/text';
import { useStyle } from '../../../styles';
import { Button } from '../../../components/button';
import { Dec } from '@owallet/unit';
import { useSmartNavigation } from '../../../navigation.provider';
import { spacing, typography } from '../../../themes';
import { DownArrowIcon } from '../../../components/icon';
import { useTheme } from '@src/themes/theme-provider';
export const MyRewardCard: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore, analyticsStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );

  const pendingStakableReward =
    queries.cosmos.queryRewards.getQueryBech32Address(
      account.bech32Address
    ).stakableReward;
  const stakingReward = queryReward.stakableReward;
  const apy = queries.cosmos.queryInflation.inflation;

  const smartNavigation = useSmartNavigation();

  const isDisable =
    !account.isReadyToSendMsgs ||
    pendingStakableReward.toDec().equals(new Dec(0)) ||
    queryReward.pendingRewardValidatorAddresses.length === 0;

  return (
    <View style={containerStyle}>
      <View
        style={{
          backgroundColor: colors['primary']
        }}
      >
        <Text
          style={{
            ...styles.textInfo,
            fontWeight: '700',
            color: colors['sub-primary-text']
          }}
        >
          My Pending Rewards
          {/* <Text style={{
            ...typography['h7'],
            color: colors['purple-700']
          }}>
            {`${apy.maxDecimals(2).trim(true).toString()}% per year`}
          </Text>
          ) */}
        </Text>

        <View>
          <Text
            style={{
              ...styles.textInfo,
              marginTop: spacing['4'],
              fontWeight: '400',
              fontSize: 20,
              color: colors['sub-primary-text']
            }}
          >
            {pendingStakableReward
              .shrink(true)
              .maxDecimals(6)
              .trim(true)
              .upperCase(true)
              .toString()}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: spacing['8']
            }}
          >
            <Button
              size="small"
              text="Claim"
              mode="outline"
              rightIcon={
                <DownArrowIcon
                  color={isDisable ? colors['gray-300'] : colors['purple-900']}
                  height={18}
                />
              }
              containerStyle={{
                ...styles.containerBtn
              }}
              style={{
                ...styles.btn
              }}
              textStyle={{
                ...styles.textInfo,
                fontWeight: '400',
                color: isDisable ? colors['gray-300'] : colors['purple-900'],
                marginRight: 10
              }}
              onPress={async () => {
                try {
                  await account.cosmos.sendWithdrawDelegationRewardMsgs(
                    queryReward.getDescendingPendingRewardValidatorAddresses(8),
                    '',
                    {},
                    {},
                    {
                      onFulfill: tx => {
                        console.log(
                          tx,
                          'TX INFO ON SEND PAGE!!!!!!!!!!!!!!!!!!!!!'
                        );
                      },
                      onBroadcasted: txHash => {
                        analyticsStore.logEvent('Claim reward tx broadcasted', {
                          chainId: chainStore.current.chainId,
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
                  console.log({ errorClaim: e });

                  if (e?.message === 'Request rejected') {
                    return;
                  }
                  if (
                    e?.message.includes('Cannot read properties of undefined')
                  ) {
                    return;
                  }

                  if (smartNavigation.canGoBack) {
                    smartNavigation.goBack();
                  } else {
                    smartNavigation.navigateSmart('Home', {});
                  }
                }
              }}
              disabled={isDisable}
              loading={account.isSendingMsg === 'withdrawRewards'}
            />
          </View>
        </View>
      </View>
    </View>
  );
});

const styling = colors =>
  StyleSheet.create({
    textInfo: {
      ...typography.h6,
      color: colors['text-black-medium']
    },
    containerBtn: {
      borderWidth: 0,
      backgroundColor: colors['transparent'],
      paddingLeft: 0,
      marginLeft: 0,
      marginTop: 0,
      paddingTop: 0
    },
    btn: {
      flexDirection: 'row',
      paddingHorizontal: 0,
      justifyContent: 'flex-start',
      paddingVertical: 0
    }
  });
