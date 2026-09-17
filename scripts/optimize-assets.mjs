import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const ASSETS = path.join(ROOT, 'public', 'assets');

const JOBS = [
  { dir: 'proyek', width: 1200, q: 82 },
  { dir: 'tools', width: 128, q: 85 },
  { dir: '.', width: 512, q: 85, only: ['cardjul.png', 'ftjul.png'] },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const isRaster = (name) => /\.(png|jpe?g)$/i.test(name);

let saved = 0;

for (const job of JOBS) {
  const dir = path.join(ASSETS, job.dir);
  const files = readdirSync(dir).filter((name) =>
    job.only ? job.only.includes(name) : isRaster(name)
  );

  for (const file of files.sort()) {
    const src = path.join(dir, file);
    const out = path.join(dir, file.replace(/\.(png|jpe?g)$/i, '.webp'));
    const before = statSync(src).size;

    execFileSync('cwebp', ['-q', String(job.q), '-resize', String(job.width), '0', '-mt', src, '-o', out], {
      stdio: 'pipe',
    });

    const after = statSync(out).size;
    saved += before - after;
    console.log(`${path.relative(ROOT, src)}  ${kb(before)} -> ${path.relative(ROOT, out)}  ${kb(after)}`);
  }
}

console.log(`\ntotal saved: ${kb(saved)}`);
