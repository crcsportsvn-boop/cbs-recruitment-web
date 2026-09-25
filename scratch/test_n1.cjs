const fs = require('fs');
const content = fs.readFileSync('./lib/org-chart/default-office-data.ts', 'utf8');

// Parse node titles and reportsTo
const idMatches = content.match(/"id":\s*"([^"]+)"/g) || [];
console.log('Total id lines:', idMatches.length);

// Let's find nodes reporting to president
const matches = [...content.matchAll(/\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"division":\s*"([^"]+)"[^}]+?"reportsToTitle":\s*"([^"]+)"[^}]+?"nickname":\s*"([^"]*)"/gs)];
console.log('Total matched blocks:', matches.length);

const presReports = [];
matches.forEach(m => {
  if (m[4].toLowerCase().includes('president') || m[4].toLowerCase().includes('managing director')) {
    presReports.push({ id: m[1], title: m[2], division: m[3], reportsTo: m[4], nickname: m[5] });
  }
});
console.log('President reports count:', presReports.length);
presReports.forEach(r => console.log(`${r.id} | ${r.division} | ${r.title} (${r.nickname})`));
