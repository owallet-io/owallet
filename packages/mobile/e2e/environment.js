require('dotenv').config();

const NodeEnvironment = require('jest-environment-node');
const wd = require('wd');
const path = require('path');
const APPIUM_PORT = 4723;

const initializeDriver = (driver) => {
  const options = {
    autoLaunch: false,
    // platformName: 'iOS',
    // platformVersion: '15.4.1',
    // xcodeOrgId: 'ORAICHAIN JOINT STOCK COMPANY',
    // xcodeSigningId: 'iPhone Developer',
    // deviceName: process.env.DEVICE_NAME,
    // bundleId: 'io.orai.owallet',
    // automationName: 'XCUITest',
    // app: process.env.IOS_DEBUG_APP
    noSign: true,
    platformName: 'Android',
    platformVersion: '11',
    deviceName: process.env.DEVICE_NAME,
    app: path.resolve(process.env.ANDROID_DEBUG_APP),
    appPackage: 'com.chainapsis.owallet',
    appActivity: '.MainActivity',
    automationName: 'UiAutomator2'
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

    return driver.startActivity({
      appPackage: 'com.chainapsis.owallet',
      appActivity: '.MainActivity'
    });
  }

  async setup() {
    await super.setup();

    const driver = await wd.promiseChainRemote({
      host: '127.0.0.1',
      port: APPIUM_PORT
    });

    await initializeDriver(driver);
    console.log(await driver.hasElementByAccessibilityId('password'));
    this.global.driver = driver;
    this.global.wd = wd;
    this.global.openAppLink = this.openAppLink;
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
