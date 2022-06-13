const SCHEME = 'owallet://';

export const handleDeepLink = ({ url }) => {
  if (url && url.indexOf(SCHEME) === 0) {
    const path = url.replace(SCHEME, '');
    console.log('path', path, url);
  }
};
