import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@src/components/text';
import { NoteIcon, TransactionMinusIcon } from '../../components/icon';
import { RectButton } from '../../components/rect-button';
import { colors, spacing } from '../../themes';
import { useSmartNavigation } from '../../navigation.provider';
import { OWButton } from '@src/components/button';
import OWIcon from '@src/components/ow-icon/ow-icon';
const styles = StyleSheet.create({
  btnViewAllTrans: {
    marginTop: 50
  },
  styleBtnAddress: {
    marginTop: 20
  },
  viewBtn: {
    backgroundColor: colors['primary-surface-default'],
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
    marginLeft: spacing['10']
  }
});

const TransferViewBtn = () => {
  const smartNavigation = useSmartNavigation();
  return (
    <>
      <View style={styles.btnViewAllTrans}>
        <OWButton
          onPress={() => {
            smartNavigation.navigateSmart('Transactions', {});
          }}
          label="View all transactions"
          icon={<OWIcon name="transactions" size={20} color={colors['white']} />}
        />
        <OWButton
          style={styles.styleBtnAddress}
          onPress={() => {
            smartNavigation.navigateSmart('AddressBook', {});
          }}
          type="secondary"
          label="Manage address book"
          icon={<OWIcon name="note" size={20} color={colors['primary-surface-default']} />}
        />
      </View>
    </>
  );
};

export default TransferViewBtn;
