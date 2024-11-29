import './shim';

import * as Sentry from '@sentry/react-native';
import { NativeModules, Platform } from 'react-native';

import { AppRegistry } from 'react-native';
// add router to send message
import './init';
import messaging from '@react-native-firebase/messaging';
import CodePush from 'react-native-code-push';
import { name as appName } from './app.json';
import firebase from '@react-native-firebase/app';
import ByteBrew from 'react-native-bytebrew-sdk';
const { App } = require('./src/app');
const config = {
  apiKey: process.env.API_KEY,
  projectId: 'owallet-829a1',
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID
};
if (!__DEV__) {
  firebase.initializeApp(config);
  // messaging().setBackgroundMessageHandler(async remoteMessage => {
  //   console.log('remoteMessage background', remoteMessage);
  // });

  const onMessageReceivedInBackground = async () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      // Handle the incoming message here
    });
  };

  // Call the function to start listening for incoming messages in the background
  onMessageReceivedInBackground();

  // Listen for incoming messages when the app is in the foreground
  const onMessageReceived = async () => {
    messaging().onMessage(async remoteMessage => {
      console.log('Received a new message:', remoteMessage);
      // Handle the incoming message here
    });
  };

  // Listen for messages when the app is in the background or terminated
  const onNotificationOpened = async () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened by tapping on the notification itself:', remoteMessage);
      // Handle the notification opening here
    });

    // Check if the app was opened by a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Initial notification opened:', remoteMessage);
          // Handle the initial notification opening here
        }
      });
  };

  // Call these functions to start listening for incoming messages
  onMessageReceived();
  onNotificationOpened();

  const { BYTE_BREW_ID_ANDROID, BYTE_BREW_SDK_KEY_ANDROID, BYTE_BREW_ID_IOS, BYTE_BREW_SDK_KEY_IOS } = process.env;
  // Initialize the ByteBrew SDK
  if (Platform.OS == 'android' && BYTE_BREW_ID_ANDROID && BYTE_BREW_SDK_KEY_ANDROID) {
    ByteBrew.Initialize(BYTE_BREW_ID_ANDROID, BYTE_BREW_SDK_KEY_ANDROID);
  } else if (Platform.OS == 'ios' && BYTE_BREW_ID_IOS && BYTE_BREW_SDK_KEY_IOS) {
    ByteBrew.Initialize(BYTE_BREW_ID_IOS, BYTE_BREW_SDK_KEY_IOS);
  }
  Sentry.init({
    dsn: 'https://ab29c6e64d65418cb3b9f133dc601c23@o1323226.ingest.sentry.io/4504632450023424',
    tracesSampleRate: 0.5,
    environment: 'production',
    enableAppHangTracking: false,
    ignoreErrors: [
      'Request rejected',
      'Failed to fetch',
      'Load failed',
      'User rejected the request',
      'SIGABRT',
      'ApplicationNotResponding',
      'Abort',
      'Network request failed',
      /Bad status on response/,
      'Operation was cancelled',
      /App hanging/,
      'TypeError: t.fetchNativePackageName'
    ]
  });
}

if (__DEV__ && Platform.OS === 'ios') {
  NativeModules.DevSettings.setIsDebuggingRemotely(false);
}
// not using CodePush for development
const CodePushApp = __DEV__
  ? App
  : CodePush({
      // installMode: CodePush.InstallMode.IMMEDIATE
      checkFrequency: CodePush.CheckFrequency.MANUAL
    })(App);

AppRegistry.registerComponent(appName, () => CodePushApp);
