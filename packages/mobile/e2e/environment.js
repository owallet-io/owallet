require('dotenv').config();

const NodeEnvironment = require('jest-environment-node');
const wd = require('wd');
const path = require('path');

const pagarme = require('../src/clients/pagarme');

const APPIUM_PORT = 4723;

const initializeDriver = (driver) => {
  const options = {
    autoLaunch: false,
    platformName: 'iOS',
    platformVersion: '15.4',
    deviceName: 'ThanhTu',
    app: '/path/to/my.app'
    // app: path.resolve('./android/app/build/outputs/apk/debug/app-debug.apk'),
    // appPackage: 'com.chainapsis.owallet',
    // appActivity: '.MainActivity',
    // automationName: 'UiAutomator2'
  };

  return driver.init(options);
};

const sleep = (timeout) =>
  new Promise((resolve) => setTimeout(() => resolve(), timeout));

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);

    this.testPath = context.testPath;
    this.docblockPragmas = context.docblockPragmas;
    this.openAppLink = this.openAppLink.bind(this);
  }

  async openAppLink(url) {
    const { driver } = this.global;

    if (!driver) throw new Error('appium driver not initialized');

    const deepLinkIntent = `-a android.intent.action.VIEW -d ${url}`;

    return driver.startActivity({
      appPackage: 'com.appiumapptypescript',
      appActivity: '.MainActivity',
      optionalIntentArguments: deepLinkIntent
    });
  }

  async setup() {
    await super.setup();

    const driver = await wd.promiseChainRemote({
      host: '127.0.0.1',
      port: APPIUM_PORT
    });

    await initializeDriver(driver);

    const pagarmeClient = pagarme();
    pagarmeClient.authenticate({ api_key: process.env.API_KEY });

    this.global.driver = driver;
    this.global.wd = wd;
    this.global.openAppLink = this.openAppLink;
    this.global.pagarme = pagarmeClient;
    this.global.sleep = sleep;
  }

  async teardown() {
    await super.teardown();

    if (this.global.driver) {
      await this.global.driver.quit();
    }
  }
}

module.exports = CustomEnvironment;
