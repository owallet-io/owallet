import React, { FunctionComponent, useCallback, useState } from 'react';
import { RNCamera } from 'react-native-camera';
import { PageWithView } from '../../components/page';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useSmartNavigation } from '../../navigation.provider';
import { Button } from '../../components/button';
import { Share, StyleSheet, View } from 'react-native';
import { ChainSelectorModal } from '../../components/chain-selector';
import { registerModal } from '../../modals/base';
import { CardModal } from '../../modals/card';
import { AddressCopyable } from '../../components/address-copyable';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';

import { Bech32Address } from '@owallet/cosmos';
import { FullScreenCameraView } from '../../components/camera';
import { AddressBookConfigMap, useRegisterConfig } from '@owallet/hooks';
import { AsyncKVStore } from '../../common';
import { useFocusEffect } from '@react-navigation/native';
import { checkValidDomain } from '../../utils/helper';

export const CameraScreen: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();
  const navigation = useNavigation();
  const smartNavigation = useSmartNavigation();

  const [isLoading, setIsLoading] = useState(false);
  // To prevent the reading while changing to other screen after processing the result.
  // Expectedly, screen should be moved to other after processing the result.
  const [isCompleted, setIsCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // If the other screen is pushed according to the qr code data,
      // the `isCompleted` state would remain as true because the screen in the stack is not unmounted.
      // So, we should reset the `isComplete` state whenever getting focused.
      setIsCompleted(false);
    }, [])
  );

  const [isSelectChainModalOpen, setIsSelectChainModalOpen] = useState(false);
  const [isAddressQRCodeModalOpen, setIsAddressQRCodeModalOpen] =
    useState(false);
  const [showingAddressQRCodeChainId, setShowingAddressQRCodeChainId] =
    useState(chainStore.current.chainId);

  const registerConfig = useRegisterConfig(keyRingStore, []);

  const [addressBookConfigMap] = useState(
    () => new AddressBookConfigMap(new AsyncKVStore('address_book'), chainStore)
  );

  return (
    <PageWithView disableSafeArea={true}>
      <FullScreenCameraView
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        captureAudio={false}
        isLoading={isLoading}
        onBarCodeRead={async ({ data }) => {
          if (!isLoading && !isCompleted) {
            setIsLoading(true);
            
            try {
              if (checkValidDomain(data.toLowerCase())) {
                console.log('data', data);
                navigation.navigate('Browser', { url: data.toLowerCase() });

                return;
              }

              const isBech32Address = (() => {
                try {
                  // Check that the data is bech32 address.
                  // If this is not valid bech32 address, it will throw an error.
                  Bech32Address.validate(data);
                } catch {
                  return false;
                }
                return true;
              })();

              if (isBech32Address) {
                const prefix = data.slice(0, data.indexOf('1'));
                const chainInfo = chainStore.chainInfosInUI.find(
                  (chainInfo) =>
                    chainInfo.bech32Config.bech32PrefixAccAddr === prefix
                );
                if (chainInfo) {
                  smartNavigation.pushSmart('Send', {
                    chainId: chainInfo.chainId,
                    recipient: data
                  });
                } else {
                  smartNavigation.navigateSmart('Home', {});
                }
              }

              setIsCompleted(true);
            } catch (e) {
              console.log(e);
            } finally {
              setIsLoading(false);
            }
          }
        }}
     
      />
      <ChainSelectorModal
        isOpen={isSelectChainModalOpen}
        close={() => setIsSelectChainModalOpen(false)}
        chainIds={chainStore.chainInfosInUI.map(
          (chainInfo) => chainInfo.chainId
        )}
        onSelectChain={(chainId) => {
          setShowingAddressQRCodeChainId(chainId);
          setIsAddressQRCodeModalOpen(true);
          setIsSelectChainModalOpen(false);
        }}
      />
      <AddressQRCodeModal
        isOpen={isAddressQRCodeModalOpen}
        close={() => setIsAddressQRCodeModalOpen(false)}
        chainId={showingAddressQRCodeChainId}
      />
    </PageWithView>
  );
});

export const AddressQRCodeModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  chainId: string;
}> = registerModal(
  observer(({ chainId }) => {
    const { accountStore } = useStore();

    const account = accountStore.getAccount(chainId);

    return (
      <CardModal title="Scan QR code">
        <View style={{
          alignItems: 'center'
        }}>
          <AddressCopyable address={account.bech32Address} maxCharacters={22} />
          <View style={{
            marginTop: 32,
            marginBottom: 32,
          }}>
            {account.bech32Address ? (
              <QRCode size={200} value={account.bech32Address} />
            ) : (
              <View
                style={StyleSheet.flatten([
                  {
                    width: 200,
                    height: 200,
                    backgroundColor: '#EEEEF3'
                  },
                ])}
              />
            )}
          </View>
          <View style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Button
              containerStyle={{
                flex: 1
              }}
              text="Share Address"
              mode="light"
              size="large"
              loading={account.bech32Address === ''}
              onPress={() => {
                Share.share({
                  message: account.bech32Address
                }).catch((e) => {
                  console.log(e);
                });
              }}
            />
          </View>
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true
  }
);
