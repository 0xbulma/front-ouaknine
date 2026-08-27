/**
 * Proves the v6 schema is shape-identical to the v2 schema in git.
 *
 * Both versions define schema types as plain, import-free JS objects, so we can
 * load the v2 originals straight out of `origin/master` and deep-compare them
 * against the current ones. Any unintended drift in a field name, type, nesting,
 * validation rule, or preview config fails the test.
 *
 * The two deliberate v3+ breaking-change fixes are declared in EXPECTED_DIFFS.
 * Anything outside that allowlist is a regression.
 */
import {test, before, describe} from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, dirname} from 'node:path'
import {pathToFileURL} from 'node:url'

const BASE = 'origin/master'

const SCHEMA_FILES = [
  'schemas/blockContent.js',
  'schemas/post.js',
  'schemas/expertiseItem.js',
  'schemas/pages/home.js',
  'schemas/pages/expertise.js',
  'schemas/pages/contact.js',
  'schemas/pages/articles.js',
  'schemas/pages/legal.js',
]

/**
 * The complete set of intentional changes, keyed by JSON-path prefix.
 * Each entry is a v2->v6 breaking-change fix, justified below.
 */
const EXPECTED_DIFFS = [
  {
    // v3 moved block-list icons from `blockEditor: {icon}` to a direct `icon`.
    path: 'blockContent.of[0].lists[1]',
    reason: 'blockEditor.icon -> icon (BlockListDefinition in @sanity/types)',
  },
  {
    // `isHighlighted`/`metadata` on a *string* field were always inert
    // (metadata is an image-type option); v6 warns on them.
    path: /\.fields\[\d+\]\.fields\[\d+\]\.options\.(isHighlighted|metadata)\b/,
    reason: 'removed deprecated inert options block from image alt/title string fields',
  },
]

let oldTypes
let newTypes

/** Records the ordered call chain a `validation` callback makes on Rule. */
function recordRule() {
  const calls = []
  const ruleTarget = function ruleTarget() {
    return undefined
  }
  const proxy = new Proxy(ruleTarget, {
    get(_t, prop) {
      if (typeof prop === 'symbol' || prop === 'then' || prop === 'toJSON') return undefined
      return (...args) => {
        calls.push(`${prop}(${args.map((a) => JSON.stringify(a) ?? String(a)).join(',')})`)
        return proxy
      }
    },
    apply: () => proxy,
  })
  return {proxy, calls}
}

/** Turns a schema type into a stable, comparable plain structure. */
function normalize(node) {
  if (Array.isArray(node)) return node.map(normalize)
  if (node === null || typeof node !== 'object') return node

  const out = {}
  for (const key of Object.keys(node).sort()) {
    const value = node[key]

    if (key === 'validation' && typeof value === 'function') {
      const {proxy, calls} = recordRule()
      try {
        value(proxy)
      } catch (err) {
        out.validation = `THREW: ${err.message}`
        continue
      }
      out.validation = calls
      continue
    }

    if (typeof value === 'function') {
      // icons, prepare(), slug source fns: compare source, whitespace-collapsed
      out[key] = `fn:${value.toString().replace(/\s+/g, ' ')}`
      continue
    }

    out[key] = normalize(value)
  }
  return out
}

/** Flattens to `path -> value` so we can diff precisely rather than eyeballing a blob. */
function flatten(node, prefix = '', acc = {}) {
  if (node !== null && typeof node === 'object') {
    const entries = Array.isArray(node)
      ? node.map((v, i) => [`${prefix}[${i}]`, v])
      : Object.entries(node).map(([k, v]) => [prefix ? `${prefix}.${k}` : k, v])
    if (entries.length === 0) acc[prefix] = Array.isArray(node) ? '[]' : '{}'
    for (const [path, value] of entries) flatten(value, path, acc)
    return acc
  }
  acc[prefix] = node
  return acc
}

function isExpected(path) {
  return EXPECTED_DIFFS.some(({path: p}) =>
    p instanceof RegExp ? p.test(path) : path.startsWith(p),
  )
}

/** Checks out the v2 schema files from git into a temp ESM package and imports them. */
async function loadBaseline() {
  const dir = mkdtempSync(join(tmpdir(), 'schema-baseline-'))
  writeFileSync(join(dir, 'package.json'), '{"type":"module"}')

  const loaded = {}
  for (const file of SCHEMA_FILES) {
    const source = execFileSync('git', ['show', `${BASE}:${file}`], {encoding: 'utf8'})
    const dest = join(dir, file)
    mkdirSync(dirname(dest), {recursive: true})
    writeFileSync(dest, source)
  }
  for (const file of SCHEMA_FILES) {
    const mod = await import(pathToFileURL(join(dir, file)).href)
    loaded[mod.default.name] = mod.default
  }
  rmSync(dir, {recursive: true, force: true})
  return loaded
}

before(async () => {
  oldTypes = await loadBaseline()
  const {schemaTypes} = await import('../schemas/index.js')
  newTypes = Object.fromEntries(schemaTypes.map((t) => [t.name, t]))
})

describe('v2 -> v6 schema parity', () => {
  test('exposes exactly the same set of types', () => {
    assert.deepEqual(Object.keys(newTypes).sort(), Object.keys(oldTypes).sort())
  })

  test('every type keeps its document/object kind', () => {
    for (const name of Object.keys(oldTypes)) {
      assert.equal(newTypes[name].type, oldTypes[name].type, `${name}.type changed`)
    }
  })

  test('no unexpected drift in any field, validation rule, or preview', () => {
    const drift = []

    for (const name of Object.keys(oldTypes)) {
      const before = flatten(normalize(oldTypes[name]), name)
      const after = flatten(normalize(newTypes[name]), name)

      for (const path of new Set([...Object.keys(before), ...Object.keys(after)])) {
        if (isExpected(path)) continue
        const a = JSON.stringify(before[path])
        const b = JSON.stringify(after[path])
        if (a !== b) drift.push(`${path}\n    v2: ${a}\n    v6: ${b}`)
      }
    }

    assert.equal(drift.length, 0, `Unexpected schema drift:\n  ${drift.join('\n  ')}`)
  })

  test('every allowlisted diff is actually present (allowlist stays honest)', () => {
    const allPaths = new Set()
    for (const name of Object.keys(oldTypes)) {
      Object.keys(flatten(normalize(oldTypes[name]), name)).forEach((p) => allPaths.add(p))
      Object.keys(flatten(normalize(newTypes[name]), name)).forEach((p) => allPaths.add(p))
    }
    for (const {path, reason} of EXPECTED_DIFFS) {
      const hit = [...allPaths].some((p) => (path instanceof RegExp ? path.test(p) : p.startsWith(path)))
      assert.ok(hit, `Stale allowlist entry, no longer matches anything: ${path} (${reason})`)
    }
  })
})
