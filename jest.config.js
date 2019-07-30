/* eslint-disable no-console */
console.log('Loaded jest.config.js');

module.exports = {
  rootDir: './',
  testRegex: '/__tests__\\/.*-spec\\.[jt]sx?$',
  verbose: true,
  bail: true,
};
