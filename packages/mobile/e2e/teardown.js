const stopAppiumServer = () => {
  if (global.appium) {
    console.log('Stopping Appium server...')
    return global.appium.close()
  }
}

const jestTeardown = async () => {
  await stopAppiumServer()
}

module.exports = jestTeardown
