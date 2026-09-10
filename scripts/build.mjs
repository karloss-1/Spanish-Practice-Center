import { mkdir, copyFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/', output), { recursive: true });
for (const directory of [
  'assets/resources/spanish-learning-cheat-sheet/',
  'assets/resources/essential-mexican-spanish/',
  'assets/resources/conjugation-guides/'
]) {
  await mkdir(new URL(directory, output), { recursive: true });
}
// Explicit public-file allowlist. Never copy data, tests, private files, or source folders.
for (const file of ['index.html', 'my-learning-space.html', 'practice.html', 'resources.html', 'course-roadmap.html', 'assets/styles.css', 'assets/home.css', 'assets/home-hero.webp', 'assets/practice-hero.jpg', 'assets/app.js', 'assets/student-routing.mjs', 'assets/resources/spanish-learning-cheat-sheet/Spanish-Learning-Cheat-Sheet.pdf', 'assets/resources/essential-mexican-spanish/High_Frequency_Mexican_Spanish_Verbs_001-100.pdf', 'assets/resources/essential-mexican-spanish/High_Frequency_Mexican_Spanish_Verbs_101-200.pdf', 'assets/resources/essential-mexican-spanish/High_Frequency_Mexican_Spanish_Verbs_201-300.pdf', 'assets/resources/essential-mexican-spanish/Everyday_Mexican_Spanish_Words_and_Expressions_001-100.pdf', 'assets/resources/essential-mexican-spanish/Everyday_Mexican_Spanish_Words_and_Expressions_101-200.pdf', 'assets/resources/essential-mexican-spanish/Everyday_Mexican_Spanish_Words_and_Expressions_201-300.pdf', 'assets/resources/essential-mexican-spanish/Everyday_Mexican_Spanish_Words_and_Expressions_301-400.pdf', 'assets/resources/essential-mexican-spanish/Everyday_Mexican_Spanish_Words_and_Expressions_401-500.pdf', 'assets/resources/essential-mexican-spanish/Everyday_Mexican_Spanish_Words_and_Expressions_501-600.pdf', 'assets/resources/conjugation-guides/01_Present_Indicative.pdf', 'assets/resources/conjugation-guides/02_Preterite.pdf', 'assets/resources/conjugation-guides/03_Imperfect.pdf', 'assets/resources/conjugation-guides/04_Future_and_Conditional.pdf', 'assets/resources/conjugation-guides/05_Present_Perfect.pdf', 'assets/resources/conjugation-guides/06_Pluperfect.pdf', 'assets/resources/conjugation-guides/07_Future_Perfect_and_Conditional_Perfect.pdf', 'assets/resources/conjugation-guides/08_Present_Subjunctive.pdf', 'assets/resources/conjugation-guides/09_Imperfect_Subjunctive.pdf', 'assets/resources/conjugation-guides/10_Present_Perfect_Subjunctive.pdf', 'assets/resources/conjugation-guides/11_Pluperfect_Subjunctive.pdf', 'assets/resources/conjugation-guides/12_Imperative.pdf']) {
  await copyFile(new URL(file, root), new URL(file, output));
}
await writeFile(new URL('_routes.json', output), JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }));
await writeFile(new URL('_headers', output), '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n');
await writeFile(new URL('404.html', output), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Not found</title><p>Page not found. <a href="/">Return home</a></p></html>');
console.log(`Public assets prepared in ${fileURLToPath(output)}`);
