import { StyleSheet, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, View } from 'react-native';
import React from 'react';
import OWIcon from '../ow-icon/ow-icon';
import { useTheme } from '@src/themes/theme-provider';
import { Text } from '../text';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/stores';
import { NetworkModal } from '@src/screens/home/components';
import { HEADER_KEY } from '@src/common/constants';
import { DownArrowIcon } from '../icon';

interface IOWHeaderTitle extends TouchableWithoutFeedbackProps {
  title?: string;
}
const OWHeaderTitle = observer(({ title, ...props }: IOWHeaderTitle) => {
  const { chainStore, modalStore } = useStore();
  const { colors } = useTheme();

  const _onPressNetworkModal = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false
      }
    });
    modalStore.setChildren(<NetworkModal />);
  };
  if (title === HEADER_KEY.showNetworkHeader)
    return (
      <TouchableWithoutFeedback onPress={_onPressNetworkModal} {...props}>
        <View style={styles.containerTitle}>
          <OWIcon name="dot" color={colors['primary-surface-default']} size={10} />
          <Text style={styles.textHeader} color={colors['primary-text']} variant="body1" typo="regular">
            {chainStore.isAll ? 'All networks' : chainStore.current.chainName}
          </Text>
          <DownArrowIcon height={10} color={colors['primary-text']} />
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
    marginHorizontal: 8
  },
  containerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  }
});
