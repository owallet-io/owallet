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
