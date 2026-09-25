const fs = require('fs');

// Read graph-builder.ts and department-blueprints.ts
// We want to test what getBlueprintForDivision returns for each division in Excel!
const bpFile = fs.readFileSync('lib/org-chart/department-blueprints.ts', 'utf8');

const divList = [
  'Crocs',          'Dyson Viet Nam',
  'Executive Team', 'Finance',
  'HOKA',           'Human Resources',
  'Leasing',        'Marketing',
  'Matin Kim',      'Online',
  'Operations',     'Planning',
  'Project',        'Sports Brands',
  'Supersports',    'Wholesale'
];

divList.forEach(div => {
  // Let's see what getBlueprintForDivision matches:
  const normalized = div.trim().toLowerCase();
  // Check matching logic in department-blueprints.ts:
  // getBlueprintForDivision(div)
  console.log(`Checking [${div}]...`);
});
