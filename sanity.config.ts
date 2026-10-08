'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'

/** The editor MAPAC uses at /studio to publish endorsements and gallery photos. */
export default defineConfig({
  name: 'mapac',
  title: 'MAPAC',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})
