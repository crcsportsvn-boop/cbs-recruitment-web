const fs = require('fs');

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
  const getJobGrade = b.match(/"jobGrade":\s*"([^"]*)"/);
  if (getId && getTitle) {
    nodes.push({
      id: getId[1],
      title: getTitle[1],
      division: getDiv ? getDiv[1] : '',
      subDept: getSubDept ? getSubDept[1] : '',
      reportsToId: getRep ? getRep[1] : '',
      reportsToTitle: getRepTitle ? getRepTitle[1] : '',
      nickname: getNick ? getNick[1] : '',
      jobGrade: getJobGrade ? getJobGrade[1] : '10'
    });
  }
}

console.log('Nodes parsed:', nodes.length);

const dysonNodes = nodes.filter(n => n.division.toLowerCase() === 'dyson viet nam');
const divNodeIds = new Set(dysonNodes.map(n => n.id));
const cleanedDyson = dysonNodes.map(n => {
  let repId = divNodeIds.has(n.reportsToId || '') ? n.reportsToId : undefined;
  if (!repId && n.reportsToTitle) {
    const matchByTitle = dysonNodes.find(
      m => m.id !== n.id && (
        m.title.trim().toLowerCase() === n.reportsToTitle.trim().toLowerCase() ||
        m.title.trim().toLowerCase().includes(n.reportsToTitle.trim().toLowerCase()) ||
        n.reportsToTitle.trim().toLowerCase().includes(m.title.trim().toLowerCase())
      )
    );
    if (matchByTitle) repId = matchByTitle.id;
  }
  return { ...n, reportsToId: repId };
});

console.log('Dyson titles:', [...new Set(dysonNodes.map(n => n.title))]);
console.log('Dyson dept/subDept:', [...new Set(dysonNodes.map(n => `${n.title} | ${n.subDept}`))]);


