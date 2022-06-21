## How to start

```bash
# link provider to specific static server
yarn link:provider ~/Projects/oraiswap-frontend/public/injected-provider.bundle.js

# watch change
yarn watch:provider

# finally start hot-server
yarn start
```

## How to test

```bash
INJECTED_PROVIDER_URL=http://thanhtu.local:3000
ANDROID_DEBUG_APP=
IOS_DEBUG_APP=/Users/phamtu/Library/Developer/Xcode/DerivedData/mobile-cjacivkzlegfewatseeytdfbbuii/Build/Products/Debug-iphoneos/mobile.app
ENV=e2e

yarn test
```