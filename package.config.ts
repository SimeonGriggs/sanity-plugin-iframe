import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  dist: 'lib',
  tsconfig: 'tsconfig.lib.json',
  extract: {
    rules: {
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },
})
