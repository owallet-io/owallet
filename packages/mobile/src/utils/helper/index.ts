import { navigate } from '../../router/root'
import isValidDomain from 'is-valid-domain'
const SCHEME_IOS = 'owallet://open_url?url='
const SCHEME_ANDROID = 'app.owallet.oauth://google/open_url?url='

export const handleDeepLink = async ({ url }) => {
  if (url) {
    const path = url.replace(SCHEME_ANDROID, '').replace(SCHEME_IOS, '')
    if (!url.indexOf(SCHEME_ANDROID)) {
      navigate('Browser', { path })
    }

    if (url.indexOf(SCHEME_IOS) === 0) {
      navigate('Browser', { path })
    }
  }
}

export const checkValidDomain = (url: string) => {
  if (isValidDomain(url)) {
    return true
  }
  // try with URL
  try {
    const { origin } = new URL(url)
    return origin.length > 0
  } catch {
    return false
  }
}

export const _keyExtract = (item, index) => index.toString()
