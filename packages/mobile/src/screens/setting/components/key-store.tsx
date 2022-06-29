import React, { FunctionComponent } from 'react';
import { useStyle } from '../../../styles';
import {
  Image,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { CText as Text} from "../../../components/text";
import { RectButton } from '../../../components/rect-button';
import Svg, { Path } from 'react-native-svg';
import {
  USAIcon,
  EURIcon,
  GBPIcon,
  CADIcon,
  AUDIcon,
  RUBIcon,
  KRWIcon,
  HKDIcon,
  CNYIcon,
  JPYIcon,
  INRIcon,
} from '../../../components/icon';

export const KeyStoreSectionTitle: FunctionComponent<{
  title: string;
}> = ({ title }) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        'padding-x-20',
        'padding-top-16',
        'padding-bottom-12',
        'margin-top-16',
        'flex-row',
        'items-center',
      ])}
    >
      <Image
        style={{
          width: 20,
          height: 20,
          marginRight: 8,
        }}
        // onLoadEnd={onImageLoaded}
        source={require('../../../assets/image/webpage/note-icon.png')}
        fadeDuration={0}
      />
      <Text style={style.flatten(['color-text-black-low', 'subtitle1'])}>
        {title &&
          title.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
            letter.toUpperCase()
          )}
      </Text>
    </View>
  );
};

export const WalletIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fill="none"
      viewBox="0 0 44 45"
      style={{
        height,
        aspectRatio: 44 / 45,
      }}
    >
      <Path
        fill={color}
        fillRule="evenodd"
        d="M26.15 13c-.318 0-.691.065-1.202.2-1.284.339-8.813 2.421-8.925 2.455-1.117.42-1.824.834-2.268 1.32a3.253 3.253 0 011.841-.573H27.55v-1.428c0-.69-.005-1.974-1.4-1.974zm-10.544 4.256c-1.593 0-2.571 1.492-2.571 2.561v9.125a2.411 2.411 0 002.41 2.402h13.18a2.41 2.41 0 002.41-2.402V19.75c0-1.305-1.226-2.494-2.572-2.494H15.607zM28.831 24.3a1.067 1.067 0 10-2.135 0 1.067 1.067 0 002.135 0z"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export const renderFlag = (
  flagName: string = 'usd',
  heightFlag: number = 32
) => {
  switch (flagName.toLowerCase()) {
    case 'usd':
      return <USAIcon height={heightFlag} />;
    case 'eur':
      return <EURIcon height={heightFlag} />;
    case 'gbp':
      return <GBPIcon height={heightFlag} />;
    case 'cad':
      return <CADIcon height={heightFlag} />;
    case 'aud':
      return <AUDIcon height={heightFlag} />;
    case 'rub':
      return <RUBIcon height={heightFlag} />;
    case 'krw':
      return <KRWIcon height={heightFlag} />;
    case 'hkd':
      return <HKDIcon height={heightFlag} />;
    case 'cny':
      return <CNYIcon height={heightFlag} />;
    case 'jpy':
      return <JPYIcon height={heightFlag} />;
    case 'inr':
      return <INRIcon height={heightFlag} />;
    default:
      return <></>;
  }
};

export const KeyStoreItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  paragraphStyle?: TextStyle;
  defaultRightWalletIconStyle?: ViewStyle;

  label: string;
  paragraph?: string;
  left?: React.ReactElement;
  right?: React.ReactElement;

  active?: React.ReactElement;
  notActive?: React.ReactElement;
  onPress?: () => void;

  topBorder?: boolean;
  bottomBorder?: boolean;
}> = ({
  containerStyle,
  labelStyle,
  paragraphStyle,
  defaultRightWalletIconStyle,
  label,
  paragraph,
  left,
  right,
  onPress,
  topBorder,
  bottomBorder = true,
}) => {
  const style = useStyle();

  const renderChildren = () => {
    return (
      <View
        style={style.flatten([
          'width-full',
          'flex-row',
          'justify-between',
          'items-center',
        ])}
      >
        <View style={style.flatten(['flex-row'])}>
          {renderBall(!!right)}
          <View />
          {/* {left ? (
            left
          ) : (
            <View
              style={StyleSheet.flatten([
                style.flatten(['margin-right-16']),
                defaultRightWalletIconStyle,
              ])}
            >
              <WalletIcon
              color={style.get('color-text-black-medium').color}
              height={45}
            />
            </View>
          )} */}
          <View>
            <Text
              style={StyleSheet.flatten([
                style.flatten(['h5', 'color-text-black-high', 'margin-x-10']),
                labelStyle,
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
                  paragraphStyle,
                ])}
              >
                {paragraph}
              </Text>
            ) : null}
          </View>
        </View>
        <View>
          {renderFlag(label)}
          {/* <USAIcon height={30} /> */}
        </View>
      </View>
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
      {onPress ? (
        <RectButton
          style={StyleSheet.flatten([
            style.flatten([
              'height-87',
              'flex-row',
              'items-center',
              'padding-x-20',
              'background-color-white',
              'margin-y-8',
              'border-radius-12'
            ]),
            containerStyle,
          ])}
          onPress={onPress}
        >
          {renderChildren()}
        </RectButton>
      ) : (
        <View
          style={StyleSheet.flatten([
            style.flatten([
              'height-87',
              'flex-row',
              'items-center',
              'padding-x-20',
            ]),
            containerStyle,
          ])}
        >
          {renderChildren()}
        </View>
      )}
      {bottomBorder ? (
        <View
          style={style.flatten([
            'height-1',
            'margin-x-20',
            'background-color-border-white',
          ])}
        />
      ) : null}
    </View>
  );
};
