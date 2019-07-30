/* eslint-disable no-console */
console.log('Loaded babel.config.js');

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
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
