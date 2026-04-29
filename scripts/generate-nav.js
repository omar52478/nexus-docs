import fs from 'fs';
import path from 'path';

const PAGES_DIR = './public/pages';
const OUTPUT_FILE = './src/constants/navigation.jsx';

const CATEGORY_ORDER = [
  'Basics',
  'Core System',
  'Calibration',
  'Operation',
  'Engineering',
  'Configuration',
  'Optimization',
  'Support'
];

const CATEGORY_ICONS = {
  'Basics': 'FiBookOpen',
  'Core System': 'FiCpu',
  'Calibration': 'FiTarget',
  'Operation': 'FiLayout',
  'Engineering': 'FiCode',
  'Configuration': 'FiSettings',
  'Optimization': 'FiZap',
  'Support': 'FiLifeBuoy'
};

function generateNavigation() {
  try {
    const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));
    const allPages = [];
    const categoriesMap = {};

    files.forEach(file => {
      const filePath = path.join(PAGES_DIR, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const id = file.replace('.json', '');
      
      const pageInfo = {
        id: id,
        title: content.title || id,
        category: content.category || 'Basics'
      };

      allPages.push(pageInfo);

      if (!categoriesMap[pageInfo.category]) {
        categoriesMap[pageInfo.category] = [];
      }
      categoriesMap[pageInfo.category].push({
        id: pageInfo.id,
        title: pageInfo.title
      });
    });

    // Sort categories based on predefined order
    const categoriesArray = CATEGORY_ORDER
      .filter(name => categoriesMap[name])
      .map(name => ({
        name,
        icon: CATEGORY_ICONS[name] || 'FiFileText',
        links: categoriesMap[name]
      }));

    const output = `// Auto-generated navigation - do not edit manually
export const CATEGORIES = ${JSON.stringify(categoriesArray, null, 2)};

export const ALL_PAGES = ${JSON.stringify(allPages, null, 2)};
`;

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log('✅ Navigation generated successfully with ' + allPages.length + ' pages.');
  } catch (err) {
    console.error('❌ Error generating navigation:', err);
  }
}

generateNavigation();
