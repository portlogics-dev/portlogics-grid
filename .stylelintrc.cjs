module.exports = {
  extends: [
    'stylelint-config-recommended-scss',
    'stylelint-config-prettier-scss',
    'stylelint-config-property-sort-order-smacss',
  ],
  plugins: ['stylelint-scss'],
  rules: {
    'at-rule-no-unknown': null,
    'no-descending-specificity': null,
    'scss/at-rule-conditional-no-parentheses': null,
  },
}