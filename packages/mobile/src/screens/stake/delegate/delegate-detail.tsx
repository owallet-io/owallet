import { IntPretty, Dec, CoinPretty } from '@owallet/unit';
import React, { FunctionComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { CText as Text } from '../../../components/text';
import { ValidatorThumbnail } from '../../../components/thumbnail';
import { typography, colors, spacing } from '../../../themes';

interface DelegateDetailProps {}

export const DelegateDetailScreen: FunctionComponent<
  DelegateDetailProps
> = ({}) => {
  return (
    <View>
      <View>
        <Text
          style={{
            ...styles.title,
            marginVertical: spacing['16']
          }}
        >{`Staking details`}</Text>
      </View>

      <View
        style={{
          ...styles.containerInfo
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <ValidatorThumbnail
            style={styles.validatorThumbnail}
            size={38}
            url={''}
          />
          <Text
            style={{
              ...styles.textInfo,
              marginLeft: spacing['12'],
              flexShrink: 1
            }}
          >
            {`uwunode01_moniker`}
          </Text>
        </View>

        <View
          style={{
            marginTop: spacing['20'],
            flexDirection: 'row'
          }}
        >
          <View
            style={{
              flex: 1
            }}
          >
            <Text
              style={{
                ...styles.textInfo,
                marginBottom: spacing['4']
              }}
            >
              Staking
            </Text>
            <Text style={{ ...styles.textBlock }}>{`${115.002} ORAI`}</Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end'
            }}
          >
            <Text style={{ ...styles.textInfo, marginBottom: spacing['4'] }}>
              APY
            </Text>
            <Text style={{ ...styles.textBlock }}>{`${24.5}%`}</Text>
          </View>
        </View>

        <View
          style={{
            marginTop: spacing['20'],
            flexDirection: 'row'
          }}
        >
          <View
            style={{
              flex: 1
            }}
          >
            <Text
              style={{
                ...styles.textInfo,
                marginBottom: spacing['4']
              }}
            >
              Rewards
            </Text>
            <Text style={{ ...styles.textBlock }}>{`122.48 ORAI`}</Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}
          >
            <Text
              style={{
                ...typography.h7,
                color: colors['purple-900']
              }}
            >{`Validator details`}</Text>
          </View>
        </View>
      </View>
      <RectButton style={{ ...styles.containerBtn }} onPress={() => {}}>
        <Text
          style={{
            ...styles.textBtn,
            textAlign: 'center',
            color: colors['white']
          }}
        >{`Stake more`}</Text>
      </RectButton>
      <RectButton
        style={{ ...styles.containerBtn, backgroundColor: colors['purple-50'] }}
        onPress={() => {}}
      >
        <Text
          style={{
            ...styles.textBtn,
            textAlign: 'center',
            color: colors['purple-900']
          }}
        >{`Switch validator`}</Text>
      </RectButton>
      <RectButton
        style={{ ...styles.containerBtn, backgroundColor: colors['gray-10'] }}
        onPress={() => {}}
      >
        <Text
          style={{
            ...styles.textBtn,
            textAlign: 'center',
            color: colors['red-500']
          }}
        >{`Unstake`}</Text>
      </RectButton>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    fontWeight: '700',
    color: colors['gray-900'],
    textAlign: 'center'
  },
  containerInfo: {
    backgroundColor: colors['white'],
    borderRadius: spacing['24'],
    padding: spacing['24']
  },
  textInfo: {
    ...typography.h6,
    fontWeight: '700'
  },
  textBlock: {
    ...typography.h7,
    fontWeight: '400'
  },
  containerBtn: {
    backgroundColor: colors['purple-900'],
    marginLeft: spacing['24'],
    marginRight: spacing['24'],
    borderRadius: spacing['8'],
    marginTop: spacing['20'],
    paddingVertical: spacing['16']
  },
  textBtn: {
    ...typography.h6,
    color: colors['white'],
    fontWeight: '700'
  },
  validatorThumbnail: {
    borderRadius: spacing['6']
  }
});
