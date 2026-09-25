const fs = require('fs');
const content = fs.readFileSync('./lib/org-chart/default-office-data.ts', 'utf8');

// Match all nodes
const nodes = [];
const blocks = content.split(/\{\s*"id":/g).slice(1);
for (const b of blocks) {
  const getId = b.match(/^\s*"([^"]+)"/);
  const getTitle = b.match(/"title":\s*"([^"]+)"/);
  const getDiv = b.match(/"division":\s*"([^"]+)"/);
  const getRep = b.match(/"reportsToId":\s*"([^"]+)"/);
  const getRepTitle = b.match(/"reportsToTitle":\s*"([^"]+)"/);
  const getNick = b.match(/"nickname":\s*"([^"]*)"/);
  const getSubDept = b.match(/"subDept":\s*"([^"]*)"/);
  if (getId && getTitle) {
    nodes.push({
      id: getId[1],
      title: getTitle[1],
      division: getDiv ? getDiv[1] : '',
      subDept: getSubDept ? getSubDept[1] : '',
      reportsToId: getRep ? getRep[1] : '',
      reportsToTitle: getRepTitle ? getRepTitle[1] : '',
      nickname: getNick ? getNick[1] : ''
    });
  }
}

function printTree(divName) {
  console.log(`\n=== TREE FOR ${divName} ===`);
  const divNodes = nodes.filter(n => n.division.toLowerCase() === divName.toLowerCase());
  console.log('Total nodes:', divNodes.length);
  const divIds = new Set(divNodes.map(n => n.id));
  
  // Find roots
  const roots = divNodes.filter(n => !divIds.has(n.reportsToId));
  console.log('Roots:', roots.map(r => `${r.title} (${r.nickname}) [${r.id}]`));
  
  function printChildren(parentId, indent = '  ') {
    const children = divNodes.filter(n => n.reportsToId === parentId);
    children.forEach(c => {
      const childOfChild = divNodes.filter(n => n.reportsToId === c.id);
      console.log(`${indent}- ${c.title} (${c.nickname}) [subDept: ${c.subDept}] (children: ${childOfChild.length})`);
      printChildren(c.id, indent + '    ');
    });
  }
  
  roots.forEach(r => printChildren(r.id));
}

printTree('Crocs');
printTree('Dyson Viet Nam');

console.log('\n=== DYSON ORPHANS ===');
const dysonNodes = nodes.filter(n => n.division.toLowerCase() === 'dyson viet nam');
dysonNodes.filter(n => ['Minh', 'Linh', 'Ryan', 'Thành', 'Anh'].includes(n.nickname)).forEach(n => {
  console.log(n.title, `(${n.nickname})`, 'reportsToTitle:', n.reportsToTitle, 'reportsToId:', n.reportsToId);
});

