import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemas'
import {locations} from './locations.js'

export default defineConfig({
  name: 'default',
  title: 'Cabinet-Ouaknine',

  projectId: '46fx2dmc',
  dataset: 'production',

  plugins: [
    structureTool(),
    // The site, in an iframe beside the form that feeds it. `previewMode.enable`
    // is the handshake: Presentation mints a one-time secret in the dataset and
    // calls that route with it, which is what lets the site show unpublished
    // drafts and stega-encode an edit link into every string it renders.
    //
    // The route is the other half of this change, in the other workspace:
    // apps/web/pages/api/draft.ts. Nothing validates one against the other, so
    // if that route moves, this is the string to update.
    //
    // `initial` rather than the `origin`/`preview` pair, which
    // `PreviewUrlResolverOptions` deprecated in 6.9. `import.meta.env` rather
    // than `process.env`, which is not a global @sanity/eslint-config-studio
    // knows and which Vite does not populate; SANITY_STUDIO_* is where Vite puts
    // them. The default is production, so a deployed Studio needs no env at all;
    // .conductor/settings.toml sets it to the local site in a workspace.
    //
    // `resolve.locations` is the other direction: which URL a document is shown
    // at, so the form carries an "Used on" link straight to its page. Without it
    // the only way in is to browse the framed site, and a publication's slug is
    // derived from its title by code in the other workspace, so an editor cannot
    // work it out. See locations.js.
    presentationTool({
      previewUrl: {
        initial: import.meta.env.SANITY_STUDIO_PREVIEW_URL || 'https://www.ouaknine-avocats.com',
        previewMode: {enable: '/api/draft'},
      },
      resolve: {locations},
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
