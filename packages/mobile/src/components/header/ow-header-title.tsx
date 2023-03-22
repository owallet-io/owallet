import {
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  View
} from 'react-native';
import React, { useCallback } from 'react';
import { Header } from '@react-navigation/stack';
import OWIcon from '../ow-icon/ow-icon';
import { useTheme } from '@src/themes/theme-provider';
import { Text } from '../text';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/stores';
import { Hash } from '@owallet/crypto';
import { NetworkModal } from '@src/screens/home/components';
import { useSmartNavigation } from '@src/navigation.provider';
import { HEADER_KEY } from '@src/common/constants';
interface IOWHeaderTitle extends TouchableWithoutFeedbackProps {
  title?: string;
}
const OWHeaderTitle = observer(({ title, ...props }: IOWHeaderTitle) => {
  const { chainStore, modalStore } = useStore();
  const { colors } = useTheme();
  const smartNavigation = useSmartNavigation();
  const deterministicNumber = useCallback((chainInfo) => {
    const bytes = Hash.sha256(
      Buffer.from(chainInfo.stakeCurrency.coinMinimalDenom)
    );
    return (
      (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
    );
  }, []);

  const profileColor = useCallback(
    (chainInfo) => {
      const random = [colors['purple-400']];

      return random[deterministicNumber(chainInfo) % random.length];
    },
    [deterministicNumber]
  );
  // const navigation = useNavigation();
  const _onPressNetworkModal = () => {
    modalStore.setOpen();
    modalStore.setChildren(
      NetworkModal({
        profileColor,
        chainStore,
        modalStore,
        smartNavigation,
        colors
      })
    );
  };
  if (title === HEADER_KEY.showNetworkHeader)
    return (
      <TouchableWithoutFeedback onPress={_onPressNetworkModal} {...props}>
        <View style={styles.containerTitle}>
          <OWIcon name="dot" color={colors['purple-700']} size={10} />
          <Text
            style={styles.textHeader}
            color={colors['primary-text']}
            variant="body1"
            typo="regular"
          >
            {chainStore.current.chainName}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );

  return (
    <View style={styles.containerTitle}>
      <Text variant="h3" typo="bold" color={colors['primary-text']}>
        {title}
      </Text>
    </View>
  );
});
export default OWHeaderTitle;

const styles = StyleSheet.create({
  textHeader: {
    marginLeft: 8
  },
  containerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  }
});
