import React, { FunctionComponent } from 'react';
import { RegisterConfig } from '@owallet/hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Form } from 'reactstrap';
import useForm from 'react-hook-form';
import style from '../style.module.scss';
import { Input, PasswordInput } from '../../../components/form';
import { AdvancedBIP44Option, useBIP44Option } from '../advanced-bip44';
import { BackButton } from '../index';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';
import ThresholdKey from '@thresholdkey/default';
import ChromeStorageModule from '@thresholdkey/chrome-storage';
import SecurityQuestionsModule from '@thresholdkey/security-questions';
import init, { interpolate, get_pk } from '@thresholdkey/blsdkg';

export const TypeImportSocial = 'import-social';

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

const tKey = new ThresholdKey({
  modules: {
    chromeStorageModule: new ChromeStorageModule(),
    securityQuestions: new SecurityQuestionsModule()
  },
  manualSync: false,
  customAuthArgs: {
    baseUrl: `${window.location.origin}`,
    //@ts-ignore
    network: 'testnet',
    blsdkg: { init, get_pk, interpolate }
  }
}) as any;

const CLIENT_ID =
  '349137538811-8t7s7584app6am5j09a2kglo8dg39eqn.apps.googleusercontent.com';

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
  const { chainStore, analyticsStore } = useStore();
  const bip44Option = useBIP44Option();
  const [user, setUser] = React.useState();
  const [privateKey, setPrivateKey] = React.useState('');

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: ''
    }
  });

  React.useEffect(() => {
    const init = async () => {
      // Initialization of Service Provider
      try {
        await tKey.serviceProvider.init({
          skipSw: true,
          skipPrefetch: true
        });
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, [privateKey]);

  const initializeNewKey = async (hash, queryParams, data) => {
    if (!tKey) {
      return;
    }
    try {
      await triggerLogin(hash, queryParams, data); // Calls the triggerLogin() function above
      // // Initialization of tKey
      await tKey.initialize(); // 1/2 flow
      // // Gets the deviceShare
      try {
        await tKey.modules.chromeStorageModule.inputShareFromChromeExtensionStorage(); // 2/2 flow
      } catch (e) {
        await recoverShare();
      }

      // // Checks the requiredShares to reconstruct the tKey,
      // // starts from 2 by default and each of the above share reduce it by one.
      const { requiredShares } = tKey.getKeyDetails();
      if (requiredShares <= 0) {
        const reconstructedKey = await tKey.reconstructKey();
        setPrivateKey(reconstructedKey?.privKey.toString('hex'));
      }
    } catch (error) {
      console.log('🚀 ~ file: Popup.jsx:66 ~ initializeNewKey ~ error:', error);
    }
  };

  const recoverShare = async () => {
    if (!tKey) {
      return;
    }
    // swal is just a pretty dialog box
    // swal('Enter password (>10 characters)', {
    //   content: 'input',
    // }).then(async (value) => {
    //   if (value.length > 10) {
    //     try {
    //       await tKey.modules.securityQuestions.inputShareFromSecurityQuestions(
    //         value
    //       ); // 2/2 flow
    //       const { requiredShares } = tKey.getKeyDetails();
    //       if (requiredShares <= 0) {
    //         const reconstructedKey = await tKey.reconstructKey();
    //         setPrivateKey(reconstructedKey?.privKey.toString('hex'));
    //       }
    //       const shareStore = await tKey.generateNewShare();
    //       await tKey.modules.chromeStorageModule.storeDeviceShare(
    //         shareStore.newShareStores[shareStore.newShareIndex.toString('hex')]
    //       );
    //       swal(
    //         'Success',
    //         'Successfully logged you in with the recovery password.',
    //         'success'
    //       );
    //     } catch (error) {
    //       swal('Error', error?.message.toString(), 'error');
    //     }
    //   } else {
    //     swal('Error', 'Password must be >= 11 characters', 'error');
    //   }
    // });
  };

  const triggerLogin = async (hash, queryParameters, data) => {
    if (!tKey) {
      return;
    }
    try {
      // Triggering Login using Service Provider ==> opens the popup
      const loginResponse = await tKey.serviceProvider.triggerLogin({
        typeOfLogin: 'google',
        clientId: CLIENT_ID,
        verifier: 'tkey-google',
        hash,
        queryParameters
      });

      if (loginResponse) {
        const privateKey = Buffer.from(
          loginResponse.privateKey.trim().replace('0x', ''),
          'hex'
        );
        await registerConfig.createPrivateKey(
          // loginResponse?.userInfo?.email,
          data.name,
          privateKey,
          data.password,
          loginResponse?.userInfo?.email
        );
        analyticsStore.setUserProperties({
          registerType: 'seed',
          accountType: 'privateKey'
        });
      }
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
            const nonce = Math.floor(Math.random() * 10000).toString();
            const state = encodeURIComponent(
              Buffer.from(
                JSON.stringify({
                  instanceId: nonce,
                  redirectToOpener: false
                })
              ).toString('base64')
            );
            const redirectURL = chrome.identity.getRedirectURL('popup.html');
            const authParams = new URLSearchParams({
              client_id: CLIENT_ID,
              response_type: 'id_token token',
              redirect_uri: redirectURL,
              scope: 'profile email openid',
              state,
              nonce
            });
            console.log('redirectURL: ', redirectURL);
            console.log('authParams: ', authParams);

            const authURL = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`;
            console.log('authParams: ', authURL);
            chrome.identity.launchWebAuthFlow(
              {
                url: authURL,
                interactive: true
              },
              async (res) => {
                if (!res) return;
                try {
                  const url = new URL(res);
                  const hash = url.hash.substr(1);
                  console.log('🚀 ~ file: Newtab.jsx:195 ~ hash:', hash);
                  let queryParams = {};
                  for (let key of url.searchParams.keys()) {
                    queryParams[key] = url.searchParams.get(key);
                  }
                  console.log('🚀 res:', res);
                  console.log('🚀 url:', url);

                  console.log('🚀 queryParams:', queryParams);
                  console.log('🚀 hash:', hash);
                  await initializeNewKey(hash, queryParams, data);
                } catch (error) {
                  console.log(error);
                }
              }
            );
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
        <Button
          color=""
          type="submit"
          block
          data-loading={registerConfig.isLoading}
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

      <Button
        onClick={() => {
          chrome.identity.launchWebAuthFlow(
            {
              url: 'https://accounts.google.com/logout',
              interactive: true
            },
            (res) => {}
          );
          return;
        }}
      >
        Logout
      </Button>
    </div>
  );
});
