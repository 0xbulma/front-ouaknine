/**
 * Checks every real document in the dataset against the current schema and
 * reports fields that exist in the data but have nowhere to live in the schema.
 *
 * An orphaned field is not lost data — it stays in the content lake and any
 * GROQ query still returns it — but it is invisible and uneditable in the Studio.
 *
 * Network-dependent, so deliberately NOT part of `npm test` (which stays
 * deterministic and offline). Run with: npm run check:data
 */
import {schemaTypes} from '../schemas/index.js'

const PROJECT = '46fx2dmc'
const DATASET = 'production'
const API = '2021-06-07'

/** Sanity-managed document types that never appear in a user schema. */
const SYSTEM_TYPES = /^sanity\./

/** Members the Studio adds to image/file/reference objects implicitly. */
const IMPLICIT_MEMBERS = new Set(['asset', 'hotspot', 'crop', 'media', '_ref', '_weak', '_strengthenOnPublish'])

const byName = Object.fromEntries(schemaTypes.map((t) => [t.name, t]))

async function fetchAll() {
  const url = `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent('*')}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Query failed: HTTP ${res.status}`)
  const {result} = await res.json()
  return result
}

function walk(value, typeDef, path, docId, orphans) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return
  const fields = typeDef?.fields
  if (!fields) return

  const known = new Set(fields.map((f) => f.name))
  for (const key of Object.keys(value)) {
    if (key.startsWith('_') || IMPLICIT_MEMBERS.has(key)) continue
    if (!known.has(key)) {
      orphans.push({docId, path: `${path}.${key}`, key})
      continue
    }
    const def = fields.find((f) => f.name === key)
    const nested = def.fields ? def : byName[def.type]
    if (nested?.fields) walk(value[key], nested, `${path}.${key}`, docId, orphans)
  }
}

const docs = await fetchAll()
const orphans = []
const counts = {}
let skipped = 0

for (const doc of docs) {
  if (SYSTEM_TYPES.test(doc._type)) { skipped++; continue }
  counts[doc._type] = (counts[doc._type] || 0) + 1
  const typeDef = byName[doc._type]
  if (!typeDef) {
    orphans.push({docId: doc._id, path: doc._type, key: `<unknown _type "${doc._type}">`})
    continue
  }
  walk(doc, typeDef, doc._type, doc._id, orphans)
}

console.log(`Documents: ${docs.length} (${skipped} Sanity-managed, skipped)`)
console.log(`By type:   ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' ')}`)
console.log()

if (orphans.length === 0) {
  console.log('✅ No orphaned fields — all content maps to the current schema.')
  process.exit(0)
}

const grouped = orphans.reduce((acc, o) => {
  const k = o.path.split('.').slice(0, -1).join('.') + '.' + o.key
  ;(acc[k] ||= []).push(o.docId)
  return acc
}, {})

console.log(`⚠️  ${Object.keys(grouped).length} orphaned field(s) across ${orphans.length} document(s):\n`)
for (const [field, ids] of Object.entries(grouped)) {
  console.log(`   ${field}  —  ${ids.length} document(s)`)
  console.log(`     e.g. ${ids.slice(0, 3).join(', ')}${ids.length > 3 ? ', …' : ''}`)
}
console.log('\nThese are invisible in the Studio but still present in the dataset and')
console.log('still returned by GROQ. Nothing is lost.')
