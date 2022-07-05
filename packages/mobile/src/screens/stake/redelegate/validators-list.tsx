import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { CText as Text } from '../../../components/text';
import { colors, spacing, typography } from '../../../themes';
import Validators from './modal-validators';

const styles = StyleSheet.create({
  containerAccount: {
    backgroundColor: colors['gray-10'],
    paddingVertical: spacing['16'],
    borderRadius: spacing['8'],
    paddingHorizontal: spacing['16'],
    flexDirection: 'row',
    marginTop: spacing['16'],
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  }
});

const ValidatorsList = ({ onPressSelectValidator, dstValidatorAddress }) => {
  return (
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
            fontWeight: '800',
            marginBottom: spacing['12']
          }}
        >
          Select validator
        </Text>
      </View>
      <Validators
        onPressSelectValidator={onPressSelectValidator}
        dstValidatorAddress={dstValidatorAddress}
        styles={styles}
      />
    </View>
  );
};

export default ValidatorsList;
