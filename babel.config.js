/* eslint-disable no-console */
console.log('Loaded babel.config.js');

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
      },
    ],
    '@babel/preset-react',
  ],

  env: {
    test: {
      presets: ['@babel/preset-env'],
    },
  },
};
