import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStyle } from '../../../styles';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Box } from '../../../components/box';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { XAxis } from '../../../components/axis';
import { Gutter } from '../../../components/gutter';
import { CheckIcon, CosmosIcon, EthereumIcon, LedgerIcon, TerraIcon } from '../../../components/icon';
import { useStore } from '../../../stores';
import { AppHRP, CosmosApp } from '@owallet/ledger-cosmos';
import Transport from '@ledgerhq/hw-transport';
import Eth from '@ledgerhq/hw-app-eth';
import Btc from '@ledgerhq/hw-app-btc';
import Trx from '@ledgerhq/hw-app-trx';
import { PubKeySecp256k1 } from '@owallet/crypto';
import { LedgerUtils } from '@utils/ledger';
import { useLedgerBLE } from '@src/providers/ledger-ble';
import { goBack, navigate, resetTo, RootStackParamList } from '@src/router/root';
import { OWButton } from '@components/button';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { metrics } from '@src/themes';
import OWIcon from '@components/ow-icon/ow-icon';
import OWText from '@components/text/ow-text';
import { useTheme } from '@src/themes/theme-provider';
import { SCREENS } from '@common/constants';

export type Step = 'unknown' | 'connected' | 'app';

export const ConnectLedgerScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const route = useRoute<RouteProp<RootStackParamList, 'Register.ConnectLedger'>>();
  const navigation = useNavigation();
  const { keyRingStore, chainStore } = useStore();

  const { stepPrevious, stepTotal, app: propApp, bip44Path, appendModeInfo, name, password } = route.params;

  console.log('propApp', propApp);

  if (!Object.keys(AppHRP).includes(propApp) && propApp !== 'Ethereum' && propApp !== 'Bitcoin' && propApp !== 'Tron') {
    throw new Error(`Unsupported app: ${propApp}`);
  }

  const ledgerBLE = useLedgerBLE();

  const [step, setStep] = useState<Step>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const needPassword = keyRingStore.keyInfos.length === 0;
  const connectLedger = async () => {
    setIsLoading(true);

    let transport: Transport;

    try {
      transport = await ledgerBLE.getTransport();
    } catch {
      setStep('unknown');
      setIsLoading(false);
      return;
    }

    if (propApp === 'Ethereum') {
      let ethApp = new Eth(transport);

      try {
        await ethApp.getAddress(`m/44'/60'/'0/0/0`);
      } catch (e) {
        // Device is locked or user is in home sceen or other app.
        if (e?.message.includes('(0x6b0c)') || e?.message.includes('(0x6511)') || e?.message.includes('(0x6e00)')) {
          setStep('connected');
        } else {
          console.log(e);
          setStep('unknown');
          await transport.close();

          setIsLoading(false);
          return;
        }
      }

      transport = await LedgerUtils.tryAppOpen(transport, propApp);
      ethApp = new Eth(transport);

      try {
        const res = await ethApp.getAddress(
          `m/44'/60'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
        );

        const pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, 'hex'));

        setStep('app');

        if (appendModeInfo) {
          await keyRingStore.appendLedgerKeyApp(appendModeInfo.vaultId, pubKey.toBytes(true), propApp);
          await chainStore.enableChainInfoInUI(...appendModeInfo.afterEnableChains);
          resetTo(SCREENS.STACK.MainTab);
        } else {
          if (needPassword) {
            navigate(SCREENS.RegisterNewPincode, {
              walletName: name,
              ledger: {
                pubKey: pubKey.toBytes(),
                bip44Path,
                app: propApp
              },
              stepTotal: 3,
              stepPrevious: 1
            });
          } else {
            navigation.reset({
              routes: [
                {
                  name: 'Register.FinalizeKey',
                  params: {
                    name,
                    password,
                    stepPrevious: stepPrevious + 1,
                    stepTotal,
                    ledger: {
                      pubKey: pubKey.toBytes(),
                      bip44Path,
                      app: propApp
                    }
                  }
                }
              ]
            });
          }
        }
      } catch (e) {
        console.log(e);
        setStep('connected');
      }

      await transport.close();

      setIsLoading(false);

      return;
    } else if (propApp === 'Bitcoin') {
      let btcApp = new Btc(transport);
      try {
        await btcApp.getWalletPublicKey("84'/0'/'0/0/0");
        await btcApp.getWalletPublicKey("44'/0'/'0/0/0");
      } catch (e) {
        console.log(e, 'err2');
        // Device is locked or user is in home sceen or other app.
        if (e?.message.includes('(0x6b0c)') || e?.message.includes('(0x6511)') || e?.message.includes('(0x6e00)')) {
          setStep('connected');
        } else {
          console.log(e);
          setStep('unknown');
          await transport.close();

          setIsLoading(false);
          return;
        }
      }

      transport = await LedgerUtils.tryAppOpen(transport, propApp);
      btcApp = new Btc(transport);

      try {
        const res = await btcApp.getWalletPublicKey(
          `84'/0'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
          {
            format: 'bech32',
            verify: false
          }
        );
        const res44 = await btcApp.getWalletPublicKey(
          `44'/0'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`,
          {
            format: 'legacy',
            verify: false
          }
        );
        const pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, 'hex'));
        const pubKey44 = new PubKeySecp256k1(Buffer.from(res44.publicKey, 'hex'));

        setStep('app');

        if (appendModeInfo) {
          await keyRingStore.appendLedgerKeyApp(appendModeInfo.vaultId, pubKey.toBytes(true), `${propApp}84`);
          await keyRingStore.appendLedgerKeyApp(appendModeInfo.vaultId, pubKey44.toBytes(true), `${propApp}44`);
          await chainStore.enableChainInfoInUI(...appendModeInfo.afterEnableChains);
          resetTo(SCREENS.STACK.MainTab);
        } else {
          if (needPassword) {
            navigate(SCREENS.RegisterNewPincode, {
              walletName: name,
              ledger: {
                pubKey: pubKey.toBytes(),
                pubKey44: pubKey44.toBytes(),
                bip44Path,
                app: `${propApp}84`,
                app44: `${propApp}44`
              },
              stepTotal: 3,
              stepPrevious: 1
            });
          } else {
            navigation.reset({
              routes: [
                {
                  name: 'Register.FinalizeKey',
                  params: {
                    name,
                    password,
                    stepPrevious: stepPrevious + 1,
                    stepTotal,
                    ledger: {
                      pubKey: pubKey.toBytes(),
                      pubKey44: pubKey44.toBytes(),
                      bip44Path,
                      app: `${propApp}84`,
                      app44: `${propApp}44`
                    }
                  }
                }
              ]
            });
          }
        }
      } catch (e) {
        console.log(e, 'err btc');
        setStep('connected');
      }

      await transport.close();

      setIsLoading(false);

      return;
    } else if (propApp === 'Tron') {
      let trxApp = new Trx(transport);

      try {
        await trxApp.getAddress(`m/44'/195'/'0/0/0`);
      } catch (e) {
        // Device is locked or user is in home sceen or other app.
        if (e?.message.includes('(0x6b0c)') || e?.message.includes('(0x6511)') || e?.message.includes('(0x6e00)')) {
          setStep('connected');
        } else {
          console.log(e);
          setStep('unknown');
          await transport.close();

          setIsLoading(false);
          return;
        }
      }

      transport = await LedgerUtils.tryAppOpen(transport, propApp);
      trxApp = new Trx(transport);

      try {
        const res = await trxApp.getAddress(
          `m/44'/195'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
        );

        const pubKey = new PubKeySecp256k1(Buffer.from(res.publicKey, 'hex'));

        console.log('pubKey', propApp, pubKey, appendModeInfo);

        setStep('app');

        if (appendModeInfo) {
          await keyRingStore.appendLedgerKeyApp(appendModeInfo.vaultId, pubKey.toBytes(true), propApp);
          await chainStore.enableChainInfoInUI(...appendModeInfo.afterEnableChains);
          resetTo(SCREENS.STACK.MainTab);
        } else {
          if (needPassword) {
            navigate(SCREENS.RegisterNewPincode, {
              walletName: name,
              ledger: {
                pubKey: pubKey.toBytes(),
                bip44Path,
                app: propApp
              },
              stepTotal: 3,
              stepPrevious: 1
            });
          } else {
            navigation.reset({
              routes: [
                {
                  name: 'Register.FinalizeKey',
                  params: {
                    name,
                    password,
                    stepPrevious: stepPrevious + 1,
                    stepTotal,
                    ledger: {
                      pubKey: pubKey.toBytes(),
                      bip44Path,
                      app: propApp
                    }
                  }
                }
              ]
            });
          }
        }
      } catch (e) {
        console.log(e);
        setStep('connected');
      }

      await transport.close();

      setIsLoading(false);

      return;
    }
    let app = new CosmosApp(propApp, transport);

    try {
      const version = await app.getVersion();
      if (version.device_locked) {
        throw new Error('Device is locked');
      }

      setStep('connected');
    } catch (e) {
      console.log(e);
      setStep('unknown');
      await transport.close();

      setIsLoading(false);
      return;
    }

    transport = await LedgerUtils.tryAppOpen(transport, propApp);
    app = new CosmosApp(propApp, transport);

    const res = await app.getPublicKey(bip44Path.account, bip44Path.change, bip44Path.addressIndex);
    if (res.error_message === 'No errors') {
      setStep('app');

      if (appendModeInfo) {
        await keyRingStore.appendLedgerKeyApp(appendModeInfo.vaultId, res.compressed_pk, propApp);
        await chainStore.enableChainInfoInUI(...appendModeInfo.afterEnableChains);
        resetTo(SCREENS.STACK.MainTab);
      } else {
        if (needPassword) {
          navigate(SCREENS.RegisterNewPincode, {
            walletName: name,
            ledger: {
              pubKey: res.compressed_pk,
              bip44Path,
              app: propApp
            },
            stepTotal: 3,
            stepPrevious: 1
          });
        } else {
          navigation.reset({
            routes: [
              {
                name: 'Register.FinalizeKey',
                params: {
                  name,
                  password,
                  stepPrevious: stepPrevious + 1,
                  stepTotal,
                  ledger: {
                    pubKey: res.compressed_pk,
                    bip44Path,
                    app: propApp
                  }
                }
              }
            ]
          });
        }
      }
    } else {
      setStep('connected');
    }

    await transport.close();

    setIsLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        connectLedger();
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{
          paddingHorizontal: 16
        }}
      >
        <TouchableOpacity onPress={goBack} style={styles.goBack}>
          <OWIcon size={16} color={colors['neutral-icon-on-light']} name="arrow-left" />
        </TouchableOpacity>
        <Box
          backgroundColor={colors['neutral-surface-bg']}
          borderRadius={25}
          paddingX={30}
          marginTop={12}
          paddingY={36}
        >
          <StepView
            step={1}
            paragraph={intl.formatMessage({
              id: 'pages.register.connect-ledger.connect-ledger-step-paragraph'
            })}
            icon={
              <Box style={{ opacity: step !== 'unknown' ? 0.5 : 1 }}>
                <LedgerIcon size={60} />
              </Box>
            }
            focused={step === 'unknown'}
            completed={step !== 'unknown'}
          />

          <Gutter size={20} />

          <StepView
            step={2}
            paragraph={intl.formatMessage(
              { id: 'pages.register.connect-ledger.open-app-step-paragraph' },
              { app: propApp }
            )}
            icon={
              <Box style={{ opacity: step !== 'connected' ? 0.5 : 1 }}>
                {(() => {
                  switch (propApp) {
                    case 'Terra':
                      return <TerraIcon size={60} />;
                    case 'Ethereum':
                      return <EthereumIcon size={60} />;
                    default:
                      return <CosmosIcon size={60} />;
                  }
                })()}
              </Box>
            }
            focused={step === 'connected'}
            completed={step === 'app'}
          />
        </Box>
      </ScrollView>

      <View style={styles.aic}>
        <View style={styles.signIn}>
          <OWButton
            style={{
              borderRadius: 32
            }}
            textStyle={{ color: colors['neutral-text-action-on-dark-bg'] }}
            label={intl.formatMessage({ id: 'button.connect' })}
            loading={isLoading}
            onPress={connectLedger}
          />
        </View>
      </View>
    </View>
  );
});

const StepView: FunctionComponent<{
  step: number;
  paragraph: string;
  icon?: React.ReactNode;

  focused: boolean;
  completed: boolean;
}> = ({ step, paragraph, icon, focused, completed }) => {
  const style = useStyle();
  const { colors } = useTheme();
  return (
    <Box
      borderRadius={18}
      backgroundColor={focused ? colors['neutral-surface-pressed'] : 'transparent'}
      paddingX={16}
      paddingY={20}
    >
      <XAxis alignY="center">
        {icon}

        <Gutter size={20} />

        <Box style={{ flex: 1 }}>
          <XAxis alignY="center">
            <OWText style={style.flatten(['h3'])}>
              <FormattedMessage id="pages.register.connect-ledger.step-text" values={{ step }} />
            </OWText>
            {completed ? (
              <React.Fragment>
                <Gutter size={4} />

                <CheckIcon width={24} height={24} color={style.get('color-text-high').color} />
              </React.Fragment>
            ) : null}
          </XAxis>

          <OWText
            style={{
              ...style.flatten(['body2']),
              color: colors['neutral-text-body']
            }}
          >
            {paragraph}
          </OWText>
        </Box>
      </XAxis>
    </Box>
  );
};

const useStyles = () => {
  const { colors } = useTheme();
  return StyleSheet.create({
    mnemonicInput: {
      width: metrics.screenWidth - 40,
      paddingLeft: 20,
      paddingRight: 20,
      paddingVertical: 10,
      backgroundColor: 'transparent'
    },
    borderInput: {
      borderColor: colors['primary-surface-default'],
      borderWidth: 2,
      backgroundColor: 'transparent',
      paddingLeft: 11,
      paddingRight: 11,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 8
    },

    container: {
      paddingTop: metrics.screenHeight / 14,
      justifyContent: 'space-between',
      height: '100%',
      backgroundColor: colors['neutral-surface-card']
    },
    signIn: {
      width: '100%',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors['neutral-border-default'],
      padding: 16
    },
    aic: {
      paddingBottom: 20
    },
    rc: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    title: {
      paddingHorizontal: 16,
      paddingTop: 24
    },
    goBack: {
      backgroundColor: colors['neutral-surface-action3'],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center'
    },
    paste: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      width: '100%'
    },
    pasteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end'
    }
  });
};
