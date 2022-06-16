import { navigate } from '../../router/root';

const SCHEME = 'owallet://';
const SCHEME_ANDROID = 'app.owallet.oauth://google/';
export const handleDeepLink = ({ url }) => {  
  console.log({ url });
  
  if (url && !url.indexOf(SCHEME_ANDROID)) {    
    const path_android = url.replace(SCHEME_ANDROID, '');
    navigate('Browser');
  }

  if (url && url.indexOf(SCHEME) === 0) {
    const path = url.replace(SCHEME, '');
    console.log('path', path, url);
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
