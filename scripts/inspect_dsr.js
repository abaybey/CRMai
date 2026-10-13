const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'contohdsr');
const files = fs.readdirSync(dir);
console.log('Files:', files);

for (const file of files) {
  if (!file.endsWith('.xlsx') && !file.endsWith('.xls')) continue;
  console.log('\n=========================================');
  console.log('FILE:', file);
  const filePath = path.join(dir, file);
  const wb = XLSX.readFile(filePath);
  console.log('Sheets (' + wb.SheetNames.length + '):', wb.SheetNames);

  for (const sheetName of wb.SheetNames.slice(0, 4)) {
    console.log('\n--- Sheet:', sheetName, '---');
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    console.log('Total rows:', data.length);
    for (let i = 0; i < Math.min(15, data.length); i++) {
      const nonEmpties = data[i].filter(c => c !== '');
      if (nonEmpties.length > 0) {
        console.log(`[R${i + 1}]`, data[i].slice(0, 12));
      }
    }
  }
}
