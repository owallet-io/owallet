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
import { useTheme } from '@src/themes/theme-provider';

const InputSelectToken: FunctionComponent<IInputSelectToken> = () => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.containerInputSelectToken,
        {
          backgroundColor: colors['box-nft']
        }
      ]}
    >
      <TouchableOpacity style={styles.btnChainContainer}>
        <OWIcon type="images" source={images.swap} size={24} />
        <View style={styles.ml8}>
          <View style={styles.itemTopBtn}>
            <Text style={styles.labelSymbol} weight="700" size={14}>
              ORAI
            </Text>
            <OWIcon color={colors['text-title']} name="down" size={10} />
          </View>
          <BalanceText>Oraichain</BalanceText>
        </View>
      </TouchableOpacity>
      <View style={styles.containerInput}>
        <TextInput
          placeholder="0"
          textAlign="right"
          keyboardType="number-pad"
          style={[styles.textInput,{
            color:colors['text-title']
          }]}
          placeholderTextColor={colors['text-place-holder']}
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
  labelSymbol: {
    paddingRight: 5
  },
  itemTopBtn: {
    flexDirection: 'row',
    alignItems: 'center'
  },
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4
  }
});
