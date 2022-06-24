import React, { FunctionComponent, useEffect, useState } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import { ScrollView, Text, View } from 'react-native';
import { useStyle } from '../../styles';
import { useStore } from '../../stores';

import { Button } from '../../components/button';

import { observer } from 'mobx-react-lite';
import { useUnmount } from '../../hooks';
import { WCAppLogoAndName } from '../../components/wallet-connect';
import WalletConnect from '@walletconnect/client';
import { navigationRef } from '../../router/root';
import { TextInput } from '../../components/input';

export const SignEthereumModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore, signInteractionStore } = useStore();
    useUnmount(() => {
      signInteractionStore.rejectAll();
      navigationRef.current.goBack();
    });

    // Check that the request is from the wallet connect.
    // If this is undefiend, the request is not from the wallet connect.
    const [wcSession, setWCSession] = useState<
      WalletConnect['session'] | undefined
    >();

    const [fee, setFee] = useState<string>('0x0');
    const [memo, setMemo] = useState<string>('');

    const style = useStyle();

    const [chainId, setChainId] = useState(chainStore.current.chainId);

    // Make the gas config with 1 gas initially to prevent the temporary 0 gas error at the beginning.

    useEffect(() => {
      if (signInteractionStore.waitingEthereumData) {
        const data = signInteractionStore.waitingEthereumData;
      }
    }, [signInteractionStore.waitingEthereumData]);

    return (
      <CardModal title="Confirm Ethereum Transaction">
        {wcSession ? (
          <WCAppLogoAndName
            containerStyle={style.flatten(['margin-y-14'])}
            peerMeta={wcSession.peerMeta}
          />
        ) : null}
        <View style={style.flatten(['margin-bottom-16'])}>
          <Text style={style.flatten(['margin-bottom-3'])}>
            <Text style={style.flatten(['subtitle3', 'color-primary'])}>
              {`0`}
            </Text>
            <Text
              style={style.flatten(['subtitle3', 'color-text-black-medium'])}
            >
              Messages
            </Text>
          </Text>
          <View
            style={style.flatten([
              'border-radius-8',
              'border-width-1',
              'border-color-border-white',
              'overflow-hidden',
            ])}
          >
            {/* <ScrollView
              style={style.flatten(['max-height-214'])}
              persistentScrollbar={true}
            ></ScrollView> */}
          </View>
        </View>
        <TextInput
          label="Memo"
          onChangeText={(txt) => {
            setMemo(txt);
          }}
          defaultValue={''}
        />
        <TextInput
          label="Fee"
          onChangeText={(txt) => {
            setFee(txt);
          }}
          defaultValue={'0x0'}
        />
        <Button
          text="Approve"
          size="large"
          disabled={false}
          loading={signInteractionStore.isLoading}
          onPress={async () => {
            try {
              await signInteractionStore.approveEthereumAndWaitEnd({
                gasPrice: '0x0',
                memo,
              });
            } catch (error) {
              console.log(error);
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true,
  }
);
