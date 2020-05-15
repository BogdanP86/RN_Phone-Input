module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  globals: {
    Intl: false,
  },
  rules: {
    "react-hooks/exhaustive-deps": 'off'
  }
};
