import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import React, { FunctionComponent } from 'react';
import { IInputSelectToken } from '../types';
import OWIcon from '@src/components/ow-icon/ow-icon';
import images from '@src/assets/images';
import { Text } from '@src/components/text';
import { BalanceText } from './BalanceText';

const InputSelectToken: FunctionComponent<IInputSelectToken> = () => {
  return (
    <View style={styles.containerInputSelectToken}>
      <TouchableOpacity style={styles.btnChainContainer}>
        <OWIcon type="images" source={images.swap} size={24} />
        <View style={styles.ml8}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                paddingRight: 5
              }}
              weight="700"
              size={14}
            >
              ORAI
            </Text>
            <OWIcon name="down" size={10} />
          </View>
          <BalanceText>Oraichain</BalanceText>
        </View>
      </TouchableOpacity>
      <View style={styles.containerInput}>
        <TextInput
          placeholder="0"
          textAlign="right"
          keyboardType="number-pad"
          style={styles.textInput}
        />
        <BalanceText style={Platform.OS == 'android' ? styles.mtde5 : {}}>
          $0.0001
        </BalanceText>
      </View>
    </View>
  );
};

export default InputSelectToken;

const styles = StyleSheet.create({
  mtde5: {
    marginTop: -5
  },
  textInput: {
    width: '100%',
    fontSize: 16,
    paddingVertical: 0
  },
  containerInput: {
    flex: 1,
    alignItems: 'flex-end'
  },
  ml8: {
    paddingLeft: 8
  },
  btnChainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20
  },
  containerInputSelectToken: {
    backgroundColor: '#F2F2F7',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4
  }
});
