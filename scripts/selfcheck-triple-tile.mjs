// Dev-only self-check for Triple Tile logic: node scripts/selfcheck-triple-tile.mjs
// Generates 200 boards per level and plays each board's generation order through the real rules.
import { build } from 'rolldown';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'tt-check-'));
const out = join(dir, 'check.mjs');
await build({
  input: 'src/games/tripletile/selfcheck.ts',
  output: { file: out, format: 'esm' },
  logLevel: 'silent',
});
const { runSelfCheck } = await import(pathToFileURL(out).href);
const ok = runSelfCheck(200);
process.exit(ok ? 0 : 1);
