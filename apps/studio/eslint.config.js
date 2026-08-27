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
  {
    // ...and it declares no browser globals either, so the two timers
    // debounce-hooks.js calls read as undefined. Declared by hand rather than
    // by pulling in `globals` for two identifiers.
    files: ['components/**/*.{js,jsx}', 'helpers/**/*.js'],
    languageOptions: {
      globals: {
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
]
