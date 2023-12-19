import { RouteProp, useRoute } from '@react-navigation/native';
import { Text } from '@src/components/text';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { PageWithView } from '../../components/page';
import { Toggle } from '../../components/toggle';
import { useSmartNavigation } from '../../navigation.provider';
import { useStore } from '../../stores';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import OWButton from '@src/components/button/OWButton';
import { useTheme } from '@src/themes/theme-provider';
import { typography } from '../../themes';
import { OWalletLogo, OWalletStar } from './owallet-logo';

export const RegisterDoneScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();
  const { colors } = useTheme();
  const smartNavigation = useSmartNavigation();

  const styles = styling(colors);
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          password?: string;
          type?: string;
        }
      >,
      string
    >
  >();

  const password = route.params?.password;

  const [isBiometricOn, setIsBiometricOn] = useState(false);

  useEffect(() => {
    if (password && keychainStore.isBiometrySupported) {
      setIsBiometricOn(true);
    }
  }, [keychainStore.isBiometrySupported, password]);

  const [isLoading, setIsLoading] = useState(false);
  return (
    <PageWithView
      disableSafeArea
      style={{
        backgroundColor: colors['background-container'],
        justifyContent: 'space-between'
      }}
    >
      <View
        style={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* <WelcomeRocket width={358} height={254} /> */}
        <View>
          <View style={styles.container}>
            <Image
              style={{
                width: 470,
                height: 470
              }}
              source={require('../../assets/image/img-bg.png')}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
          <View style={styles.containerCheck}>
            <Image
              style={{
                width: 400,
                height: 400
              }}
              source={require('../../assets/image/img-all-done.png')}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>
        </View>

        <Text
          size={28}
          weight={'700'}
          style={{
            color: colors['text-title-login'],
            lineHeight: 34
          }}
        >
          ALL DONE!
        </Text>
        <Text
          style={{
            ...typography['subtitle1'],
            color: colors['text-content-success'],
            textAlign: 'center',
            paddingTop: 20,
            paddingLeft: 8,
            paddingRight: 8
          }}
        >
          Congratulations! Your wallet was successfully
          {route?.params?.type === 'recover' ? ' imported' : ' created'}!
        </Text>
      </View>
      <View>
        {password && keychainStore.isBiometrySupported ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 58,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                ...typography['subtitle1'],
                color: colors['text-black-medium']
              }}
            >
              Enable Biometric
            </Text>
            <View
              style={{
                flex: 1
              }}
            />
            <Toggle on={isBiometricOn} onChange={value => setIsBiometricOn(value)} />
          </View>
        ) : null}
        <View style={styles.btnDone}>
          <OWButton
            label="Continue"
            loading={isLoading}
            style={{
              borderRadius: 32
            }}
            onPress={async () => {
              setIsLoading(true);
              try {
                if (password && isBiometricOn) {
                  await keychainStore.turnOnBiometry(password);
                }
                // Definetly, the last key is newest keyring.
                if (keyRingStore.multiKeyStoreInfo.length > 0) {
                  await keyRingStore.changeKeyRing(keyRingStore.multiKeyStoreInfo.length - 1);
                }
                smartNavigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'MainTab'
                    }
                  ]
                });
              } catch (e) {
                console.log(e);
                // alert(JSON.stringify(e));
                setIsLoading(false);
              }
            }}
          />
        </View>
      </View>
    </PageWithView>
  );
});

const styling = colors =>
  StyleSheet.create({
    btnDone: {
      width: '100%',
      alignItems: 'center',
      padding: 16,
      marginBottom: 42
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0
    },
    containerCheck: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
