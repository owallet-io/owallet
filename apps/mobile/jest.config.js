
/** @type {import('@jest/types').Config.ProjectConfig} */
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    './node_modules/react-native-gesture-handler/jestSetup.js',
    '<rootDir>/test/jest.setup.ts'
  ],
  
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(react-clone-referenced-element|@react-native-community|react-navigation|@react-navigation/.*|@unimodules/.*|native-base|react-native-code-push)',
    'jest-runner'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.maestro/',
    '@react-native'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
};
