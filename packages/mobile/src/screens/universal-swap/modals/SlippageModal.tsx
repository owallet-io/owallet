import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { registerModal } from '@src/modals/base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@src/components/text';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { OWButton } from '@src/components/button';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { metrics } from '@src/themes';
import { DEFAULT_SLIPPAGE } from '@owallet/common';

export const SlippageModal = registerModal(
  //@ts-ignore
  ({ close, setUserSlippage, currentSlippage = 0 }) => {
    const safeAreaInsets = useSafeAreaInsets();
    const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
    const { colors } = useTheme();
    const styles = styling(colors);

    const handleChangeSlippage = direction => {
      if (direction === 'minus') {
        if (slippage > 1) {
          setSlippage(slippage - 1);
        } else {
          setSlippage(1);
        }
      } else {
        if (slippage < 100) {
          setSlippage(slippage + 1);
        } else {
          setSlippage(100);
        }
      }
    };

    const handleSubmitSlippage = () => {
      setUserSlippage(slippage);
    };

    return (
      <ScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={[styles.container, { paddingBottom: safeAreaInsets.bottom }]}
      >
        <View>
          <View style={styles.containerTitle}>
            <Text style={styles.title} size={16} weight="500">
              Slippage tolerance
            </Text>
            <Text style={styles.des} color={colors['blue-300']}>
              {`Your transaction will be suspended \nif the price exceeds the slippage percentage.`}
            </Text>
            <View style={styles.containerInputSlippage}>
              <View style={styles.subContainerInputSlippage}>
                <OWButtonIcon
                  colorIcon="#AEAEB2"
                  name="minus"
                  sizeIcon={20}
                  style={styles.minusBtn}
                  fullWidth={false}
                  onPress={() => handleChangeSlippage('minus')}
                />
                <View style={styles.inputWrap}>
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    defaultValue={currentSlippage?.toString() ?? '0'}
                    value={slippage.toString()}
                    textAlign="right"
                    placeholderTextColor={colors['neutral-text-action-on-dark-bg']}
                    onSubmitEditing={txt => {
                      if (Number(txt) > 0 && Number(txt) < 100) {
                        setSlippage(Number(txt));
                      }
                    }}
                  />
                  <Text size={18} color={colors['text-value-input-modal']}>
                    %
                  </Text>
                </View>
                <OWButtonIcon
                  style={styles.addBtn}
                  colorIcon="#AEAEB2"
                  name="add_ic"
                  sizeIcon={20}
                  fullWidth={false}
                  onPress={() => handleChangeSlippage('plus')}
                />
              </View>
            </View>
          </View>

          <View style={styles.containerSlippagePercent}>
            {[1, 3, 5, 7].map((item, index) => {
              return (
                <OWButton
                  key={item}
                  size="medium"
                  style={
                    slippage === Number(item) ? styles.btnSlippgaePercentActive : styles.btnSlippgaePercentInActive
                  }
                  textStyle={
                    slippage === Number(item) ? styles.txtSlippgaePercentActive : styles.txtSlippgaePercentInActive
                  }
                  label={`${item}%`}
                  fullWidth={false}
                  onPress={() => setSlippage(item)}
                />
              );
            })}
          </View>
          <OWButton
            style={styles.confirmBtn}
            isBottomSheet
            textStyle={styles.txtBtn}
            type="tonner"
            label="Confirm"
            size="medium"
            onPress={() => {
              handleSubmitSlippage();
              close();
            }}
          />
        </View>
      </ScrollView>
    );
  }
);

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    txtBtn: {
      fontWeight: '700',
      fontSize: 16
    },
    confirmBtn: {
      marginVertical: 10
    },
    txtSlippgaePercentInActive: {
      color: '#7C8397'
    },
    btnSlippgaePercentInActive: {
      width: metrics.screenWidth / 4 - 20,
      backgroundColor: colors['background-item-list'],
      height: 40
    },
    txtSlippgaePercentActive: {
      color: colors['primary-text-action']
    },
    btnSlippgaePercentActive: {
      width: metrics.screenWidth / 4 - 20,
      backgroundColor: colors['background-item-list'],
      height: 40,
      borderWidth: 1,
      borderColor: colors['primary-text-action']
    },
    containerSlippagePercent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 16,
      width: '100%'
    },
    addBtn: {
      width: 60
    },
    input: {
      fontSize: 18,
      width: 30,
      color: colors['text-value-input-modal'],
      paddingVertical: 0
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    minusBtn: {
      width: 60
    },
    subContainerInputSlippage: {
      height: 40,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors['border-input-slippage'],
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 10
    },
    containerInputSlippage: {
      flexDirection: 'row',
      paddingVertical: 10,
      alignItems: 'center'
    },
    des: {
      textAlign: 'center',
      paddingVertical: 10
    },
    title: {
      paddingVertical: 10
    },
    containerTitle: {
      alignItems: 'center'
    },
    container: {
      paddingHorizontal: 24
    }
  });
