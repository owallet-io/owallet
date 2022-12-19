import './shim';

import 'text-encoding';

import 'react-native-gesture-handler';

import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
// add router to send message
import './init';
import messaging from '@react-native-firebase/messaging';

import CodePush from 'react-native-code-push';
import { name as appName } from './app.json';

import firebase from '@react-native-firebase/app';

const config = {
  apiKey: process.env.API_KEY,
  projectId: 'owallet-829a1',
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID
};

firebase.initializeApp(config);

const { App } = require('./src/app');

// not using CodePush for development
const CodePushApp = __DEV__
  ? App
  : CodePush({
      installMode: CodePush.InstallMode.IMMEDIATE
      // checkFrequency: CodePush.CheckFrequency.MANUAL
    })(App);

AppRegistry.registerComponent(appName, () => CodePushApp);
