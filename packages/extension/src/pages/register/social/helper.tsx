import ThresholdKey from '@thresholdkey/default';
import ChromeStorageModule from '@thresholdkey/chrome-storage';
import SecurityQuestionsModule from '@thresholdkey/security-questions';
import init, { interpolate, get_pk } from '@thresholdkey/blsdkg';

export const CLIENT_ID =
  '349137538811-8t7s7584app6am5j09a2kglo8dg39eqn.apps.googleusercontent.com';

export const tKey = new ThresholdKey({
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

export const signUpGoogle = async (triggerLogin) => {
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
    const logOutURL = 'https://accounts.google.com/logout';
    const authURL = `https://accounts.google.com/o/oauth2/auth?${authParams.toString()}`;
    chrome.identity.launchWebAuthFlow(
      {
        url: logOutURL,
        interactive: false
      },
      () => {
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
              if (!tKey) return;
              await triggerLogin(hash, queryParams);
            } catch (error) {
              console.log(error);
            }
          }
        );
      }
    );
  } catch (err) {
    console.log(err, 'err=========');
  }
};
