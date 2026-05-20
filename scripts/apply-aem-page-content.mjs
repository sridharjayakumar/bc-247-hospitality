#!/usr/bin/env node
/**
 * Apply saved page JSON to AEM via Content API (stdin JSON + env or args).
 * Usage: node scripts/apply-aem-page-content.mjs <pageName> <pageId> <eTag>
 * Reads content/aem/<pageName>.json
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const [pageName, pageId, eTag] = process.argv.slice(2);
if (!pageName || !pageId || !eTag) {
  console.error('Usage: node apply-aem-page-content.mjs <pageName> <pageId> <eTag>');
  process.exit(1);
}

const content = readFileSync(join(root, 'content', 'aem', `${pageName}.json`), 'utf8');
const body = JSON.stringify(JSON.parse(content));
console.log(JSON.stringify({ pageName, pageId, eTag, contentLength: body.length }));
