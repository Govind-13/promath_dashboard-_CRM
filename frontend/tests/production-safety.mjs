import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('src/app/App.tsx');
const client = read('src/api/client.ts');
const proposal = read('src/components/dashboard/ProposalGenerator.tsx');
const collegesView = read('src/components/colleges/AllColleges.tsx');
const bulkUpload = read('src/components/BulkUploadModal.tsx');
const excelUtils = read('src/utils/excel.ts');
const sourceFiles = [];

function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(full);
  }
}
collect(path.join(root, 'src'));
const activeSource = sourceFiles
  .filter(file => !file.endsWith(path.join('utils', 'storage.ts')) && !file.endsWith(path.join('services', 'api.ts')))
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');

assert.match(app, /authApi\.me\(\)/);
assert.match(app, /authApi\.logout\(\)/);
assert.match(app, /role === 'admin' \|\| role === 'billing'/);
assert.match(app, /role === 'admin' \? 'All Colleges' : 'My Assignments'/);
assert.match(app, /onDelete=\{deleteCollege\}/);
assert.match(collegesView, /onDelete=\{role === 'admin' \? onDelete : undefined\}/);
assert.match(bulkUpload, /Download Format/);
assert.match(excelUtils, /promath_college_upload_template\.csv/);
assert.match(app, /collegeApi\.create/);
assert.match(app, /collegeApi\.update/);
assert.match(app, /collegeApi\.delete/);
assert.match(app, /stageApi\.(create|update)/);
assert.match(proposal, /billingApi\.(create|update|delete)/);
assert.match(client, /import\.meta\.env\.DEV && import\.meta\.env\.VITE_ENABLE_LOCAL_FALLBACK === 'true'/);
assert.doesNotMatch(activeSource, /promath_crm_v13|promath_billing_v2|\/api\/storage/);

const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  const bundle = [];
  collectBundle(dist, bundle);
  const text = bundle.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(text, /promath_crm_v13|promath_billing_v2|\/api\/storage/);
}

function collectBundle(dir, output) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectBundle(full, output);
    else if (/\.(js|html)$/.test(entry.name)) output.push(full);
  }
}

console.log('frontend production safety checks passed');
