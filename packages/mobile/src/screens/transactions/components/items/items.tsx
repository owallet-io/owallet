import React from 'react';
import { FunctionComponent } from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { RectButton } from '../../../../components/rect-button';
import { useStyle } from '../../../../styles';

export const TransactionItem: FunctionComponent<{
  label?: string;
  paragraph?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  colorStyleAmount?: TextStyle;
  styleReactButton?: TextStyle;
  amount?: string;
  denom?: string;
  topBorder?: boolean;
  onPress?: () => void;
  bottomBorder?: boolean;
}> = ({
  label,
  onPress,
  paragraph,
  colorStyleAmount,
  topBorder,
  amount,
  denom,
  right,
  styleReactButton,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <React.Fragment>
        <View
          style={StyleSheet.flatten([
            style.flatten([
              'flex-row',
              'justify-between',
              'items-center',
              'width-full',
            ]),
          ])}
        >
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten(['h5', 'color-text-black-high']),
              ])}
            >
              {label}
            </Text>
            {paragraph ? (
              <Text
                style={StyleSheet.flatten([
                  style.flatten([
                    'subtitle3',
                    'color-text-black-low',
                    'margin-top-4',
                  ]),
                ])}
              >
                {paragraph}
              </Text>
            ) : null}
          </View>
          <View>
            {right ? (
              right
            ) : (
              <Text
                style={StyleSheet.flatten([
                  style.flatten(['h5']),
                  colorStyleAmount,
                ])}
              >
                {amount} {denom}
              </Text>
            )}
          </View>
        </View>
      </React.Fragment>
    );
  };

  return (
    <View style={style.flatten(['padding-x-20'])}>
      {topBorder ? (
        <View
          style={style.flatten([
            'height-1',
            'margin-x-20',
            'background-color-border-white',
          ])}
        />
      ) : null}
      <RectButton
        style={StyleSheet.flatten([
          style.flatten([
            'height-87',
            'flex-row',
            'items-center',
            'padding-x-20',
            'background-color-white',
          ]),
          styleReactButton
            ? styleReactButton
            : style.flatten(['margin-y-8', 'border-radius-12']),
        ])}
        onPress={onPress}
      >
        {renderChildren()}
      </RectButton>
    </View>
  );
};
