const fs = require('fs');

const dataContent = fs.readFileSync('lib/org-chart/default-office-data.ts', 'utf8');
const dataMatch = dataContent.match(/DEFAULT_OFFICE_NODES: OrgNode\[\] = (\[[\s\S]*?\]);/);
const rawNodes = JSON.parse(dataMatch[1]);
const hrNodes = rawNodes.filter(n => (n.division||'').toLowerCase() === 'human resources');

const count = hrNodes.length;
const isSmall = count <= 5;
const isMed = count <= 12;
const CARD_W = isSmall ? 210 : (isMed ? 190 : 185);
const CARD_H = isSmall ? 78 : (isMed ? 74 : 72);
const H_GAP = isSmall ? 24 : (isMed ? 20 : 18);
const V_GAP = isSmall ? 36 : 30;

const divNodeIds = new Set(hrNodes.map(n => n.id));
const cleanedNodes = hrNodes.map(n => {
  let repId = divNodeIds.has(n.reportsToId || '') ? n.reportsToId : undefined;
  if (!repId && n.reportsToTitle) {
    const matchByTitle = hrNodes.find(
      m => m.id !== n.id && m.title.trim().toLowerCase() === n.reportsToTitle.trim().toLowerCase()
    );
    if (matchByTitle) repId = matchByTitle.id;
  }
  return { ...n, reportsToId: repId };
});

const roots = cleanedNodes.filter(n => !n.reportsToId);

function countDescendants(nodeId, visited = new Set()) {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);
  const direct = cleanedNodes.filter(c => c.reportsToId === nodeId);
  let total = direct.length;
  direct.forEach(c => {
    total += countDescendants(c.id, visited);
  });
  return total;
}

const placedNodeMap = new Map();

