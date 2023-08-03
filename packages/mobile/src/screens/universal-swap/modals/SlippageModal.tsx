import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import { registerModal } from '@src/modals/base';
import { CardModal } from '@src/modals/card';
import {
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { Text } from '@src/components/text';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { OWButton } from '@src/components/button';
import { useTheme } from '@src/themes/theme-provider';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

export const SlippageModal = registerModal(({close}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <ScrollView
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{
        paddingBottom: safeAreaInsets.bottom,
        paddingHorizontal: 24
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center'
        }}
      >
        <OWButtonIcon
          fullWidth={false}
          style={{
            width: 40,
            height: 40,
            backgroundColor: colors['purple-50'],
            paddingVertical: 10
          }}
          sizeIcon={22}
          colorIcon={colors['blue-300']}
          name="setting-bold"
          onPress={() => {
            // setIsModalSetting(true);
          }}
        />
        <Text
          style={{
            paddingVertical: 10
          }}
          size={16}
          weight="900"
        >
          Maximum slippage
        </Text>
        <Text
          style={{
            textAlign: 'center',
            paddingVertical: 10
          }}
          color={colors['blue-300']}
        >
          Your transaction will revert if the price changes more than the
          slippage percentage.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            alignItems: 'center'
          }}
        >
         <OWButton
            fullWidth={false}
            label="-"
            circle
            textStyle={{
              fontSize: 18,
              color: colors['white']
            }}
            style={{
              backgroundColor: colors['blue-300'],
              width:35,
              height:35
            }}
            type="primary"
            size="small"
          />
          <View
            style={{
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors['blue-300'],
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginHorizontal: 10
            }}
          >
            <OWButton
              style={{
                width: 60
              }}
              type="link"
              label="Auto"
              fullWidth={false}
              size="small"
            />
            <BottomSheetTextInput
              style={{
                fontSize: 18,
                width: 60
              }}
              placeholder="0"
              keyboardType='decimal-pad'
              defaultValue="0"
              textAlign="center"
            />
            <Text
              size={18}
              style={{
                width: 60,
                textAlign: 'center'
              }}
              color={colors['blue-300']}
            >
              %
            </Text>
          </View>
          <OWButton
            fullWidth={false}
            label="+"
            circle
            textStyle={{
              fontSize: 18,
              color: colors['white']
            }}
            style={{
              backgroundColor: colors['blue-300'],
              width:35,
              height:35
            }}
            type="primary"
            size="small"
          />
          
        </View>
        <OWButton
          style={{
            marginVertical: 10
          }}
          type="secondary"
          label="Confirm"
          size="medium"
          onPress={()=>{
            close()
          }}
        />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({});
