import React, { FunctionComponent, useEffect, useState } from 'react';
import { PageWithView } from '../../components/page';
import { TouchableOpacity, View } from 'react-native';
import { CText as Text } from '../../components/text';
import { useSmartNavigation } from '../../navigation.provider';
import { RouteProp, useRoute } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Toggle } from '../../components/toggle';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WelcomeRocket from '../../assets/svg/welcome-rocket.svg';
import { OWalletLogo, OWalletStar } from './owallet-logo';
import { colors, typography } from '../../themes';
import { LoadingSpinner } from '../../components/spinner';

export const RegisterEndScreen: FunctionComponent = observer(() => {
  const { keychainStore, keyRingStore } = useStore();

  const smartNavigation = useSmartNavigation();

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
      style={{
        paddingLeft: 50,
        paddingTop: 140,
        paddingRight: 50,
        backgroundColor: colors['white']
      }}
    >
      <View />
      <View
        style={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* <WelcomeRocket width={358} height={254} /> */}
        <View>
          <OWalletLogo size={120} />
        </View>
        <View style={{ paddingTop: 20 }}>
          <OWalletStar />
        </View>
        <Text
          style={{
            ...typography['h2'],
            color: colors['text-black-medium'],
            marginTop: 18,
            fontWeight: '700'
          }}
        >
          Congratulation!
        </Text>
        <Text
          style={{
            ...typography['subtitle1'],
            color: colors['text-black-low'],
            textAlign: 'center',
            paddingTop: 20,
            paddingLeft: 8,
            paddingRight: 8
          }}
        >
          Your new wallet has been successfully
          {route?.params?.type === 'recover' ? ' imported' : ' created'}!
        </Text>
      </View>
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
          <Toggle
            on={isBiometricOn}
            onChange={value => setIsBiometricOn(value)}
          />
        </View>
      ) : null}
      <TouchableOpacity
        disabled={isLoading}
        onPress={async () => {
          setIsLoading(true);
          try {
            if (password && isBiometricOn) {
              console.log('password', password);
              console.log('isBiometricOn', isBiometricOn);

              await keychainStore.turnOnBiometry(password);
            }

            // Definetly, the last key is newest keyring.
            if (keyRingStore.multiKeyStoreInfo.length > 0) {
              await keyRingStore.changeKeyRing(
                keyRingStore.multiKeyStoreInfo.length - 1
              );
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
            alert(JSON.stringify(e));
            setIsLoading(false);
          }
        }}
        style={{
          marginBottom: 24,
          marginTop: 44,
          backgroundColor: colors['purple-900'],
          borderRadius: 8
        }}
      >
        {isLoading ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <LoadingSpinner color={colors['white']} size={20} />
          </View>
        ) : (
          <Text
            style={{
              color: colors['white'],
              textAlign: 'center',
              fontWeight: '700',
              fontSize: 16,
              lineHeight: 22,
              padding: 16
            }}
          >
            Done
          </Text>
        )}
      </TouchableOpacity>
      <View
        style={{
          flex: 1
        }}
      />
    </PageWithView>
  );
});