function layoutSubtree(node, startX, startY) {
  const children = cleanedNodes.filter(c => c.reportsToId === node.id);
  const hasChildren = children.length > 0;
  const totalDescendants = hasChildren ? countDescendants(node.id) : 0;

  if (!hasChildren) {
    const placed = { ...node, x: startX, y: startY, width: CARD_W, height: CARD_H };
    placedNodeMap.set(node.id, placed);
    return { placedNodes: [placed], width: CARD_W, height: CARD_H };
  }

  const getSeniorityScore = (c) => {
    const t = (c.title || '').toLowerCase();
    const grade = parseInt(c.jobGrade || '0', 10);
    let score = 10;
    if (t.includes('general manager') || t.includes('director') || t.includes('head') || t.includes('gm')) score += 40;
    if (t.includes('manager') || t.includes('leader')) score += 25;
    if (t.includes('senior') || t.includes('lead') || t.includes('deputy') || t.includes('supervisor')) score += 15;
    if (grade >= 14) score += 10;
    else if (grade >= 12) score += 5;
    return score;
  };

  const branchChildren = children.filter(c => cleanedNodes.some(gc => gc.reportsToId === c.id));
  const leafChildren = children.filter(c => cleanedNodes.every(gc => gc.reportsToId !== c.id));

  branchChildren.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));
  leafChildren.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));

  if (branchChildren.length === 0) {
    const colCount = leafChildren.length <= 2 ? leafChildren.length : (leafChildren.length <= 6 ? 2 : 3);
    const rowCount = Math.ceil(leafChildren.length / colCount);
    const gridWidth = colCount * CARD_W + (colCount - 1) * H_GAP;
    const totalWidth = Math.max(CARD_W, gridWidth);
    const parentX = startX + Math.max(0, (totalWidth - CARD_W) / 2);

    const placedParent = { ...node, x: parentX, y: startY, width: CARD_W, height: CARD_H };
    placedNodeMap.set(node.id, placedParent);

    const placedLeaves = [placedParent];
    leafChildren.forEach((child, idx) => {
      const colIdx = idx % colCount;
      const rowIdx = Math.floor(idx / colCount);
      const childX = startX + colIdx * (CARD_W + H_GAP);
      const childY = startY + CARD_H + V_GAP + rowIdx * (CARD_H + 18);
      const placedChild = { ...child, x: childX, y: childY, width: CARD_W, height: CARD_H };
      placedNodeMap.set(child.id, placedChild);
      placedLeaves.push(placedChild);
    });

    const totalGridHeight = CARD_H + V_GAP + rowCount * (CARD_H + 18) - 18;
    return { placedNodes: placedLeaves, width: totalWidth, height: totalGridHeight };
  }

  let curX = startX;
  const childResults = [];
  const childY = startY + CARD_H + V_GAP;

  branchChildren.forEach(child => {
    const res = layoutSubtree(child, curX, childY);
    childResults.push(res);
    curX += res.width + H_GAP;
  });

  if (leafChildren.length > 0) {
    if (leafChildren.length <= 2) {
      leafChildren.forEach(child => {
        const res = layoutSubtree(child, curX, childY);
        childResults.push(res);
        curX += res.width + H_GAP;
      });
    } else {
      const leafColCount = leafChildren.length <= 6 ? 2 : 3;
      const leafRowCount = Math.ceil(leafChildren.length / leafColCount);
      const leafGridWidth = leafColCount * CARD_W + (leafColCount - 1) * H_GAP;
      const leafGridHeight = leafRowCount * (CARD_H + 18) - 18;

      const bundledLeaves = [];
      leafChildren.forEach((child, idx) => {
        const colIdx = idx % leafColCount;
        const rowIdx = Math.floor(idx / leafColCount);
        const childX = curX + colIdx * (CARD_W + H_GAP);
        const childYPos = childY + rowIdx * (CARD_H + 18);
        const placedChild = { ...child, x: childX, y: childYPos, width: CARD_W, height: CARD_H };
        placedNodeMap.set(child.id, placedChild);
        bundledLeaves.push(placedChild);
      });
      childResults.push({ placedNodes: bundledLeaves, width: leafGridWidth, height: leafGridHeight });
      curX += leafGridWidth + H_GAP;
    }
  }

  const totalChildrenWidth = curX - startX - H_GAP;
  const subtreeWidth = Math.max(CARD_W, totalChildrenWidth);
  const parentX = startX + Math.max(0, (subtreeWidth - CARD_W) / 2);

  const placedParent = { ...node, x: parentX, y: startY, width: CARD_W, height: CARD_H };
  placedNodeMap.set(node.id, placedParent);

  let maxChildHeight = 0;
  childResults.forEach(cr => {
    if (cr.height > maxChildHeight) maxChildHeight = cr.height;
  });

  const allPlaced = [placedParent];
  childResults.forEach(cr => allPlaced.push(...cr.placedNodes));

  return {
    placedNodes: allPlaced,
    width: subtreeWidth,
    height: CARD_H + V_GAP + maxChildHeight
  };
}

let currentRootX = 40;
const START_TREE_Y = 50;
roots.forEach(root => {
  const res = layoutSubtree(root, currentRootX, START_TREE_Y);
  currentRootX += res.width + H_GAP * 2;
});

const allPlacedNodes = Array.from(placedNodeMap.values());
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
allPlacedNodes.forEach(n => {
  if (n.x < minX) minX = n.x;
  if (n.x + n.width > maxX) maxX = n.x + n.width;
  if (n.y < minY) minY = n.y;
  if (n.y + n.height > maxY) maxY = n.y + n.height;
});

const contentW = maxX - minX;
const contentH = maxY - minY;
const minW = 880;
const minH = 660;
const reqW = contentW + 120;
const reqH = contentH + 120;

let targetW = Math.max(minW, reqW);
let targetH = Math.round(targetW * 0.75);
if (targetH < reqH) {
  targetH = reqH;
  targetW = Math.round(targetH * (4 / 3));
}

const shiftX = Math.round((targetW - contentW) / 2) - minX;
const shiftY = Math.round((targetH - contentH) / 2) - minY;

console.log({
  roots: roots.map(r => r.title),
  contentW,
  contentH,
  minX, maxX, minY, maxY,
  targetW,
  targetH,
  shiftX,
  shiftY,
});

allPlacedNodes.forEach(n => {
  n.x += shiftX;
  n.y += shiftY;
  console.log(`${n.title} (${n.nickname || ''}): x=${n.x}, y=${n.y}, bottom=${n.y + n.height}`);
});
