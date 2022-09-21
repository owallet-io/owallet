## How to start

```bash
# Install Pod for iOS build
cd ios
pod install
```

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
INJECTED_PROVIDER_URL=http://localhost:3000
ANDROID_DEBUG_APP=
IOS_DEBUG_APP=/Users/phamtu/Library/Developer/Xcode/DerivedData/mobile-cjacivkzlegfewatseeytdfbbuii/Build/Products/Debug-iphoneos/mobile.app
ENV=e2e

yarn test
```