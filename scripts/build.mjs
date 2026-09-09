import { mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/', output), { recursive: true });
// Explicit public-file allowlist. Never copy data, tests, private files, or source folders.
for (const file of ['index.html', 'my-learning-space.html', 'practice.html', 'resources.html', 'course-roadmap.html', 'assets/styles.css', 'assets/home.css', 'assets/home-hero.webp', 'assets/app.js', 'assets/student-routing.mjs']) {
  await copyFile(new URL(file, root), new URL(file, output));
}
await writeFile(new URL('_routes.json', output), JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }));
await writeFile(new URL('_headers', output), '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n');
await writeFile(new URL('404.html', output), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Not found</title><p>Page not found. <a href="/">Return home</a></p></html>');
console.log(`Public assets prepared in ${fileURLToPath(output)}`);
