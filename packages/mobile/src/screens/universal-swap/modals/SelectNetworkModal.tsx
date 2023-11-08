import { StyleSheet, View } from 'react-native';
import React from 'react';
import { registerModal } from '@src/modals/base';
import { Text } from '@src/components/text';
import OWFlatList from '@src/components/page/ow-flat-list';
import images from '@src/assets/images';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { TypeTheme, useTheme } from '@src/themes/theme-provider';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { metrics } from '@src/themes';
import { chainIcons } from '../helpers';

//@ts-ignore
export const SelectNetworkModal = registerModal(({ close, selectChainFilter, setChainFilter }) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.title} weight="500" size={16}>
        Select Network
      </Text>
      <OWFlatList
        data={chainIcons}
        isBottomSheet
        renderItem={({ item }) => {
          if (item) {
            return (
              <TouchableOpacity
                onPress={() => {
                  setChainFilter(item.chainId);
                  close();
                }}
                style={styles.btn}
              >
                <View style={styles.logo}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      backgroundColor: colors['gray-10']
                    }}
                  >
                    <OWIcon type="images" source={{ uri: item.Icon }} size={35} />
                  </View>
                  <Text style={styles.pl24} size={16} weight="500" color={colors['gray-500']}>
                    {item.chainName}
                  </Text>
                </View>
                {selectChainFilter === item.chainId && (
                  <OWIcon name="check_stroke" color={colors['green-500']} size={18} />
                )}
              </TouchableOpacity>
            );
          }
        }}
      />
    </View>
  );
});

const styling = (colors: TypeTheme['colors']) =>
  StyleSheet.create({
    pl24: {
      paddingLeft: 24
    },
    logo: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 35,
      paddingVertical: 15,
      borderTopWidth: 0.5,
      borderColor: colors['border-network-modal']
    },
    title: {
      textAlign: 'center',
      paddingBottom: 20,
      paddingTop: 10,
      color: colors['text-title']
    },
    container: {
      height: metrics.screenHeight / 2
    }
  });
