module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'prettier'
    
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"]  }]
  },
};
