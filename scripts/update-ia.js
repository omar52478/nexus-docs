import fs from 'fs';
import path from 'path';

const PAGES_DIR = './public/pages';

const IA_MAPPING = {
  'getting-started': { category: 'Basics' },
  'installation': { category: 'Basics' },
  'hardware': { category: 'Basics' },
  'architecture': { category: 'Core System' },
  'vision-system': { category: 'Core System' },
  'data-files': { category: 'Core System' },
  'calibration': { category: 'Calibration' },
  'py-calibration': { category: 'Calibration' },
  'laser-alignment': { category: 'Calibration' },
  'dashboard': { category: 'Operation' },
  'controls-map': { category: 'Operation' },
  'safety': { category: 'Operation' },
  'api-reference': { category: 'Engineering' },
  'matlab-engine': { category: 'Engineering' },
  'deployment': { category: 'Engineering' },
  'settings': { category: 'Configuration' },
  'landing': { category: 'Configuration' },
  'performance': { category: 'Optimization' },
  'troubleshooting': { category: 'Support' },
  'logs-debug': { category: 'Support' },
  'faq': { category: 'Support' }
};

function updateJSONs() {
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const id = file.replace('.json', '');
    if (IA_MAPPING[id]) {
      const filePath = path.join(PAGES_DIR, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      content.category = IA_MAPPING[id].category;
      
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Updated ${file} with category ${content.category}`);
    }
  });
}

updateJSONs();
