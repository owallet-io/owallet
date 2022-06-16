import { navigate } from '../../router/root';
const SCHEME_IOS = 'owallet://open_url?url=';
const SCHEME_ANDROID = 'app.owallet.oauth://google/open_url?url=';

export const handleDeepLink = async ({ url }) => {
  if (url) {
    const path = url.replace(SCHEME_ANDROID, '').replace(SCHEME_IOS, '');
    if (!url.indexOf(SCHEME_ANDROID)) {
      navigate('Browser', { path });
    }

    if (url.indexOf(SCHEME_IOS) === 0) {
      navigate('Browser', { path });
    }
  }
};

export const isValidDomain = (url: string) => {
  const reg =
    /^(http(s)?:\/\/.)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  if (reg.test(url)) {
    return true;
  }
  // try with URL
  try {
    const { origin } = new URL(url);
    return origin.length > 0;
  } catch {
    return false;
  }
};
