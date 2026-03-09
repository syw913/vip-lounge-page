module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true // 最兼容的 ES 环境配置
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    sourceType: 'module' // 移除 @babel/eslint-parser，避免依赖问题
  },
  rules: {
    // 只保留关键禁用规则，减少配置复杂度
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn'
  }
};