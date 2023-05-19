import React, { FunctionComponent, useState, useEffect } from 'react';
import { RegisterConfig } from '@owallet/hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Form } from 'reactstrap';
import useForm from 'react-hook-form';
import style from '../style.module.scss';
import { Input, PasswordInput } from '../../../components/form';
import { BackButton } from '../index';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import { tKey, CLIENT_ID, signUpGoogle } from './helper';

export const TypeImportSocial = 'import-social';

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
  recoveryPassword: string;
}

(window as any).tKey = tKey;

export const ImportSocialIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();
  return (
    <Button
      color=""
      block
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeImportSocial);
        analyticsStore.logEvent('Import account started', {
          registerType: 'ledger'
        });
      }}
      className={style.importWalletBtn}
    >
      <FormattedMessage id="register.social.google.title" />
    </Button>
  );
});

export const ImportSocialPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();
  const { analyticsStore, keyRingStore } = useStore();
  const [userInfo, setUserInfo] = useState({ email: '' });
  const [isRecovery, setIsRecovery] = useState('empty');

  const { register, handleSubmit, getValues, errors, setValue } =
    useForm<FormData>({
      defaultValues: {
        name: '',
        password: '',
        confirmPassword: '',
        recoveryPassword: ''
      }
    });

  useEffect(() => {
    const init = async () => {
      // Initialization of Service Provider
      try {
        await tKey.serviceProvider.init({
          skipSw: true,
          skipPrefetch: true
        });
        await signUpGoogle(triggerLogin);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  // import private key
  const handleCreateSocialAccount = async (
    data,
    privateKey,
    shareDescriptions
  ) => {
    try {
      await registerConfig.createPrivateKey(
        data?.name,
        privateKey,
        data?.password,
        {
          email: data?.email
        }
      );
      analyticsStore.setUserProperties({
        registerType: 'seed',
        accountType: 'privateKey'
      });

      // recovery password
      let isExistSecurityQuestions = false;
      Object.values(shareDescriptions).forEach(
        (descriptions: Array<string>) => {
          descriptions.forEach((el) => {
            const description = JSON.parse(el);
            if (
              description.module ===
              (tKey.modules.securityQuestions as any).moduleName
            ) {
              isExistSecurityQuestions = true;
            }
          });
        }
      );
      if (!isExistSecurityQuestions) {
        await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(
          data.recoveryPassword,
          'whats your password?'
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const initializeNewKey = async (data) => {
    if (!tKey) return;
    try {
      if (isRecovery === 'recovery') {
        await recoverShare(data);
        return;
      }
      if (isRecovery === 'empty') {
        await tKey.initialize(); // 1/2 flow
        await tKey.modules.chromeStorageModule.inputShareFromChromeExtensionStorage();
      }
      // Checks the requiredShares to reconstruct the tKey,
      // starts from 2 by default and each of the above share reduce it by one.
      const { requiredShares, shareDescriptions } = tKey.getKeyDetails();
      if (requiredShares <= 0) {
        const reconstructedKey = await tKey.reconstructKey();
        const privateKey = Buffer.from(
          reconstructedKey?.privKey.toString('hex').trim().replace('0x', ''),
          'hex'
        );
        await handleCreateSocialAccount(data, privateKey, shareDescriptions);
      }
    } catch (error) {
      console.log('🚀 ~ file: Popup.jsx:66 ~ initializeNewKey ~ error:', error);
    }
  };

  const recoverShare = async (data) => {
    if (!tKey) return;
    try {
      if (data?.recoveryPassword.length > 7) {
        await tKey.modules.securityQuestions.inputShareFromSecurityQuestions(
          data?.recoveryPassword
        );
        const { requiredShares, shareDescriptions } = tKey.getKeyDetails();
        if (requiredShares <= 0) {
          const reconstructedKey = await tKey.reconstructKey();
          const privateKey = Buffer.from(
            reconstructedKey?.privKey.toString('hex').trim().replace('0x', ''),
            'hex'
          );

          await handleCreateSocialAccount(data, privateKey, shareDescriptions);
          // share store
          const shareStore = await tKey.generateNewShare();
          await tKey.modules.chromeStorageModule.storeDeviceShare(
            shareStore.newShareStores[shareStore.newShareIndex.toString('hex')]
          );
        }
      }
    } catch (err) {
      console.log({ err });
    }
  };

  const triggerLogin = async (hash, queryParameters) => {
    if (!tKey) return;
    try {
      // Triggering Login using Service Provider ==> opens the popup
      const loginResponse = await tKey.serviceProvider.triggerLogin({
        typeOfLogin: 'google',
        clientId: CLIENT_ID,
        verifier: 'tkey-google',
        hash,
        queryParameters
      });

      const checkEmail = await tKey.getGenericMetadataWithTransitionStates({
        serviceProvider: tKey.serviceProvider,
        fromJSONConstructor: {
          fromJSON(val) {
            return val;
          }
        }
      });

      let recoveryCheck = 'empty';
      if (checkEmail.polynomialID) {
        try {
          // Initialization of tKey
          await tKey.initialize(); // 1/2 flow
          // Gets the deviceShare
          await tKey.modules.chromeStorageModule.inputShareFromChromeExtensionStorage();
          recoveryCheck = 'client';
        } catch (e) {
          recoveryCheck = 'recovery';
        }
      }

      setIsRecovery(recoveryCheck);
      setValue('name', loginResponse?.userInfo?.name);
      setUserInfo(loginResponse.userInfo);
    } catch (error) {
      console.log('🚀 ~ file: Popup.jsx:86 ~ triggerLogin ~ errors:', error);
    }
  };

  return (
    <div>
      <div className={style.title}>
        {intl.formatMessage({
          id: 'register.name'
        })}
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data: FormData) => {
          try {
            await initializeNewKey({
              ...data,
              email: userInfo?.email
            });
          } catch (e) {
            console.log('ERROR ON HANDLE SUBMIT CREATE LEDGER', e);
            alert(e.message ? e.message : e.toString());
            registerConfig.clear();
          }
        })}
      >
        <Input
          label={intl.formatMessage({
            id: 'register.name'
          })}
          styleInputGroup={{
            border: '1px solid rgba(8, 4, 28, 0.12)'
          }}
          type="text"
          name="name"
          ref={register({
            required: intl.formatMessage({
              id: 'register.name.error.required'
            })
          })}
          error={errors.name && errors.name.message}
        />
        {registerConfig.mode === 'create' ? (
          <React.Fragment>
            <PasswordInput
              label={intl.formatMessage({
                id: 'register.create.input.password'
              })}
              styleInputGroup={{
                border: '1px solid rgba(8, 4, 28, 0.12)'
              }}
              name="password"
              ref={register({
                required: intl.formatMessage({
                  id: 'register.create.input.password.error.required'
                }),
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return intl.formatMessage({
                      id: 'register.create.input.password.error.too-short'
                    });
                  }
                }
              })}
              error={errors.password && errors.password.message}
            />
            <PasswordInput
              label={intl.formatMessage({
                id: 'register.create.input.confirm-password'
              })}
              styleInputGroup={{
                border: '1px solid rgba(8, 4, 28, 0.12)'
              }}
              style={{ position: 'relative' }}
              name="confirmPassword"
              ref={register({
                required: intl.formatMessage({
                  id: 'register.create.input.confirm-password.error.required'
                }),
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues()['password']) {
                    return intl.formatMessage({
                      id: 'register.create.input.confirm-password.error.unmatched'
                    });
                  }
                }
              })}
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
          </React.Fragment>
        ) : null}
        {(isRecovery === 'empty' || isRecovery === 'recovery') && (
          <PasswordInput
            label={intl.formatMessage({
              id: 'register.create.input.confirm-password-recovery'
            })}
            styleInputGroup={{
              border: '1px solid rgba(8, 4, 28, 0.12)'
            }}
            style={{ position: 'relative' }}
            name="recoveryPassword"
            ref={register({
              required: intl.formatMessage({
                id: 'register.create.input.confirm-password-recovery.error.required'
              }),
              validate: (recoveryPassword: string): string | undefined => {
                if (recoveryPassword.length < 8) {
                  return intl.formatMessage({
                    id: 'register.create.input.confirm-password-recovery.error.unmatched'
                  });
                }
              }
            })}
            error={errors.recoveryPassword && errors.recoveryPassword.message}
          />
        )}
        <Button
          color=""
          type="submit"
          block
          data-loading={registerConfig.isLoading || !userInfo?.email?.length}
          className={style.nextBtn}
        >
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </Form>
      <BackButton
        onClick={() => {
          registerConfig.clear();
        }}
      />
    </div>
  );
});
