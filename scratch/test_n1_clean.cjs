const fs = require('fs');
const content = fs.readFileSync('./lib/org-chart/default-office-data.ts', 'utf8');

const allNodes = [];
const blocks = content.split(/\{\s*"id":/g).slice(1);
for (const b of blocks) {
  const getId = b.match(/^\s*"([^"]+)"/);
  const getTitle = b.match(/"title":\s*"([^"]+)"/);
  const getDiv = b.match(/"division":\s*"([^"]+)"/);
  const getRep = b.match(/"reportsToId":\s*"([^"]+)"/);
  const getRepTitle = b.match(/"reportsToTitle":\s*"([^"]+)"/);
  const getNick = b.match(/"nickname":\s*"([^"]*)"/);
  if (getId && getTitle) {
    allNodes.push({
      id: getId[1],
      title: getTitle[1],
      division: getDiv ? getDiv[1] : '',
      reportsToId: getRep ? getRep[1] : '',
      reportsToTitle: getRepTitle ? getRepTitle[1] : '',
      nickname: getNick ? getNick[1] : ''
    });
  }
}

const CARD_W = 185;
const CARD_H = 76;
const H_GAP = 18;
const V_GAP = 28;

const csLeader = allNodes.find(n => n.title.toLowerCase().includes('customer service team leader') || n.nickname === 'Gianna');


// 1. Regional Leaders (y = 40 to 180)
const regionalNodes = [
  { id: 'THL_REG_HOKA', title: 'Regional Head of Hoka', nickname: 'Joel', flags: ['MY', 'TH'], x: 50, y: 120 },
  { id: 'THL_REG_DYSON', title: 'Regional Head of Dyson', nickname: 'K Ming', flags: ['TH'], x: 253, y: 120 },
  { id: 'THL_REG_FOOTWEAR', title: 'Regional Head of CMG Footwear', nickname: 'Penny', flags: ['TH', 'VN'], x: 456, y: 120 },
  { id: 'THL_REG_SPORTS_DL', title: 'Regional Head of Sports D&L', nickname: 'Hermann', flags: ['TH'], x: 659, y: 120 }
];

// 2. President (y = 40, centered above brands & supporting)
const presNode = { id: 'VN_BU_PRES', title: 'BU President CBS VN', nickname: 'Andrew F.', flags: ['VN_STAR'], x: 950, y: 40 };

// 3. Brand Heads (y = 260)
const brandHeads = [
  { id: 'SHO-HOK-146-149-010-1', title: 'Hoka Brand Manager', nickname: 'Liam' },
  { id: 'SHO-DYS-114-117-050-1', title: 'Head of Dyson', nickname: 'Andy' },
  { id: 'SHO-CRO-015-014-049-1', title: 'Head of Crocs', nickname: 'Nikki' },
  { id: 'SHO-SPO-158-167-057-1', title: 'Head of Sports Brands', nickname: 'April' },
  { id: 'SHO-SUP-161-170-058-1', title: 'Head of Supersports', nickname: 'Thảo' }
];

let curBrandX = 50;
const placedBrands = brandHeads.map(b => {
  const p = { ...b, x: curBrandX, y: 260, width: CARD_W, height: CARD_H };
  curBrandX += CARD_W + H_GAP;
  return p;
});

const dividerX = curBrandX + 15;

// 4. COE Supporting (3 columns x 3 rows) starting at dividerX + 35
const coeCol1 = [
  allNodes.find(n => n.title.includes('Senior Marketing Manager')),
  allNodes.find(n => n.title.includes('Head of Online - Supersports')),
  allNodes.find(n => n.title.includes('Head of Operations'))
].filter(Boolean);

const coeCol2 = [
  allNodes.find(n => n.title.includes('Head of Planning')),
  allNodes.find(n => n.title.includes('Wholesale Manager')),
  csLeader
].filter(Boolean);

const coeCol3 = [
  allNodes.find(n => n.title.includes('Business Development Manager')),
  allNodes.find(n => n.title.includes('Senior Project Division Manager')),
  allNodes.find(n => n.title.includes('Store Expansion Manager'))
].filter(Boolean);

const coeCols = [coeCol1, coeCol2, coeCol3];
let curCoeX = dividerX + 35;
const placedCoe = [];
coeCols.forEach(col => {
  col.forEach((node, rIdx) => {
    placedCoe.push({
      ...node,
      x: curCoeX,
      y: 260 + rIdx * (CARD_H + 20),
      width: CARD_W,
      height: CARD_H
    });
  });
  curCoeX += CARD_W + H_GAP;
});

// 5. Group Supporting (2 columns)
const groupCol1 = [
  allNodes.find(n => n.title.includes('GM Human Resources')),
  allNodes.find(n => n.title.includes('Business Controller'))
].filter(Boolean);

const groupCol2 = [
  { id: 'grp_it', title: 'IT Head', nickname: 'Luan', isVirtual: true },
  { id: 'grp_scm', title: 'SCM Head', nickname: 'Oanh', isVirtual: true },
  { id: 'grp_legal', title: 'Legal Head', nickname: 'Duong', isVirtual: true }
];

let curGroupX = curCoeX + 30;
const placedGroup = [];
[groupCol1, groupCol2].forEach(col => {
  col.forEach((node, rIdx) => {
    placedGroup.push({
      ...node,
      x: curGroupX,
      y: 260 + rIdx * (CARD_H + 20),
      width: CARD_W,
      height: CARD_H
    });
  });
  curGroupX += CARD_W + H_GAP;
});

const allPlacedN1 = [
  ...regionalNodes,
  presNode,
  ...placedBrands,
  ...placedCoe,
  ...placedGroup
];

console.log('Total placed nodes in N-1:', allPlacedN1.length);
console.log('Placed Brand Heads:', placedBrands.length);
console.log('Placed COE Heads (+ CS Leader):', placedCoe.length);
console.log('Placed Group Support:', placedGroup.length);
console.log('Canvas occupied X range: 50 to', curGroupX);

