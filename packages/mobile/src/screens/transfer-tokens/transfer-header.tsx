import React, { FunctionComponent } from 'react';
import { Text, TouchableOpacity, View , TouchableWithoutFeedback, StyleSheet} from 'react-native';
import { DotsIcon, HistoryIcon, LeftArrowIcon, Scanner } from '../../components/icon';
import { useStore } from '../../stores';
import { colors, spacing, typography } from '../../themes';

const styles = StyleSheet.create({
  transferHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing['24'],
    marginTop: 24,
    marginBottom: 16,
  },
});

const TransferTokensHeader: FunctionComponent = () => {
  const { chainStore } = useStore();

  return (
    <View style={{ ...styles.transferHeader }}>
      <LeftArrowIcon />
      <TouchableWithoutFeedback>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <DotsIcon />
          <Text
            style={{
              ...typography['h5'],
              ...colors['color-text-black-low'],
              marginLeft: spacing['8'],
            }}
          >
            {chainStore.current.chainName + ' ' + 'Network'}
          </Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableOpacity>
        <HistoryIcon size={24} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Scanner size={24} color={colors['gray-700']} />
      </TouchableOpacity>
    </View>
  );
};

export default TransferTokensHeader;
