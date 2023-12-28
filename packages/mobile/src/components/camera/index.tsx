import React, { FunctionComponent } from 'react';
import { RNCamera } from 'react-native-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@src/components/text';
import { CloseIcon } from '../icon';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../spinner';
import { colors, typography } from '../../themes';

export const FullScreenCameraView: FunctionComponent<
  React.ComponentProps<typeof RNCamera> & {
    containerBottom?: React.ReactElement;
    isLoading?: boolean;
  }
> = props => {
  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const { children, containerBottom, isLoading, style: propStyle, ...rest } = props;

  return (
    <React.Fragment>
      {isFocused ? (
        <RNCamera
          style={StyleSheet.flatten([
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            },
            propStyle
          ])}
          {...rest}
        />
      ) : null}
      <SafeAreaView
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center'
        }}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'row'
          }}
        >
          <View
            style={{
              flex: 1
            }}
          />
          {navigation.canGoBack() ? (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <View
                style={{
                  height: 38,
                  width: 38,
                  borderRadius: 64,
                  backgroundColor: colors['gray-50'],
                  opacity: 0.9,
                  marginTop: 8,
                  marginRight: 16,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CloseIcon size={28} color={colors['primary-surface-default']} />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
        <View
          style={{
            flex: 1
          }}
        />
        <View>
          <Svg width="217" height="217" fill="none" viewBox="0 0 217 217">
            <Path
              stroke={colors['primary-surface-default']}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
              d="M34 3H3v31M3 183v31h31M183 3h31v31M214 183v31h-31"
            />
          </Svg>
          {isLoading ? (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <View
                style={{
                  paddingLeft: 32,
                  paddingRight: 48,
                  paddingBottom: 31,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: colors['camera-loading-background']
                }}
              >
                <LoadingSpinner size={42} color={colors['primary-surface-default']} />
                <Text
                  style={{
                    ...typography['subtitle1'],
                    marginTop: 34,
                    color: colors['primary-surface-default']
                  }}
                >
                  Loading...
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        {containerBottom}
        <View
          style={{
            flex: 1
          }}
        />
      </SafeAreaView>
      {children}
    </React.Fragment>
  );
};
