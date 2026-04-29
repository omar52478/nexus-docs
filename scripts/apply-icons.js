import fs from 'fs';
import path from 'path';

const PAGES_DIR = './public/pages';

const ICON_MAPPING = {
  'getting-started': 'FiCompass',
  'installation': 'FiDownload',
  'hardware': 'FiCpu',
  'architecture': 'FiMap',
  'vision-system': 'FiEye',
  'data-files': 'FiDatabase',
  'calibration': 'FiCrosshair',
  'py-calibration': 'FiActivity',
  'laser-alignment': 'FiMaximize',
  'dashboard': 'FiSliders',
  'controls-map': 'FiMousePointer',
  'safety': 'FiShield',
  'api-reference': 'FiCommand',
  'matlab-engine': 'FiTerminal',
  'deployment': 'FiGlobe',
  'settings': 'FiSettings',
  'performance': 'FiBarChart2',
  'troubleshooting': 'FiAlertCircle',
  'logs-debug': 'FiHash',
  'faq': 'FiHelpCircle'
};

function updateIconsInJSONs() {
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const id = file.replace('.json', '');
    if (ICON_MAPPING[id]) {
      const filePath = path.join(PAGES_DIR, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      content.icon = ICON_MAPPING[id];
      // Keep category update logic just in case
      
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Updated icon for ${file} -> ${content.icon}`);
    }
  });
}

updateIconsInJSONs();
