import {readFileSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync('index.html','utf8');
const sources=[...html.matchAll(/src="(wp-content\/uploads\/2026\/07\/vibe\/product-[^"]+)"/g)].map(m=>m[1].split('?')[0]);
assert.equal(sources.length,7,'Expected seven product images');
let bytes=0;
for(const src of sources){const size=statSync(src).size;assert(size<=150_000,`${src} exceeds the 150 kB image budget`);bytes+=size;}
console.log(`Seven product images: ${(bytes/1e6).toFixed(2)} MB; all within budget.`);
