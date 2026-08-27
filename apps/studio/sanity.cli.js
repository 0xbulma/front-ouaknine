import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '46fx2dmc',
    dataset: 'production',
  },

  deployment: {
    // Pins `sanity deploy` to the existing studio so it never prompts for an
    // application id, and never risks creating a second studio.
    appId: '4e120a120bd56b17216bf75d',
  },
})
