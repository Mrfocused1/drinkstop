import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, relative } from 'node:path';
const root = process.cwd();
function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  });
}
const pages = htmlFiles(root);
let count = 0;
for (const page of pages) {
  const original = readFileSync(page, 'utf8');
  const updated = original.replace(/\b(src|href)=(['"])([^'"<>]+)\2/g, (match, attr, quote, source) => {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(source)) return match;
    const url = new URL(source.replaceAll('&amp;', '&'), 'https://static.invalid/');
    if (!/\.(?:css|js|webp)$/i.test(url.pathname)) return match;
    const path = source.split(/[?#]/)[0];
    const file = resolve(path.startsWith('/') ? root : dirname(resolve(page)), path.replace(/^\//, ''));
    if (relative(root, file).startsWith('..') || !existsSync(file) || !statSync(file).isFile()) return match;
    url.searchParams.set('v', createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12));
    count++;
    return `${attr}=${quote}${path}${url.search.replaceAll('&', '&amp;')}${url.hash}${quote}`;
  });
  if (updated !== original) writeFileSync(page, updated);
}
console.log(`Versioned ${count} static asset references for browser caching.`);
