import React, { FunctionComponent } from 'react';
import { registerModal } from '../base';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { BottomSheetProps } from '@gorhom/bottom-sheet';
import OWCard from '@src/components/card/ow-card';
import OWText from '@src/components/text/ow-text';
import OWIcon from '@src/components/ow-icon/ow-icon';
import { OWButton } from '@src/components/button';
import { metrics } from '@src/themes';
import { Mixpanel } from 'mixpanel-react-native';
import { AppInit } from '@src/stores/app_init';
const mixpanel = globalThis.mixpanel as Mixpanel;

export const WarningModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  colors: any;
  address: string;
  appInitStore: AppInit;
  bottomSheetModalConfig?: Omit<BottomSheetProps, 'snapPoints' | 'children'>;
}> = registerModal(
  observer(({ close, colors, address, appInitStore }) => {
    return (
      <OWCard
        type="normal"
        style={{
          backgroundColor: colors['neutral-surface-card'],
          alignItems: 'center'
        }}
      >
        <OWIcon
          style={{
            borderRadius: 24,
            width: metrics.screenWidth - 64,
            height: metrics.screenWidth / 2
          }}
          type={'images'}
          source={require('@src/assets/images/img_warning.png')}
        />
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <OWText color={colors['warning-text-body']} size={16} weight="700">
            {`🚨 Important Notice!`}
          </OWText>

          <OWText style={{ marginTop: 12 }} weight="400" color={colors['warning-text-body']}>
            {`We’re thrilled to announce a major update designed to enhance your user experience!\n⚠️ To ensure your wallet and funds remain secure during this transition, we strongly advise you to back up your seed phrase or private key before the update. Remember, you are responsible for your seed phrase, so it's always better to be prepared. \nHowever, to ensure your wallet and funds remain secure during this transition, it’s crucial that you back up your seed phrase / private key before the update.\nThank you for your attention and understanding!`}
          </OWText>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 24
          }}
        >
          <OWButton
            label="Cancel"
            type="secondary"
            onPress={async () => {
              close();
            }}
            style={{
              borderRadius: 999,
              width: '48%'
            }}
            textStyle={{
              fontSize: 14,
              fontWeight: '600'
            }}
          />
          <OWButton
            label="Yes, Confirm"
            onPress={async () => {
              appInitStore.updateLastTimeWarning(true);
              if (mixpanel) {
                const logEvent = {
                  address
                };
                mixpanel.track('Confirm backup event', logEvent);
              }
              close();
            }}
            style={{
              borderRadius: 999,
              width: '48%'
            }}
            textStyle={{
              fontSize: 14,
              fontWeight: '600',
              color: colors['neutral-text-action-on-dark-bg']
            }}
          />
        </View>
      </OWCard>
    );
  }),
  {
    disableSafeArea: true
  }
);
