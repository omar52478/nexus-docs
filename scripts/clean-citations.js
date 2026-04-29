import fs from 'fs';
import path from 'path';

const pagesDir = path.resolve('./public/pages');

function cleanCitations() {
  fs.readdir(pagesDir, (err, files) => {
    if (err) {
      console.error('Error reading pages directory:', err);
      return;
    }

    files.filter(f => f.endsWith('.json')).forEach(file => {
      const filePath = path.join(pagesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Regex to match [cite: 8], [cite: 5, 10], etc.
      // Matches literal "[cite:" followed by any characters lazily, followed by "]"
      const cleanedContent = content.replace(/\[cite:[^\]]+\]/g, '');

      if (content !== cleanedContent) {
        fs.writeFileSync(filePath, cleanedContent, 'utf-8');
        console.log(`Cleaned citations in ${file}`);
      } else {
        console.log(`No citations found in ${file}`);
      }
    });
    
    console.log('Finished cleaning all JSON files.');
  });
}

cleanCitations();
