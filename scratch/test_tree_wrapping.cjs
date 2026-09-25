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
  const getSubDept = b.match(/"subDept":\s*"([^"]*)"/);
  const getJobGrade = b.match(/"jobGrade":\s*"([^"]*)"/);
  if (getId && getTitle) {
    allNodes.push({
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

function simulateDivisionLayout(divName) {
  console.log(`\n============================`);
  console.log(`LAYOUT TEST FOR: ${divName}`);
  console.log(`============================`);
  
  const divNodes = allNodes.filter(n => n.division.toLowerCase() === divName.toLowerCase());
  const divNodeIds = new Set(divNodes.map(n => n.id));
  
  // Clean reportsTo
  const cleanedNodes = divNodes.map(n => {
    let repId = divNodeIds.has(n.reportsToId || '') ? n.reportsToId : undefined;
    if (!repId && n.reportsToTitle) {
      const matchByTitle = divNodes.find(
        m => m.id !== n.id && (
          m.title.trim().toLowerCase() === n.reportsToTitle.trim().toLowerCase() ||
          (n.reportsToTitle.toLowerCase().includes('operations manager') && m.title.toLowerCase().includes('sales & operations')) ||
          (n.reportsToTitle.toLowerCase().includes('operations manager') && m.title.toLowerCase().includes('operations'))
        )
      );
      if (matchByTitle) repId = matchByTitle.id;
    }
    return { ...n, reportsToId: repId };
  });

  const CARD_W = 185;
  const CARD_H = 76;
  const H_GAP = 18;
  const V_GAP = 28;
  const MAX_COLS = 6; // Max 6-7 columns target

  const placedNodeMap = new Map();

  function countDescendants(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    const direct = cleanedNodes.filter(c => c.reportsToId === nodeId);
    let total = direct.length;
    direct.forEach(c => total += countDescendants(c.id, visited));
    return total;
  }

  function getSeniorityScore(c) {
    const t = (c.title || '').toLowerCase();
    const grade = parseInt(c.jobGrade || '0', 10);
    let score = 10;
    if (t.includes('general manager') || t.includes('director') || t.includes('head') || t.includes('gm')) score += 40;
    if (t.includes('manager') || t.includes('leader')) score += 25;
    if (t.includes('senior') || t.includes('lead') || t.includes('deputy') || t.includes('supervisor')) score += 15;
    if (grade >= 14) score += 10;
    else if (grade >= 12) score += 5;
    return score;
  }

  function layoutSubtree(node, startX, startY, isRoot = false) {
    const children = cleanedNodes.filter(c => c.reportsToId === node.id);
    const hasChildren = children.length > 0;
    const totalDescendants = hasChildren ? countDescendants(node.id) : 0;

    if (!hasChildren) {
      const placed = {
        ...node,
        x: startX,
        y: startY,
        width: CARD_W,
        height: CARD_H,
        hasChildren: false
      };
      placedNodeMap.set(node.id, placed);
      return { placedNodes: [placed], width: CARD_W, height: CARD_H, colCount: 1 };
    }

    const branchChildren = children.filter(c => cleanedNodes.some(gc => gc.reportsToId === c.id));
    const leafChildren = children.filter(c => cleanedNodes.every(gc => gc.reportsToId !== c.id));

    branchChildren.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));
    leafChildren.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));

    // Case 1: Pure leaf subordinates
    if (branchChildren.length === 0) {
      // In division view, stack in 1 column under any manager to keep columns to 6-7 max!
      const colCount = isRoot ? Math.min(leafChildren.length, 3) : 1;
      const rowCount = leafChildren.length;
      const gridWidth = CARD_W;
      const totalWidth = CARD_W;
      const parentX = startX;


      const placedParent = {
        ...node,
        x: parentX,
        y: startY,
        width: CARD_W,
        height: CARD_H,
        hasChildren: true
      };
      placedNodeMap.set(node.id, placedParent);

      const placedLeaves = [placedParent];
      leafChildren.forEach((child, idx) => {
        const colIdx = idx % colCount;
        const rowIdx = Math.floor(idx / colCount);
        const childX = startX + colIdx * (CARD_W + H_GAP);
        const childY = startY + CARD_H + V_GAP + rowIdx * (CARD_H + 18);

        const placedChild = {
          ...child,
          x: childX,
          y: childY,
          width: CARD_W,
          height: CARD_H,
          hasChildren: false
        };
        placedNodeMap.set(child.id, placedChild);
        placedLeaves.push(placedChild);
      });

      const totalHeight = CARD_H + V_GAP + rowCount * (CARD_H + 18) - 18;
      return {
        placedNodes: placedLeaves,
        width: totalWidth,
        height: totalHeight,
        colCount
      };
    }

    // Case 2: Mixed / Branch children
    // Under each department manager (non-root): max 2 columns!
    // Under root: max 7 columns!
    let curX = startX;
    const childY = startY + CARD_H + V_GAP;
    const childResults = [];

    // For Dyson or any root with > 6 branch children:
    // If branches are small (e.g. <= 2 people like KA, VM, Training), bundle them into a single column!
    let effectiveBranches = [...branchChildren];
    if (isRoot && effectiveBranches.length > 5) {
      const largeBranches = [];
      const smallBranches = [];
      effectiveBranches.forEach(b => {
        const desc = countDescendants(b.id);
        if (desc <= 2) {
          smallBranches.push(b);
        } else {
          largeBranches.push(b);
        }
      });

      if (smallBranches.length > 1) {
        // Layout large branches as normal columns
        largeBranches.forEach(child => {
          const res = layoutSubtree(child, curX, childY, false);
          childResults.push(res);
          curX += res.width + H_GAP;
        });

        // Pack all small branches vertically into 1 column!
        let smallY = childY;
        const smallPlaced = [];
        let smallMaxW = CARD_W;
        smallBranches.forEach(sb => {
          const res = layoutSubtree(sb, curX, smallY, false);
          smallPlaced.push(...res.placedNodes);
          if (res.width > smallMaxW) smallMaxW = res.width;
          smallY += res.height + V_GAP;
        });
        childResults.push({
          placedNodes: smallPlaced,
          width: smallMaxW,
          height: smallY - childY - V_GAP,
          colCount: 1
        });
        curX += smallMaxW + H_GAP;
      } else {
        effectiveBranches.forEach(child => {
          const res = layoutSubtree(child, curX, childY, false);
          childResults.push(res);
          curX += res.width + H_GAP;
        });
      }
    } else if (!isRoot && branchChildren.length > 2) {
      // Non-root department manager (e.g. Ecommerce Manager) with > 2 sub-branches:
      // Pack into 2 columns: Col 1 has first branch, Col 2 has remaining branches stacked vertically!
      const res1 = layoutSubtree(branchChildren[0], curX, childY, false);
      childResults.push(res1);
      curX += res1.width + H_GAP;

      let col2Y = childY;
      const col2Placed = [];
      let col2MaxW = CARD_W;
      branchChildren.slice(1).forEach(b => {
        const resB = layoutSubtree(b, curX, col2Y, false);
        col2Placed.push(...resB.placedNodes);
        if (resB.width > col2MaxW) col2MaxW = resB.width;
        col2Y += resB.height + V_GAP;
      });
      childResults.push({
        placedNodes: col2Placed,
        width: col2MaxW,
        height: col2Y - childY - V_GAP,
        colCount: 1
      });
      curX += col2MaxW + H_GAP;
    } else {
      branchChildren.forEach(child => {
        const res = layoutSubtree(child, curX, childY, false);
        childResults.push(res);
        curX += res.width + H_GAP;
      });
    }

    // Leaf children under this manager (stack strictly in 1 column)
    if (leafChildren.length > 0) {
      const leafColCount = 1;
      const leafRowCount = leafChildren.length;
      const leafGridWidth = CARD_W;
      const leafGridHeight = leafRowCount * (CARD_H + 18) - 18;
      const bundledLeaves = [];
      leafChildren.forEach((child, idx) => {
        const childX = curX;
        const childYPos = childY + idx * (CARD_H + 18);
        const placedChild = {
          ...child,
          x: childX,
          y: childYPos,
          width: CARD_W,
          height: CARD_H,
          hasChildren: false
        };
        placedNodeMap.set(child.id, placedChild);
        bundledLeaves.push(placedChild);
      });
      childResults.push({
        placedNodes: bundledLeaves,
        width: leafGridWidth,
        height: leafGridHeight,
        colCount: 1
      });
      curX += leafGridWidth + H_GAP;
    }

    const totalChildrenWidth = curX - startX - H_GAP;
    const subtreeWidth = Math.max(CARD_W, totalChildrenWidth);
    const parentX = startX + Math.max(0, (subtreeWidth - CARD_W) / 2);

    const placedParent = {
      ...node,
      x: parentX,
      y: startY,
      width: CARD_W,
      height: CARD_H,
      hasChildren: true
    };
    placedNodeMap.set(node.id, placedParent);

    let maxChildHeight = 0;
    let totalCols = 0;
    childResults.forEach(cr => {
      if (cr.height > maxChildHeight) maxChildHeight = cr.height;
      totalCols += cr.colCount;
    });

    const allPlaced = [placedParent];
    childResults.forEach(cr => allPlaced.push(...cr.placedNodes));

    return {
      placedNodes: allPlaced,
      width: subtreeWidth,
      height: CARD_H + V_GAP + maxChildHeight,
      colCount: Math.max(1, totalCols)
    };



  }

  const roots = cleanedNodes.filter(n => !n.reportsToId);
  console.log('Roots found:', roots.map(r => r.title));

  let currentRootX = 40;
  const START_TREE_Y = 80;
  roots.forEach(root => {
    const children = cleanedNodes.filter(c => c.reportsToId === root.id);
    children.forEach(c => {
      const descendants = cleanedNodes.filter(n => n.reportsToId === c.id);
      console.log(`  * Branch: ${c.title} (${c.nickname}) [subDept: ${c.subDept}] - direct children: ${descendants.length}`);
    });
    const res = layoutSubtree(root, currentRootX, START_TREE_Y, true);
    console.log(`Root: ${root.title} -> Total width: ${res.width}px, height: ${res.height}px, total cols: ${res.colCount}`);
  });


  const allPlaced = Array.from(placedNodeMap.values());
  const xs = allPlaced.map(n => n.x);
  const ys = allPlaced.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs.map((x, i) => x + allPlaced[i].width));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys.map((y, i) => y + allPlaced[i].height));
  
  // Calculate distinct columns (group by X within 35px)
  const colPositions = [];
  [...xs].sort((a, b) => a - b).forEach(x => {
    if (!colPositions.some(cp => Math.abs(cp - x) <= 35)) {
      colPositions.push(x);
    }
  });

  // Calculate distinct Y rows
  const rowPositions = [];
  [...ys].sort((a, b) => a - b).forEach(y => {
    if (!rowPositions.some(rp => Math.abs(rp - y) <= 25)) {
      rowPositions.push(y);
    }
  });

  console.log(`Summary for ${divName}:`);
  console.log(`- Nodes placed: ${allPlaced.length}`);
  console.log(`- Bounding box: ${maxX - minX}px wide × ${maxY - minY}px high`);
  console.log(`- Column count: ${colPositions.length} columns`);
  console.log(`- Row levels: ${rowPositions.length} rows`);
}

simulateDivisionLayout('Crocs');
simulateDivisionLayout('Dyson Viet Nam');

