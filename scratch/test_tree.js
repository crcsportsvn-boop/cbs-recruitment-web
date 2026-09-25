const fs = require('fs');

const dataContent = fs.readFileSync('lib/org-chart/default-office-data.ts', 'utf8');
const dataMatch = dataContent.match(/DEFAULT_OFFICE_NODES: OrgNode\[\] = (\[[\s\S]*?\]);/);
const rawNodes = JSON.parse(dataMatch[1]);

// Test buildDynamicDivisionTree logic
function testTree(divisionNodes, divName) {
  const isSmall = divisionNodes.length <= 12;
  const CARD_W = isSmall ? 195 : 180;
  const CARD_H = isSmall ? 78 : 74;

  const divNodeIds = new Set(divisionNodes.map(n => n.id));
  const cleanedNodes = divisionNodes.map(n => ({
    ...n,
    reportsToId: divNodeIds.has(n.reportsToId || '') ? n.reportsToId : undefined
  }));

  const roots = cleanedNodes.filter(n => !n.reportsToId);
  console.log(`[${divName}]: Total ${divisionNodes.length} nodes, Roots: ${roots.map(r => r.title + ' (' + r.nickname + ')').join(', ')}`);
}

const divList = [
  'Crocs', 'Dyson Viet Nam', 'HOKA', 'Matin Kim', 'Sports Brands', 'Supersports', 'Human Resources', 'Finance'
];

divList.forEach(d => {
  const divNodes = rawNodes.filter(n => (n.division || '').toLowerCase() === d.toLowerCase());
  testTree(divNodes, d);
});
