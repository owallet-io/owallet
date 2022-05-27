/**
 * @format
 */

import './shim';

import 'text-encoding';

import 'react-native-gesture-handler';

import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';

import './init';

// The use of "require" is intentional.
// In case of "import" statement, it is located before execution of the next line,
// To prevent this, "require" is used.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const App = require('./src/app').App;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appName = require('./app.json').name;

AppRegistry.registerComponent(appName, () => App);
