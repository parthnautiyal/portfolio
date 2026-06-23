import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

async function extract() {
  const dataBuffer = fs.readFileSync('/Users/zop1721/Documents/projects/portfolio/Parth_Nautiyal_Resume.pdf');
  const parser = new pdf.PDFParse({ data: dataBuffer });
  await parser.load();
  const result = await parser.getText();
  console.log('--- EXTRACTED RESUME TEXT ---');
  console.log(result.text);
  console.log('-----------------------------');
}
extract();
