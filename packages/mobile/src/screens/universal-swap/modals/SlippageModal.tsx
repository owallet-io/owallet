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
import { metrics } from '@src/themes';

export const SlippageModal = registerModal(({ close }) => {
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
      <View>
        <View
          style={{
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              paddingVertical: 10
            }}
            size={16}
            weight="500"
          >
            Slippage tolerance
          </Text>
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 10
            }}
            color={colors['blue-300']}
          >
            {`Your transaction will be suspended \nif the price exceeds the slippage percentage.`}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              alignItems: 'center'
            }}
          >
            <View
              style={{
                height: 40,
                borderRadius: 12,
                borderWidth: 0.5,
                borderColor: colors['gray-300'],
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: 10
              }}
            >
              <OWButtonIcon
                colorIcon="#AEAEB2"
                name="minus"
                sizeIcon={20}
                style={{
                  width: 60
                }}
                fullWidth={false}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <BottomSheetTextInput
                  style={{
                    fontSize: 18,
                    width: 30,
                    color: colors['gray-600'],
                    paddingVertical: 0
                  }}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  defaultValue="0"
                  textAlign="right"
                />
                <Text size={18} color={colors['gray-600']}>
                  %
                </Text>
              </View>
              <OWButtonIcon
                style={{
                  width: 60
                }}
                colorIcon="#AEAEB2"
                name="add_ic"
                sizeIcon={20}
                fullWidth={false}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 16,
            width: '100%'
          }}
        >
          {[1, 3, 5].map((item, index) => {
            return (
              <OWButton
                key={item}
                size="medium"
                style={{
                  width: metrics.screenWidth / 4 - 20,
                  backgroundColor: colors['bg-swap-box'],
                  height: 40
                }}
                textStyle={{
                  color: '#7C8397'
                }}
                label={`${item}%`}
                fullWidth={false}
              />
            );
          })}
          <OWButton
            // key={item}
            size="medium"
            style={{
              width: metrics.screenWidth / 4 - 20,
              backgroundColor: colors['bg-swap-box'],
              height: 40,
              borderWidth: 1,
              borderColor: colors['purple-700']
            }}
            textStyle={{
              color: colors['purple-700']
            }}
            label={'7%'}
            fullWidth={false}
          />
        </View>
        <OWButton
          style={{
            marginVertical: 10
          }}
          isBottomSheet
          textStyle={{
            fontWeight: '700',
            fontSize: 16
          }}
          type="tonner"
          label="Confirm"
          size="medium"
          onPress={() => {
            setTimeout(() => {
              close();
            }, 100);
          }}
        />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({});
