const fs = require('fs');
const file = 'apps/admin-panel/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImport = "import { DeityManager } from './components/DeityManager';";
const decl = "\nexport const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendapis.saranamayyappa.in/api/v1';\n";

if (!content.includes('API_BASE_URL =')) {
  content = content.replace(targetImport, targetImport + decl);
}

// Replace 'http://localhost:4000/api/v1/...' with `${API_BASE_URL}/...`
content = content.replace(/'http:\/\/localhost:4000\/api\/v1([^']*)'/g, '`${API_BASE_URL}$1`');
content = content.replace(/"http:\/\/localhost:4000\/api\/v1([^"]*)"/g, '`${API_BASE_URL}$1`');
content = content.replace(/`http:\/\/localhost:4000\/api\/v1([^`]*)`/g, '`${API_BASE_URL}$1`');

fs.writeFileSync(file, content, 'utf8');
console.log('Admin panel API endpoints updated to use production API_BASE_URL successfully.');
