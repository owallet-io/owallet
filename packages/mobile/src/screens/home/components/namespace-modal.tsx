import React, { ReactElement } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text } from '@src/components/text';
import { RectButton } from '../../../components/rect-button';
import { colors, metrics, spacing, typography } from '../../../themes';
import { NamespaceBuyIcon, NamespaceRelinkIcon, NamespaceUnlinkIcon } from '../../../components/icon';

export const NamespaceModal = (account): ReactElement => {
  return (
    // container
    <View
      style={{
        alignItems: 'center'
      }}
    >
      <View>
        <Text
          style={{
            ...typography.h6,
            color: colors['gray-900'],
            fontWeight: '900'
          }}
        >{`My Namespace`}</Text>
      </View>

      <View style={styles.containerNamespace}>
        <Image
          style={{
            width: spacing['32'],
            height: spacing['32']
          }}
          source={require('../../../assets/image/address_default.png')}
          fadeDuration={0}
        />
        <Text
          style={{
            ...typography.h5,
            lineHeight: spacing['26'],
            fontWeight: '900'
          }}
        >
          {account.name || '...'}
        </Text>
      </View>

      <View
        style={{
          marginTop: spacing['32'],
          width: metrics.screenWidth - 48,
          justifyContent: 'space-between'
        }}
      >
        <RectButton
          style={{
            ...styles.containerBtn,
            backgroundColor: colors['primary-surface-default']
          }}
        >
          <NamespaceBuyIcon color={colors['white']} size={24} />
          <Text
            style={{
              ...typography.h6,
              color: colors['white'],
              fontWeight: '900',
              marginLeft: spacing['12']
            }}
          >{`Buy a new Namespace`}</Text>
        </RectButton>

        <RectButton
          style={{
            ...styles.containerBtn,
            marginTop: spacing['16'],
            marginBottom: spacing['16']
          }}
        >
          <NamespaceRelinkIcon color={colors['primary-surface-default']} size={24} />
          <Text
            style={{
              ...typography.h6,
              color: colors['primary-surface-default'],
              fontWeight: '900',
              marginLeft: spacing['12']
            }}
          >{`Change my Namespace`}</Text>
        </RectButton>

        <RectButton style={styles.containerBtn}>
          <NamespaceUnlinkIcon color={colors['red-900']} size={24} />
          <Text
            style={{
              ...typography.h6,
              color: colors['red-900'],
              fontWeight: '700',
              marginLeft: spacing['12']
            }}
          >{`Remove current Namespace`}</Text>
        </RectButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerToken: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing['4'],
    paddingVertical: spacing['18']
  },
  containerNamespace: {
    backgroundColor: colors['white'],
    shadowColor: 'gray',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 1,
    shadowRadius: 16.0,
    width: metrics.screenWidth - 48,
    borderRadius: spacing['12'],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['12'],
    height: 88,
    paddingVertical: spacing['12']
  },
  containerBtn: {
    backgroundColor: colors['gray-10'],
    paddingVertical: spacing['16'],
    borderRadius: spacing['8'],
    paddingHorizontal: spacing['16'],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
