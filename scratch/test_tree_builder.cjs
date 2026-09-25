const fs = require('fs');

// Read default-office-data
const content = fs.readFileSync('./lib/org-chart/default-office-data.ts', 'utf8');
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

console.log('Total nodes loaded:', nodes.length);
