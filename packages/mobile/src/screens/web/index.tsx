import React, { FunctionComponent, useRef, useState } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useStyle } from '../../styles';
import { useSmartNavigation } from '../../navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RectButton } from '../../components/rect-button';
import Svg, { Path, G, Defs, ClipPath } from 'react-native-svg';
import { DAppInfos } from './config';

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    if (Platform.OS === "ios") {
      RNFS.readFile(
        `${RNFS.MainBundlePath}/injected-provider.bundle.js`
      ).then((r) => setCode(r));
    } else {
      RNFS.readFileAssets("injected-provider.bundle.js").then((r) =>
        setCode(r)
      );
    }
  }, []);

  return (
    <PageWithScrollViewInBottomTabView
      contentContainerStyle={style.get('flex-grow-1')}
      style={StyleSheet.flatten([
        style.flatten(['padding-x-20']),
        {
          marginTop: safeAreaInsets.top
        }
      ])}
    >
      <Text
        style={style.flatten([
          'h3',
          'color-text-black-high',
          'margin-top-44',
          'margin-bottom-20'
        ])}
      >
        Discover DeFi
      </Text>
      {DAppInfos.map(({ name, thumbnail, uri }) => (
        <WebpageImageButton
          key={uri}
          name={name}
          source={thumbnail}
          onPress={() => {
            smartNavigation.pushSmart('Web.dApp', { name, uri });
          }}
        />
      ))}
    </PageWithScrollViewInBottomTabView>
  );
};

export const WebScreen: FunctionComponent = () => {
  const style = useStyle();

  // TODO: Set the version properly.
  // IMPORTANT: Current message requester is for the internal usages.
  //            Don't use it in the production!!
  const [keplr] = useState(
    () => new Keplr("0.0.1", new RNMessageRequesterInternal())
  );
  const [messageHandler] = useState(() =>
    RNInjectedKeplr.onMessageHandler(keplr)
  );

  const sourceCode = useInjectedSourceCode();

  const webviewRef = useRef<WebView | null>(null);

  const imageRef = useRef<Image | null>(null);
  const onImageLoaded = () => {
    if (imageRef.current) {
      imageRef.current.measure((_x, _y, measureWidth, measureHeight) => {
        setImageSize({
          width: (measureWidth / measureHeight) * height,
          height
        });
      });
    }
  };

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          'flex-row',
          'items-center',
          'overflow-hidden',
          'border-radius-8',
          'background-color-big-image-placeholder',
          'margin-bottom-16'
        ]),
        {
          height
        }
      ])}
    >
      {source ? (
        <View style={style.flatten(['absolute-fill', 'items-end'])}>
          <Image
            ref={imageRef}
            style={
              imageSize
                ? {
                    width: imageSize.width,
                    height: imageSize.height
                  }
                : {
                    opacity: 0
                  }
            }
            onLoadEnd={onImageLoaded}
            source={source}
            fadeDuration={0}
          />
          {imageSize ? (
            <View
              style={style.flatten([
                'absolute-fill',
                'background-color-black',
                'opacity-40'
              ])}
            />
          ) : null}
        </View>
      ) : null}
      <View style={style.flatten(['absolute-fill'])}>
        <RectButton
          style={StyleSheet.flatten([
            style.flatten(['flex-row', 'items-center', 'padding-x-38']),
            { height }
          ])}
          activeOpacity={0.2}
          underlayColor={style.get('color-white').color}
          enabled={onPress != null}
          onPress={onPress}
        >
          {overrideInner ? (
            overrideInner
          ) : (
            <React.Fragment>
              <Text style={style.flatten(['h2', 'color-white'])}>{name}</Text>
              <View style={style.get('flex-1')} />
              <GoIcon
                width={34.7}
                height={21}
                color={style.get('color-white').color}
              />
            </React.Fragment>
          )}
        </RectButton>
      </View>
    </View>
  );
};

const GoIcon: FunctionComponent<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 38, height = 23, color = 'white' }) => {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 38 23">
      <G clipPath="url(#clip0_4026_25847)">
        <Path
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          d="M25.91 2.125l9.362 9.375-9.363 9.375m8.063-9.375H2.5"
        />
      ) : null}
    </PageWithView>
  );
};
