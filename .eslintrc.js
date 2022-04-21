module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  globals: {
    require: true,
    process: true,
    test: true,
    expect: true,
  },
  rules: {},
};
