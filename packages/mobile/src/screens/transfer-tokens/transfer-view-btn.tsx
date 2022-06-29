import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CText as Text} from "../../components/text";
import { NoteIcon, TransactionMinusIcon } from '../../components/icon';
import { RectButton } from '../../components/rect-button';
import { colors, spacing } from '../../themes';

const styles = StyleSheet.create({
  viewBtn: {
    backgroundColor: colors['purple-900'],
    borderRadius: spacing['8'],
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing['16'],
    paddingBottom: spacing['16'],
    marginTop: spacing['16'],
  },
  textBtn: {
    color: colors['white'],
    fontSize: 16,
    fontWeight: '800',
    marginLeft: spacing['10'],
    width: '55%',
  },
});


const TransferViewBtn = () => {
  return (
    <>
      <View>
        <RectButton style={styles.viewBtn}>
          <TransactionMinusIcon />
          <Text style={styles.textBtn}>View all transactions</Text>
        </RectButton>
        <RectButton
          style={{
            ...styles.viewBtn,
            backgroundColor: colors['gray-10'],
          }}
        >
          <NoteIcon color={colors['purple-900']} height={19} />
          <Text
            style={{
              ...styles.textBtn,
              color: colors['purple-900'],
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
