import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@src/components/text';
import { NoteIcon, TransactionMinusIcon } from '../../components/icon';
import { RectButton } from '../../components/rect-button';
import { colors, spacing } from '../../themes';
import { useSmartNavigation } from '../../navigation.provider';

const styles = StyleSheet.create({
  viewBtn: {
    backgroundColor: colors['purple-700'],
    borderRadius: spacing['8'],
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['16'],
    paddingBottom: spacing['16'],
    marginTop: spacing['16']
  },
  textBtn: {
    color: colors['white'],
    fontSize: 16,
    fontWeight: '800',
    marginLeft: spacing['10'],
  }
});

const TransferViewBtn = () => {
  const smartNavigation = useSmartNavigation();
  return (
    <>
      <View style={{
        marginTop:50
      }}>
        <RectButton
          style={styles.viewBtn}
          onPress={() => {
            smartNavigation.navigateSmart('Transactions', {});
          }}
        >
          <TransactionMinusIcon />
          <Text style={styles.textBtn}>View all transactions</Text>
        </RectButton>
        <RectButton
          style={{
            ...styles.viewBtn,
            backgroundColor: colors['gray-10']
          }}
          onPress={() => {
            smartNavigation.navigateSmart('AddressBook', {});
          }}
        >
          <NoteIcon color={colors['purple-700']} height={19} />
          <Text
            style={{
              ...styles.textBtn,
              color: colors['purple-700']
            }}
          >
            Manage address book
          </Text>
        </RectButton>
      </View>
    </>
  );
};

export default TransferViewBtn;
