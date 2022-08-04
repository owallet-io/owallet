## How to start

```bash
# watch provider change in development mode
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