import studio from '@sanity/eslint-config-studio'

export default [
  ...studio,
  {
    // The studio config targets browser code; these run under Node.
    files: ['scripts/**/*.mjs', 'test/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
      },
    },
  },
]
