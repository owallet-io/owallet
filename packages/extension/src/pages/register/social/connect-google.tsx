import React, { FunctionComponent, useEffect, useState } from 'react';

import { EmptyLayout } from '../../../layouts/empty-layout';

import { observer } from 'mobx-react-lite';

import { useParams } from 'react-router-dom';

import style from '../style.module.scss';

import { Button, Form } from 'reactstrap';

import { FormattedMessage, useIntl } from 'react-intl';

import { useStore } from '../../../stores';
import { useNotification } from '../../../components/notification';
import { tKey, CLIENT_ID, signUpGoogle } from './helper';
import { PasswordInput, Input } from '../../../components/form';
import useForm from 'react-hook-form';
import { BN } from 'bn.js';
import { WelcomePage } from '../welcome';

interface FormData {
  password: string;
  recoveryPassword: string;
  name?: string;
}

export const ConnectSocialPage: FunctionComponent = observer(() => {
  const notification = useNotification();
  const { keyRingStore } = useStore();
  const params: { index: string; name?: string } = useParams();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: ''
  });
  const intl = useIntl();

  const { register, handleSubmit, getValues, errors, setValue } =
    useForm<FormData>({
      defaultValues: {
        password: '',
        recoveryPassword: '',
        name: ''
      }
    });

  useEffect(() => {
    document.body.setAttribute('data-centered', 'true');

    return () => {
      document.body.removeAttribute('data-centered');
    };
  }, []);

  useEffect(() => {
    const init = async () => {
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

  const triggerLogin = async (hash, queryParameters) => {
    if (!tKey) return;
    try {
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

      if (checkEmail.polynomialID) {
        notification.push({
          placement: 'top-center',
          type: 'danger',
          duration: 5,
          content: 'Email already exists',
          canDelete: true,
          transition: {
            duration: 0.5
          }
        });
        setIsActive(true);
      } else {
        setIsActive(false);
        setUserInfo(loginResponse.userInfo);
        setValue(
          'name',
          loginResponse?.userInfo?.name + ' - ' + loginResponse?.userInfo?.email
        );
      }
    } catch (error) {
      console.log('🚀 ~ file: Popup.jsx:86 ~ triggerLogin ~ errors:', error);
    }
  };
  return (
    <EmptyLayout
      className={style.container}
      style={{
        justifyContent: 'center'
      }}
    >
      <div className={style.logoContainer}>
        <div>
          <img
            className={style.icon}
            src={require('../../../public/assets/orai_wallet_logo.png')}
            alt="logo"
          />
        </div>
        <div className={style.logoInnerContainer}>
          <img
            className={style.logo}
            src={require('../../../public/assets/logo.svg')}
            alt="logo"
          />
          <div className={style.paragraph}>Cosmos x EVM in one Wallet</div>
        </div>
      </div>
      {status ? (
        <WelcomePage />
      ) : (
        <Form
          className={style.formContainer}
          onSubmit={handleSubmit(async (data: FormData) => {
            try {
              if (!keyRingStore) return;
              if (keyRingStore.keyRingType === 'mnemonic') return;
              const checkpass = await keyRingStore.checkPassword(data.password);
              if (!checkpass) {
                notification.push({
                  placement: 'top-center',
                  type: 'danger',
                  duration: 2,
                  content: 'Failed to password',
                  canDelete: true,
                  transition: {
                    duration: 0.25
                  }
                });
                return;
              }
              const privKey = await keyRingStore.showKeyRing(
                parseInt(params.index),
                data?.password
              );

              await tKey.initialize({ importKey: new BN(privKey, 'hex') });
              await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(
                data.recoveryPassword,
                'whats your password?'
              );
              await keyRingStore.updateNameKeyRing(
                parseInt(params.index),
                params?.name,
                userInfo?.email
              );
              setStatus(true);
            } catch (e) {
              console.log('ERROR ON HANDLE SUBMIT CREATE LEDGER', e);
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
            disabled
            value={params?.name}
            type="text"
            ref={register({
              required: intl.formatMessage({
                id: 'register.name.error.required'
              })
            })}
          />
          {!isActive && userInfo.email && (
            <Input
              label={intl.formatMessage({
                id: 'register.email'
              })}
              styleInputGroup={{
                border: '1px solid rgba(8, 4, 28, 0.12)'
              }}
              name="name"
              disabled
              type="text"
              ref={register({
                required: intl.formatMessage({
                  id: 'register.name.error.required'
                })
              })}
            />
          )}
          <PasswordInput
            label={intl.formatMessage({
              id: 'register.create.input.confirm-password'
            })}
            styleInputGroup={{
              border: '1px solid rgba(8, 4, 28, 0.12)'
            }}
            style={{ position: 'relative' }}
            name="password"
            ref={register({
              required: intl.formatMessage({
                id: 'register.create.input.confirm-password.error.required'
              }),
              validate: (recoveryPassword: string): string | undefined => {
                if (recoveryPassword.length < 8) {
                  return intl.formatMessage({
                    id: 'register.create.input.confirm-password.error.unmatched'
                  });
                }
              }
            })}
            error={errors.password && errors.password.message}
          />
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
          {!isActive && (
            <Button
              color=""
              disabled={!userInfo?.email}
              className={style.nextBtn}
              data-loading={!userInfo?.email}
              type="submit"
            >
              <FormattedMessage id="register.social.google.connect" />
            </Button>
          )}
        </Form>
      )}
      {isActive && (
        <Button
          color=""
          disabled={isLoading}
          className={style.nextBtn}
          data-loading={isLoading}
          onClick={async () => {
            await signUpGoogle(triggerLogin);
          }}
        >
          <FormattedMessage id="register.social.google.title" />
        </Button>
      )}
    </EmptyLayout>
  );
});
