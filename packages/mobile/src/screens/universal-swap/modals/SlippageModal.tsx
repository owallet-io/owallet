import { StyleSheet, View } from 'react-native';
import React from 'react';
import { registerModal } from '@src/modals/base';
import { CardModal } from '@src/modals/card';
import { SafeAreaView } from 'react-native-safe-area-context';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { OWButton } from '@src/components/button';

export const SlippageModal = registerModal(() => {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <View
          style={{
            flexDirection: 'row'
          }}
        >
          <OWIcon color="#F0B90B" name="copy" size={20} />
          <Text
            style={{
              paddingLeft: 8
            }}
            color="#F0B90B"
          >
            Transaction settings
          </Text>
        </View>
        <OWButtonIcon colorIcon="#777E90" name="close" sizeIcon={24} />
      </View>
      <Text size={12} color="#A871DF">
        Slippage tolerance
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around'
        }}
      >
        <OWButton
          label="1%"
          type="secondary"
          style={{
            backgroundColor: '#AE94DE',
            borderColor: '#A871DF'
          }}
        />
        <OWButton
          label="3%"
          type="secondary"
          style={{
            backgroundColor: '#AE94DE',
            borderWidth:0
          }}
        />
        <OWButton
          label="5%"
          type="secondary"
          style={{
            backgroundColor: '#AE94DE',
            borderWidth:0
          }}
        />
        <OWButton
          label="1%"
          type="secondary"
          style={{
            backgroundColor: '#AE94DE',
            borderColor: '#A871DF'
          }}
        />
      </View>
    </View>
  );
});



const styles = StyleSheet.create({});
