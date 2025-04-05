import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the font file
const fontPath = join(__dirname, 'PotroSans.ttf');

try {
  const data = await readFile(fontPath);
  const base64Font = data.toString('base64');

  const output = {
    bengaliFontBase64: base64Font
  };

  const outputPath = join(__dirname, 'potroSansFont.json');
  await writeFile(outputPath, JSON.stringify(output));

  console.log('🎉 fontData.json has been created successfully.');
} catch (err) {
  console.error('❌ Error:', err.message);
}
