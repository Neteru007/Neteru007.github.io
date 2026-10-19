import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const versions = {};
for (const kind of ['demons', 'angels']) versions[kind] = createHash('sha256').update(await readFile(new URL('../public/data/' + kind + '.json', import.meta.url))).digest('hex').slice(0, 12);
await writeFile(new URL('../src/app/core/catalog-version.ts', import.meta.url), '// Generated from reviewed JSON data by scripts/version-data.mjs.\nexport const dataVersions = ' + JSON.stringify(versions) + ' as const;\n');
