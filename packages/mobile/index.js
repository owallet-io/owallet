import './shim';

import 'text-encoding';

import 'react-native-gesture-handler';

import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
// add router to send message
import './init';

import CodePush from 'react-native-code-push';
import { name as appName } from './app.json';

const { App } = require('./src/app');

// not using CodePush for development
const CodePushApp = __DEV__
  ? App
  : CodePush({
      installMode: CodePush.InstallMode.IMMEDIATE
      // checkFrequency: CodePush.CheckFrequency.MANUAL
    })(App);

AppRegistry.registerComponent(appName, () => CodePushApp);
