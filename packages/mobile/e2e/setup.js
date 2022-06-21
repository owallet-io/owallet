const appium = require('appium')
const isPortReachable = require('is-port-reachable')

const APPIUM_PORT = 4723

const isAppiumPortBusy = () => isPortReachable(APPIUM_PORT)

const startAppiumServer = async () => {
  const isAppiumRunning = await isAppiumPortBusy()
  if (isAppiumRunning) {
    console.log(`Port ${APPIUM_PORT} busy. Assuming Appium Desktop usage and not starting server...`)
    return
  }

  console.log('\nStarting Appium server...\n')
  return appium.main({ loglevel: 'none' })
}

const jestSetup = async () => {
  global.appium = await startAppiumServer()
}

module.exports = jestSetup
