import React, { FunctionComponent } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { Platform, StyleSheet, View } from 'react-native';
import { useStore } from '../../stores';
import { typography } from '../../themes';
import { SwapBox } from './components/SwapBox';
import { OWButton } from '@src/components/button';

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const { colors } = useTheme();
  const styles = styling(colors);

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors['plain-background']}
    >
      <View
        style={{
          ...styles.containerScreen
        }}
      >
        
        <View
          style={{
            ...styles.contentBlock
          }}
        >
          <SwapBox token={{}} withSwapIcon={true} />
          <SwapBox token={{}} />
          <OWButton
            label="Swap"
            size="medium"
            style={{
              borderRadius: 8,
              marginTop: 16
            }}
            textStyle={{
              fontWeight:'bold'
            }}
            loading={false}
            onPress={() => {}}
          />
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors: object) =>
  StyleSheet.create({
    shadowBox: {
      shadowColor: colors['splash-background'],
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowRadius: 5,
      shadowOpacity: 1.0
    },
    containerScreen: {
      padding: 24,
      paddingTop: 76,
      borderTopLeftRadius: Platform.OS === 'ios' ? 32 : 0,
      borderTopRightRadius: Platform.OS === 'ios' ? 32 : 0
    },
    contentBlock: {
      padding: 12,
      backgroundColor: colors['content-background'],
      borderRadius: 4
    },

    title: {
      ...typography.h1,
      color: colors['icon'],
      textAlign: 'center',
      fontWeight: '700'
    }
  });
