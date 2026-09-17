import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';

// Stamps per-project title/description/OG/JSON-LD into static HTML shells so
// crawlers and link previews get real content without SSR, and emits the
// sitemap. Reads src/data.js as the single source of truth by stripping the
// asset imports that Node cannot resolve.

const ROOT = process.cwd();
const SITE = 'https://julianarwansah.github.io/portofolio_julian_arwansah';

const dataSource = readFileSync(path.join(ROOT, 'src/data.js'), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/^\s*(image|gambar): \w+,?\s*$/gm, '');

const { listProyek } = await import('data:text/javascript,' + encodeURIComponent(dataSource));

const shell = readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8');

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const urls = [SITE + '/'];

for (const project of listProyek) {
  const url = `${SITE}/projects/${project.slug}/`;
  urls.push(url);

  const title = escapeHtml(`${project.title} — Julian Arwansah`);
  const description = escapeHtml(project.fullDescription.slice(0, 155));

  let html = shell;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`);
  html = html.replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/, '$1article$2');
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${description}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${description}$2`);
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: project.title,
      description: project.fullDescription,
      url,
      applicationCategory: 'DeveloperApplication',
    })}</script>`
  );

  const dir = path.join(ROOT, 'dist/projects', project.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(path.join(ROOT, 'dist/sitemap.xml'), sitemap);

// public/ is copied verbatim, so the superseded PNG sources (WebP is what the
// app imports) and dead files would otherwise ship. Prune them from the build
// output until they are removed from the repository.
const pruneDir = (relative) => {
  const abs = path.join(ROOT, relative);
  if (!existsSync(abs)) return;
  for (const name of readdirSync(abs)) {
    if (/\.(png|jpe?g)$/i.test(name)) unlinkSync(path.join(abs, name));
  }
};
pruneDir('dist/assets/proyek');
pruneDir('dist/assets/tools');
for (const relative of [
  'dist/assets/cardjul.png',
  'dist/assets/ftjul.png',
  'dist/assets/favicon.ico',
  'dist/assets/faris.png',
  'dist/assets/faris1.png',
  'dist/assets/hero-img.webp',
  'dist/vite.svg',
]) {
  const abs = path.join(ROOT, relative);
  if (existsSync(abs)) unlinkSync(abs);
}

console.log(`stamped ${listProyek.length} project pages + sitemap.xml`);
