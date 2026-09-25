const fs = require('fs');

const dataContent = fs.readFileSync('lib/org-chart/default-office-data.ts', 'utf8');
const dataMatch = dataContent.match(/DEFAULT_OFFICE_NODES: OrgNode\[\] = (\[[\s\S]*?\]);/);
const rawNodes = JSON.parse(dataMatch[1]);

console.log('Total raw nodes in Excel default:', rawNodes.length);

const divisions = [...new Set(rawNodes.map(n => n.division))];
console.log('Divisions in Excel:', divisions);

divisions.forEach(div => {
  const divNodes = rawNodes.filter(n => n.division === div);
  const mkt = divNodes.filter(n => (n.dept && n.dept.toLowerCase().includes('marketing')) || (n.title && n.title.toLowerCase().includes('marketing')));
  console.log(`\nDivision [${div}]: Total ${divNodes.length} nodes, Marketing: ${mkt.length}`);
  mkt.forEach(m => console.log(`   - ${m.title} (${m.nickname || m.holderName}) [dept: ${m.dept}]`));
});
