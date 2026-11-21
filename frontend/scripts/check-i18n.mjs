import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/i18n');
const files = fs.readdirSync(root).filter((file) => file.endsWith('.json'));
const flatten = (value, prefix = '', result = {}) => {
  for (const [key, entry] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) flatten(entry, fullKey, result);
    else result[fullKey] = entry;
  }
  return result;
};
const english = flatten(JSON.parse(fs.readFileSync(path.join(root, 'en.json'), 'utf8')));
let failures = 0;
for (const file of files) {
  const language = path.basename(file, '.json');
  if (language === 'en') continue;
  const strings = flatten(JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')));
  const missing = Object.keys(english).filter((key) => !(key in strings));
  const untranslated = Object.keys(english).filter((key) => key in strings && strings[key] === english[key]);
  console.log(`${language}: ${missing.length} missing keys; ${untranslated.length} strings identical to English`);
  if (missing.length || untranslated.length) failures += 1;
}
if (failures) {
  console.error('Translation completeness check failed. Translate missing or English-identical strings before release.');
  process.exitCode = 1;
} else {
  console.log('All translation catalogs are complete and translated.');
}
