import "./shim";

import "text-encoding";

import "react-native-url-polyfill/auto";
import * as Sentry from "@sentry/react-native";
import { NativeModules, Platform } from "react-native";

import { AppRegistry } from "react-native";
// add router to send message
import "./init";
import messaging from "@react-native-firebase/messaging";
import CodePush from "react-native-code-push";
import { name as appName } from "./app.json";
import firebase from "@react-native-firebase/app";

const config = {
  apiKey: process.env.API_KEY,
  projectId: "owallet-829a1",
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID
};

firebase.initializeApp(config);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("remoteMessage background", remoteMessage);
});

const { App } = require("./src/app");

// if (!__DEV__) {
//   Sentry.init({
//     dsn: "https://ab29c6e64d65418cb3b9f133dc601c23@o1323226.ingest.sentry.io/4504632450023424",
//     tracesSampleRate: 0.7,
//     environment: "production",
//     ignoreErrors: [
//       "Request rejected",
//       "Failed to fetch",
//       "Load failed",
//       "User rejected the request",
//       "SIGABRT",
//       "ApplicationNotResponding",
//       "Abort"
//     ]
//   });
// }
// if (__DEV__ && Platform.OS === "ios") {
//   NativeModules.DevSettings.setIsDebuggingRemotely(false);
// }
// not using CodePush for development
const CodePushApp = __DEV__
  ? App
  : CodePush({
      // installMode: CodePush.InstallMode.IMMEDIATE
      checkFrequency: CodePush.CheckFrequency.MANUAL
    })(App);

AppRegistry.registerComponent(appName, () => CodePushApp);
