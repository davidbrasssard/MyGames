// npm run dev:public: starts vite on 5173 (--host), waits until it answers, then makes the Codespaces port public.
// vite stays in the foreground; Ctrl+C stops it.
import { spawn, spawnSync } from 'node:child_process';
import { request } from 'node:http';

const PORT = 5173;
const name = process.env.CODESPACE_NAME;

spawnSync('pkill', ['-f', 'node_modules/.bin/vite'], { stdio: 'ignore' });

const vite = spawn('npx', ['vite', '--host', '--port', String(PORT), '--strictPort'], { stdio: 'inherit' });
vite.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => vite.kill(sig));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const responds = () =>
  new Promise((resolve) => {
    const req = request({ host: '127.0.0.1', port: PORT, path: '/', timeout: 1000 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });

let up = false;
for (let i = 0; i < 60 && !up; i++) {
  up = await responds();
  if (!up) await sleep(500);
}
if (!up) {
  console.error(`\n[dev:public] Port ${PORT} did not respond within 30 s. Visibility NOT changed.`);
} else if (!name) {
  console.error('\n[dev:public] CODESPACE_NAME is not set. Port visibility NOT changed.');
} else {
  let error = '';
  let ok = false;
  for (let attempt = 1; attempt <= 5 && !ok; attempt++) {
    const r = spawnSync('gh', ['codespace', 'ports', 'visibility', `${PORT}:public`, '-c', name], { encoding: 'utf8' });
    ok = r.status === 0;
    if (!ok) {
      error = (r.stderr || r.stdout || String(r.error)).trim();
      await sleep(2000);
    }
  }
  console.log(ok ? `\n[dev:public] Port ${PORT} is PUBLIC` : `\n[dev:public] FAILED to make port ${PORT} public: ${error}`);
}
