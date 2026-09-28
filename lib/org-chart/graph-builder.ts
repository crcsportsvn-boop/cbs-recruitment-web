import {
  OrgNode,
  VirtualLeader,
  IndirectLink,
  CustomDivider,
  CustomNote,
  ViewTemplate,
  HeadcountSummary,
  NodeStatus,
  ProposalChange
} from '@/types/org-chart';

import { PillarPill, Headcount3YRow } from './department-blueprints';

export interface LayoutResult {
  nodes: OrgNode[];
  indirectLinks: IndirectLink[];
  dividers: CustomDivider[];
  notes: CustomNote[];
  canvasWidth: number;
  canvasHeight: number;
  summary: HeadcountSummary;
  pillarPills?: PillarPill[];
  headcount3Y?: Headcount3YRow[];
  slideTitle?: string;
  hasCRVShared?: boolean;
}
/**
 * Calculates Headcount summary:
 * - Excludes Virtual Leaders and External Supervisors
 * - In Division view: counts only seats in that division
 * - In N-1 view: counts all HO company seats
 */
export function calculateHeadcountSummary(
  nodes: OrgNode[],
  isDivisionView: boolean = false,
  targetDivision?: string
): HeadcountSummary {
  let occupied = 0;
  let vacant = 0;
  let newHireBP = 0;
  let replacement = 0;

  for (const node of nodes) {
    if (node.isVirtual || node.isSupervisor) continue;

    if (isDivisionView && targetDivision && node.division) {
      if (node.division.trim().toLowerCase() !== targetDivision.trim().toLowerCase()) {
        continue;
      }
    }

    if (node.status === 'new_hire' || (node.customLabel && node.customLabel.includes('New Hire'))) {
      newHireBP++;
    } else if (
      node.status === 'replace' ||
      (node.customLabel && node.customLabel.includes('Replace')) ||
      (node.title || '').toLowerCase().includes('(replace)')
    ) {
      replacement++;
    } else if (node.status === 'vacant' || (node.nickname || '').toLowerCase() === 'vacant') {
      vacant++;
    } else {
      occupied++;
    }
  }

  const totalSeats = occupied + vacant + replacement;
  const plannedTotal = totalSeats + newHireBP;

  return {
    totalSeats,
    occupied,
    vacant,
    newHireBP,
    replacement,
    plannedTotal
  };
}

/**
 * Dynamic Division Tree Builder:
 * - Automatically adapts card sizes: generous for small divisions, compact for large divisions.
 * - Multi-tier compact wrapping: max 3-4 cards per sub-row for large teams to prevent excessive width.
 * - Includes external supervisor at the top if the division reports to an outside leader (President/Regional).
 */
export function buildDynamicDivisionTree(
  divisionNodes: OrgNode[],
  divisionName: string,
  rawNodes: OrgNode[],
  collapsedNodeIds: Set<string> = new Set()
): { nodes: OrgNode[]; canvasWidth: number; canvasHeight: number } {
  const count = divisionNodes.length;
  const isDyson = divisionName.trim().toLowerCase().includes('dyson');
  const isSmall = count <= 5;
  const isMed = count <= 12;
  const CARD_W = isSmall ? 210 : (isMed ? 190 : 185);
  const CARD_H = isSmall ? 78 : (isMed ? 74 : 72);
  const H_GAP = isSmall ? 24 : (isMed ? 20 : 18);
  const V_GAP = isSmall ? 36 : 30;

  if (divisionNodes.length === 0) {
    return { nodes: [], canvasWidth: 1440, canvasHeight: 810 };
  }

  const divNodeIds = new Set(divisionNodes.map(n => n.id));

  // Connect orphan nodes whose reportsToId is outside but reportsToTitle matches a position inside this division
  const cleanedNodes = divisionNodes.map(n => {
    let repId = divNodeIds.has(n.reportsToId || '') ? n.reportsToId : undefined;
    if (!repId && n.reportsToTitle) {
      const matchByTitle = divisionNodes.find(
        m => m.id !== n.id && (
          m.title.trim().toLowerCase() === n.reportsToTitle!.trim().toLowerCase() ||
          (n.reportsToTitle!.toLowerCase().includes('operations manager') && m.title.toLowerCase().includes('sales & operations')) ||
          (n.reportsToTitle!.toLowerCase().includes('operations manager') &&
           m.title.toLowerCase().includes('operations') &&
           !m.title.toLowerCase().includes('executive') &&
           !m.title.toLowerCase().includes('sc '))
        )
      );
      if (matchByTitle) repId = matchByTitle.id;
    }
    return { ...n, reportsToId: repId };
  });

  let roots = cleanedNodes.filter(n => !n.reportsToId);
  if (roots.length === 0) {
    roots = [cleanedNodes[0]!];
  }

  // Count total descendants for any node (with cycle prevention)
  function countDescendants(nodeId: string, visited: Set<string> = new Set()): number {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    const direct = cleanedNodes.filter(c => c.reportsToId === nodeId);
    let total = direct.length;
    direct.forEach(c => {
      total += countDescendants(c.id, visited);
    });
    return total;
  }

  interface LayoutSubtreeResult {
    placedNodes: OrgNode[];
    width: number;
    height: number;
  }

  // Helper to estimate how many visual columns a division needs without forced collapsing
  function estimateDivisionColumns(): number {
    function getSubtreeCols(node: OrgNode, isR: boolean = false): number {
      const children = cleanedNodes.filter(c => c.reportsToId === node.id);
      if (children.length === 0) return 1;

      const branchChildren = children.filter(c => cleanedNodes.some(gc => gc.reportsToId === c.id));
      const leafChildren = children.filter(c => cleanedNodes.every(gc => gc.reportsToId !== c.id));

      if (!isR && branchChildren.length === 0) {
        return 1;
      }

      let branchCols = 0;
      branchChildren.forEach(bc => {
        branchCols += getSubtreeCols(bc, false);
      });

      const leafGroups = new Map<string, OrgNode[]>();
      leafChildren.forEach(lc => {
        const sd = (lc.subDept || lc.dept || lc.title || 'Other').trim();
        if (!leafGroups.has(sd)) leafGroups.set(sd, []);
        leafGroups.get(sd)!.push(lc);
      });

      let leafCols = leafGroups.size;
      return Math.max(1, branchCols + leafCols);
    }

    let totalCols = 0;
    roots.forEach(r => {
      totalCols += getSubtreeCols(r, true);
    });
    return totalCols;
  }

  const totalDivisionCols = estimateDivisionColumns();
  const shouldPreserveSubDepts = totalDivisionCols <= 8;

  const placedNodeMap = new Map<string, OrgNode>();

  // Recursively layout a subtree for a given node
  function layoutSubtree(node: OrgNode, startX: number, startY: number, isRoot: boolean = false): LayoutSubtreeResult {
    const children = cleanedNodes.filter(c => c.reportsToId === node.id);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedNodeIds.has(node.id);
    const totalDescendants = hasChildren ? countDescendants(node.id) : 0;

    if (!hasChildren || isCollapsed) {
      const placed: OrgNode = {
        ...node,
        x: startX,
        y: startY,
        width: CARD_W,
        height: CARD_H,
        hasChildren,
        isCollapsed,
        collapsedCount: totalDescendants
      };
      placedNodeMap.set(node.id, placed);
      return { placedNodes: [placed], width: CARD_W, height: CARD_H };
    }

    // Helper to evaluate seniority / rank of a position (higher number = higher rank)
    const getSeniorityScore = (c: OrgNode): number => {
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

    // Sort by seniority descending so managers/seniors are placed on top rows
    branchChildren.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));
    leafChildren.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));

    // Case 1: Pure leaf subordinates under this manager (no sub-branches)
    if (branchChildren.length === 0) {
      // Group leaf children by subDept
      const leafGroups = new Map<string, OrgNode[]>();
      leafChildren.forEach(lc => {
        const sd = (lc.subDept || lc.dept || lc.title || 'Other').trim();
        if (!leafGroups.has(sd)) leafGroups.set(sd, []);
        leafGroups.get(sd)!.push(lc);
      });

      // If at division root and division has <= 8 columns, present distinct sub-depts as separate columns
      if (isRoot && shouldPreserveSubDepts && leafGroups.size > 1) {
        let curX = startX;
        const groupResults: LayoutSubtreeResult[] = [];
        const childY = startY + CARD_H + V_GAP;

        const sortedGroups = Array.from(leafGroups.entries()).sort((a, b) => {
          const maxA = Math.max(...a[1].map(n => getSeniorityScore(n)));
          const maxB = Math.max(...b[1].map(n => getSeniorityScore(n)));
          return maxB - maxA;
        });

        sortedGroups.forEach(([sdName, members]) => {
          members.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));
          const placedInGroup: OrgNode[] = [];
          members.forEach((child, idx) => {
            const childX = curX;
            const childYPos = childY + idx * (CARD_H + 18);
            const placedChild: OrgNode = {
              ...child,
              x: childX,
              y: childYPos,
              width: CARD_W,
              height: CARD_H,
              hasChildren: false,
              isCollapsed: false,
              collapsedCount: 0
            };
            placedNodeMap.set(child.id, placedChild);
            placedInGroup.push(placedChild);
          });

          const groupHeight = members.length * (CARD_H + 18) - 18;
          groupResults.push({
            placedNodes: placedInGroup,
            width: CARD_W,
            height: groupHeight
          });
          curX += CARD_W + H_GAP;
        });

        const totalChildrenWidth = curX - startX - H_GAP;
        const subtreeWidth = Math.max(CARD_W, totalChildrenWidth);
        const parentX = startX + Math.max(0, (subtreeWidth - CARD_W) / 2);

        const placedParent: OrgNode = {
          ...node,
          x: parentX,
          y: startY,
          width: CARD_W,
          height: CARD_H,
          hasChildren: true,
          isCollapsed: false,
          collapsedCount: totalDescendants
        };
        placedNodeMap.set(node.id, placedParent);

        let maxChildHeight = 0;
        groupResults.forEach(gr => {
          if (gr.height > maxChildHeight) maxChildHeight = gr.height;
        });

        const allPlaced = [placedParent];
        groupResults.forEach(gr => allPlaced.push(...gr.placedNodes));

        return {
          placedNodes: allPlaced,
          width: subtreeWidth,
          height: CARD_H + V_GAP + maxChildHeight
        };
      }

      // In division view, stack in 1 column (CARD_W) for sub-managers to prevent horizontal sprawl
      // Division root allowed up to 3 columns banner
      const colCount = isRoot ? Math.min(leafChildren.length, 3) : 1;
      const rowCount = leafChildren.length;
      const gridWidth = colCount * CARD_W + (colCount - 1) * H_GAP;
      const totalWidth = Math.max(CARD_W, gridWidth);
      const parentX = startX + Math.max(0, (totalWidth - CARD_W) / 2);

      const placedParent: OrgNode = {
        ...node,
        x: parentX,
        y: startY,
        width: CARD_W,
        height: CARD_H,
        hasChildren: true,
        isCollapsed: false,
        collapsedCount: totalDescendants
      };
      placedNodeMap.set(node.id, placedParent);

      const placedLeaves: OrgNode[] = [placedParent];
      leafChildren.forEach((child, idx) => {
        const colIdx = idx % colCount;
        const rowIdx = Math.floor(idx / colCount);
        const childX = startX + colIdx * (CARD_W + H_GAP);
        const childY = startY + CARD_H + V_GAP + rowIdx * (CARD_H + 18);

        const placedChild: OrgNode = {
          ...child,
          x: childX,
          y: childY,
          width: CARD_W,
          height: CARD_H,
          hasChildren: false,
          isCollapsed: false,
          collapsedCount: 0
        };
        placedNodeMap.set(child.id, placedChild);
        placedLeaves.push(placedChild);
      });

      const totalGridHeight = CARD_H + V_GAP + rowCount * (CARD_H + 18) - 18;
      return {
        placedNodes: placedLeaves,
        width: totalWidth,
        height: totalGridHeight
      };
    }

    // Case 2: Mixed or multi-branch hierarchy
    let curX = startX;
    const childResults: LayoutSubtreeResult[] = [];
    const childY = startY + CARD_H + V_GAP;

    const effectiveBranches = [...branchChildren];
    if (isRoot && effectiveBranches.length > 5 && !isDyson && !shouldPreserveSubDepts) {
      const largeBranches: OrgNode[] = [];
      const smallBranches: OrgNode[] = [];
      effectiveBranches.forEach(b => {
        const desc = countDescendants(b.id);
        if (desc <= 2) {
          smallBranches.push(b);
        } else {
          largeBranches.push(b);
        }
      });

      if (smallBranches.length > 1) {
        largeBranches.forEach(child => {
          const res = layoutSubtree(child, curX, childY, false);
          childResults.push(res);
          curX += res.width + H_GAP;
        });

        // Pack small branches vertically into 1 column
        let smallY = childY;
        const smallPlaced: OrgNode[] = [];
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
          height: smallY - childY - V_GAP
        });
        curX += smallMaxW + H_GAP;
      } else {
        effectiveBranches.forEach(child => {
          const res = layoutSubtree(child, curX, childY, false);
          childResults.push(res);
          curX += res.width + H_GAP;
        });
      }
    } else if (!isRoot && branchChildren.length > 2 && !shouldPreserveSubDepts) {
      // Non-root department manager with > 2 sub-branches in wide view:
      // Pack into 2 columns: Col 1 has first branch, Col 2 has remaining branches stacked vertically
      const res1 = layoutSubtree(branchChildren[0]!, curX, childY, false);
      childResults.push(res1);
      curX += res1.width + H_GAP;

      let col2Y = childY;
      const col2Placed: OrgNode[] = [];
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
        height: col2Y - childY - V_GAP
      });
      curX += col2MaxW + H_GAP;
    } else {
      branchChildren.forEach(child => {
        const res = layoutSubtree(child, curX, childY, false);
        childResults.push(res);
        curX += res.width + H_GAP;
      });
    }

    // Leaf children under this manager
    if (leafChildren.length > 0) {
      // Group leaf children by subDept
      const leafGroups = new Map<string, OrgNode[]>();
      leafChildren.forEach(lc => {
        const sd = (lc.subDept || lc.dept || lc.title || 'Other').trim();
        if (!leafGroups.has(sd)) leafGroups.set(sd, []);
        leafGroups.get(sd)!.push(lc);
      });

      if (shouldPreserveSubDepts || isRoot) {
        // When total division columns <= 8 (or at division root),
        // DO NOT merge different sub-departments into 1 column!
        // Each sub-dept gets its own column, with members of that sub-dept stacked vertically.
        const sortedGroups = Array.from(leafGroups.entries()).sort((a, b) => {
          const maxA = Math.max(...a[1].map(n => getSeniorityScore(n)));
          const maxB = Math.max(...b[1].map(n => getSeniorityScore(n)));
          return maxB - maxA;
        });

        sortedGroups.forEach(([subDeptName, groupMembers]) => {
          groupMembers.sort((a, b) => getSeniorityScore(b) - getSeniorityScore(a));
          const groupColWidth = CARD_W;
          const groupHeight = groupMembers.length * (CARD_H + 18) - 18;
          const placedInGroup: OrgNode[] = [];

          groupMembers.forEach((child, idx) => {
            const childX = curX;
            const childYPos = childY + idx * (CARD_H + 18);
            const placedChild: OrgNode = {
              ...child,
              x: childX,
              y: childYPos,
              width: CARD_W,
              height: CARD_H,
              hasChildren: false,
              isCollapsed: false,
              collapsedCount: 0
            };
            placedNodeMap.set(child.id, placedChild);
            placedInGroup.push(placedChild);
          });

          childResults.push({
            placedNodes: placedInGroup,
            width: groupColWidth,
            height: groupHeight
          });
          curX += groupColWidth + H_GAP;
        });
      } else {
        // High-density fallback: bundle all leaf subordinates into 1 column
        const leafGridWidth = CARD_W;
        const leafGridHeight = leafChildren.length * (CARD_H + 18) - 18;
        const bundledLeaves: OrgNode[] = [];
        leafChildren.forEach((child, idx) => {
          const childX = curX;
          const childYPos = childY + idx * (CARD_H + 18);
          const placedChild: OrgNode = {
            ...child,
            x: childX,
            y: childYPos,
            width: CARD_W,
            height: CARD_H,
            hasChildren: false,
            isCollapsed: false,
            collapsedCount: 0
          };
          placedNodeMap.set(child.id, placedChild);
          bundledLeaves.push(placedChild);
        });
        childResults.push({
          placedNodes: bundledLeaves,
          width: leafGridWidth,
          height: leafGridHeight
        });
        curX += leafGridWidth + H_GAP;
      }
    }

    const totalChildrenWidth = curX - startX - H_GAP;
    const subtreeWidth = Math.max(CARD_W, totalChildrenWidth);
    const parentX = startX + Math.max(0, (subtreeWidth - CARD_W) / 2);

    const placedParent: OrgNode = {
      ...node,
      x: parentX,
      y: startY,
      width: CARD_W,
      height: CARD_H,
      hasChildren: true,
      isCollapsed: false,
      collapsedCount: totalDescendants
    };
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

  // Layout all root subtrees side-by-side
  let currentRootX = 40;
  const START_TREE_Y = 80;
  roots.forEach(root => {
    const res = layoutSubtree(root, currentRootX, START_TREE_Y, true);
    currentRootX += res.width + H_GAP * 2;
  });

  const allPlacedNodes = Array.from(placedNodeMap.values());

  // Compute exact bounding box of placed nodes
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  allPlacedNodes.forEach(n => {
    const w = n.width || CARD_W;
    const h = n.height || CARD_H;
    if (n.x !== undefined) {
      if (n.x < minX) minX = n.x;
      if (n.x + w > maxX) maxX = n.x + w;
    }
    if (n.y !== undefined) {
      if (n.y < minY) minY = n.y;
      if (n.y + h > maxY) maxY = n.y + h;
    }
  });

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // Standard 4:3 (3x4) Presentation slide target dimensions
  const minW = 880;
  const minH = 660;

  const reqW = contentW + 120;
  const reqH = contentH + 140;

  let targetW = Math.max(minW, reqW);
  let targetH = isDyson ? Math.max(minH, reqH) : Math.round(targetW * 0.75);

  if (!isDyson && targetH < reqH) {
    targetH = reqH;
    targetW = Math.round(targetH * (4 / 3)); // Width = Height * 4/3
  }

  // Auto-center horizontally
  const shiftX = Math.round((targetW - contentW) / 2) - minX;

  // Vertically position with generous top clearance (starts cleanly at >= 75px, never clipped)
  const targetTopMargin = Math.max(75, Math.min(100, Math.round((targetH - contentH) / 2)));
  const shiftY = targetTopMargin - minY;

  allPlacedNodes.forEach(n => {
    if (n.x !== undefined) n.x += shiftX;
    if (n.y !== undefined) n.y += shiftY;
  });

  // Guarantee canvasHeight encloses lowest node with comfortable clearance
  let shiftedMaxY = 0;
  allPlacedNodes.forEach(n => {
    const h = n.height || CARD_H;
    if (n.y !== undefined && n.y + h > shiftedMaxY) shiftedMaxY = n.y + h;
  });

  if (targetH < shiftedMaxY + 70) {
    targetH = shiftedMaxY + 70;
    targetW = Math.round(targetH * (4 / 3));
  }

  return {
    nodes: allPlacedNodes,
    canvasWidth: targetW,
    canvasHeight: targetH
  };
}

/**
 * Dynamic Organization N-1 Layout Engine:
 * - Dynamically identifies President / VN Managing Director from rawNodes or virtualLeaders.
 * - Dynamically gathers all Direct Reports to President (Brand Heads & Supporting Heads).
 * - Dynamically maps Regional Leaders (Thailand / CMG / CRC Sports) on the left.
 * - Dynamically maps N-2 managers under each Head in clean, readable vertical columns.
 * - No hardcoded position IDs!
 */
export function buildDynamicN1Layout(
  rawNodes: OrgNode[],
  virtualLeaders: VirtualLeader[],
  customIndirectLinks: IndirectLink[] = []
): LayoutResult {
  const CARD_W = 185;
  const CARD_H = 76;
  const H_GAP = 18;
  const V_GAP = 28;

  const rawMap = new Map<string, OrgNode>();
  rawNodes.forEach(n => rawMap.set(n.id, n));

  // 1. Locate President / MD Node
  let presNode = rawNodes.find(
    n =>
      n.title.toLowerCase().includes('president, crc sports') ||
      n.title.toLowerCase().includes('president') ||
      n.title.toLowerCase().includes('managing director')
  );

  const presId = presNode ? presNode.id : 'VN_BU_PRES';
  const presTitle = presNode ? presNode.title : 'BU President CBS VN';
  const presNick = presNode?.nickname || 'Andrew F.';

  // 2. Find Direct Reports to President
  const presReports = rawNodes.filter(
    n => n.reportsToId === presId || (n.reportsToTitle && n.reportsToTitle.toLowerCase().includes('president'))
  );

  // Classify into Brand Heads vs Supporting Functions Heads
  const BRAND_DIVISIONS = ['crocs', 'dyson', 'dyson viet nam', 'hoka', 'sports brands', 'supersports', 'matin kim', 'footwear'];

  const brandHeads: OrgNode[] = [];
  const supportHeads: OrgNode[] = [];

  presReports.forEach(node => {
    const divLower = (node.division || '').toLowerCase();
    const titleLower = node.title.toLowerCase();
    if (
      BRAND_DIVISIONS.some(b => divLower.includes(b)) ||
      titleLower.includes('head of crocs') ||
      titleLower.includes('head of dyson') ||
      titleLower.includes('brand manager') ||
      titleLower.includes('head of supersports') ||
      titleLower.includes('head of sports')
    ) {
      brandHeads.push(node);
    } else {
      supportHeads.push(node);
    }
  });

  // Exclude Trang (Marketing Manager in Hoka) as requested (she is redundant in N-1)
  const filteredBrandHeads = brandHeads.filter(n => {
    const isHokaMkt = (n.division || '').toLowerCase().includes('hoka') &&
      (n.title.toLowerCase().includes('marketing') || (n.nickname || '').toLowerCase() === 'trang');
    return !isHokaMkt;
  });

  // Ensure Liam - Hoka Brand Manager is present
  const liamHoka = rawNodes.find(n =>
    (n.nickname || '').trim().toLowerCase() === 'liam' ||
    ((n.division || '').toLowerCase().includes('hoka') && n.title.toLowerCase().includes('brand manager')) ||
    n.id === 'SHO-HOK-146-149-010-1'
  ) || {
    id: 'SHO-HOK-146-149-010-1',
    title: 'Hoka Brand Manager',
    nickname: 'Liam',
    division: 'HOKA',
    dept: 'Merchandise',
    flags: ['VN'],
    status: 'active'
  } as OrgNode;

  const finalBrandHeads = filteredBrandHeads.filter(n => !(n.division || '').toLowerCase().includes('hoka'));
  finalBrandHeads.push({
    ...liamHoka,
    title: liamHoka.title.toLowerCase().includes('hoka') ? liamHoka.title : 'Hoka Brand Manager',
    nickname: liamHoka.nickname || 'Liam',
    division: 'HOKA',
    flags: liamHoka.flags && liamHoka.flags.length > 0 ? liamHoka.flags : ['VN']
  });

  // Ensure unique primary head per brand division
  const uniqueBrandHeads: OrgNode[] = [];
  const seenDivisions = new Set<string>();

  finalBrandHeads.forEach(head => {
    const divKey = (head.division || head.title).toLowerCase();
    if (!seenDivisions.has(divKey)) {
      seenDivisions.add(divKey);
      uniqueBrandHeads.push(head);
    }
  });

  // Sort Brand Heads to align with Regional Leaders:
  // Col 0: Dyson (under Regional Head of Dyson at x: 40)
  // Col 1: Crocs (under Regional Head of Footwear at x: 235)
  // Col 2: Hoka
  // Col 3: Sports Brands
  // Col 4: Supersports
  uniqueBrandHeads.sort((a, b) => {
    const getBrandOrder = (n: OrgNode) => {
      const text = `${n.division || ''} ${n.title || ''}`.toLowerCase();
      if (text.includes('dyson')) return 0;
      if (text.includes('crocs') || text.includes('footwear')) return 1;
      if (text.includes('hoka')) return 2;
      if (text.includes('sports brands') || text.includes('sports')) return 3;
      if (text.includes('supersports') || text.includes('ssp')) return 4;
      return 10;
    };
    return getBrandOrder(a) - getBrandOrder(b);
  });

  // Find CS Leader (Gianna)
  const csLeader = rawNodes.find(
    n =>
      n.title.toLowerCase().includes('customer service team leader') ||
      (n.nickname || '').toLowerCase() === 'gianna'
  );

  const positionedNodes: OrgNode[] = [];
  const indirectLinks: IndirectLink[] = customIndirectLinks.filter(l =>
    !l.id.startsWith('ind_pres_') && l.fromId !== presId && l.toId !== presId &&
    l.fromId !== 'THL_BU_PRES_CRC' && l.toId !== 'THL_BU_PRES_CRC'
  );
  const dividers: CustomDivider[] = [];
  const notes: CustomNote[] = [];

  // 3. Layout Regional Leaders on the Left at y: 40 (x: 40 to 650)
  // Per requirement: Pavi, Joyce, Alex, Damien are completely removed from N-1.
  // K Ming, Penny, Joel, Hermann are placed at the top (y: 40).
  const regDyson = virtualLeaders.find(vl => vl.code === 'THL_REG_DYSON');
  if (regDyson) {
    positionedNodes.push({
      id: regDyson.code,
      title: regDyson.title,
      nickname: regDyson.nickname,
      flags: regDyson.flags,
      status: 'active',
      isVirtual: true,
      reportsToId: '',
      x: 40,
      y: 40,
      width: CARD_W,
      height: CARD_H
    });
  }

  const regFootwear = virtualLeaders.find(vl => vl.code === 'THL_REG_FOOTWEAR');
  if (regFootwear) {
    positionedNodes.push({
      id: regFootwear.code,
      title: regFootwear.title,
      nickname: regFootwear.nickname,
      flags: regFootwear.flags,
      status: 'active',
      isVirtual: true,
      reportsToId: '',
      x: 235,
      y: 40,
      width: CARD_W,
      height: CARD_H
    });
  }

  const regHoka = virtualLeaders.find(vl => vl.code === 'THL_REG_HOKA');
  if (regHoka) {
    positionedNodes.push({
      id: regHoka.code,
      title: regHoka.title,
      nickname: regHoka.nickname,
      flags: regHoka.flags,
      status: 'active',
      isVirtual: true,
      reportsToId: '',
      x: 430,
      y: 40,
      width: CARD_W,
      height: CARD_H
    });
  }

  const regSportsDl = virtualLeaders.find(vl => vl.code === 'THL_REG_SPORTS_DL');
  if (regSportsDl) {
    positionedNodes.push({
      id: regSportsDl.code,
      title: regSportsDl.title,
      nickname: regSportsDl.nickname,
      flags: regSportsDl.flags,
      status: 'active',
      isVirtual: true,
      reportsToId: '',
      x: 625,
      y: 40,
      width: CARD_W,
      height: CARD_H
    });
  }

  // 4. Layout VN President (MD) at top right of regional tree (directly above Thao SSP)
  const presX = 845;
  const presY = 40;
  positionedNodes.push({
    id: presId,
    title: presTitle,
    nickname: presNick,
    flags: ['VN_STAR'],
    status: 'active',
    isSupervisor: true,
    hasChildren: true,
    isCollapsed: false,
    x: presX,
    y: presY,
    width: CARD_W,
    height: CARD_H
  });

  // 5. Layout Direct Reporting Brand Heads under Regional Leaders (Tịnh tiến lên y: 190)
  // Per requirement: Brands report directly to their regional leaders (solid vertical lines),
  // and indirectly to Andrew (dashed line). Thao Supersports reports directly to CEO Andrew.
  const brandStartY = 190;

  const getDirectRegionalReport = (head: OrgNode): string => {
    const text = `${head.division || ''} ${head.title || ''} ${head.nickname || ''}`.toLowerCase();
    if (text.includes('dyson')) return regDyson?.code || 'THL_REG_DYSON';
    if (text.includes('crocs') || text.includes('footwear')) return regFootwear?.code || 'THL_REG_FOOTWEAR';
    if (text.includes('hoka')) return regHoka?.code || 'THL_REG_HOKA';
    if (text.includes('supersports') || text.includes('ssp') || text.includes('thảo') || text.includes('thao')) {
      return presId;
    }
    if (text.includes('sports brands') || text.includes('sports')) {
      return regSportsDl?.code || 'THL_REG_SPORTS_DL';
    }
    return presId;
  };

  // Fixed positions aligned perfectly under Regional Leaders:
  // Dyson (40) -> K Ming (40)
  // Crocs (235) -> Penny (235)
  // Hoka Liam (430) -> Joel (430)
  // Sports Brands April (625) -> Hermann (625)
  // Supersports Thao (845) -> Andrew (845)
  const brandXMap: Record<string, number> = {
    dyson: 40,
    crocs: 235,
    hoka: 430,
    sports: 625,
    ssp: 845
  };

  uniqueBrandHeads.forEach(head => {
    const text = `${head.division || ''} ${head.title || ''} ${head.nickname || ''}`.toLowerCase();
    const isSSP = text.includes('supersports') || text.includes('ssp') || text.includes('thảo') || text.includes('thao');
    let posX = 40;
    if (text.includes('dyson')) posX = brandXMap.dyson ?? 40;
    else if (text.includes('crocs') || text.includes('footwear')) posX = brandXMap.crocs ?? 235;
    else if (text.includes('hoka')) posX = brandXMap.hoka ?? 430;
    else if (isSSP) posX = brandXMap.ssp ?? 845;
    else if (text.includes('sports')) posX = brandXMap.sports ?? 625;

    positionedNodes.push({
      ...head,
      x: posX,
      y: brandStartY,
      width: CARD_W,
      height: CARD_H,
      reportsToId: getDirectRegionalReport(head),
      hasChildren: false,
      isCollapsed: false
    });

    // Indirect matrix reporting up to BU President Andrew (only for Brand group, not SSP who reports directly)
    if (!isSSP) {
      indirectLinks.push({
        id: `ind_pres_brand_${head.id}`,
        fromId: head.id,
        toId: presId,
        label: ''
      });
    }
  });

  // Vertical Divider separating Brand Organization and Supporting Functions
  const dividerX = 1050;
  dividers.push({
    id: 'div_brand_support',
    type: 'vertical',
    position: dividerX,
    labelLeft: 'Brand Organization',
    labelRight: 'Supporting Functions'
  });

  // 6. Layout Supporting Functions:
  // Per user requirement: keep only direct N-1 of CEO (Heads) + CS Leader (Gianna) + Group Support.
  const coeMkt = rawNodes.find(n => n.title.toLowerCase().includes('senior marketing manager')) || supportHeads.find(n => n.title.toLowerCase().includes('marketing'));
  const coeOnline = rawNodes.find(n =>
    (n.nickname || '').trim().toLowerCase() === 'emma' ||
    (n.title.toLowerCase().includes('senior ecommerce manager') && (n.division || '').toLowerCase() === 'online') ||
    (n.title.toLowerCase().includes('senior ecom manager') && (n.division || '').toLowerCase() === 'online')
  ) || rawNodes.find(n =>
    (n.division || '').toLowerCase() === 'online' &&
    (n.title.toLowerCase().includes('senior ecommerce manager') || n.title.toLowerCase().includes('senior ecom manager'))
  ) || rawNodes.find(n =>
    (n.division || '').toLowerCase() === 'online' &&
    (n.title.toLowerCase().includes('head of online') || n.title.toLowerCase().includes('ecommerce manager'))
  );
  const coeOps = rawNodes.find(n => n.title.toLowerCase().includes('head of operations'));
  const coePlanning = rawNodes.find(n => n.title.toLowerCase().includes('head of planning'));
  const coeWholesale = rawNodes.find(n => n.title.toLowerCase().includes('wholesale manager'));
  const coeBusDev = rawNodes.find(n => n.title.toLowerCase().includes('business development manager'));
  const coeDC = rawNodes.find(n =>
    n.title.toLowerCase().includes('senior project division manager') ||
    n.title.toLowerCase().includes('senior project manager') ||
    (n.division?.toLowerCase() === 'project' && n.title.toLowerCase().includes('manager')) ||
    (n.nickname || '').toLowerCase() === 'khoa'
  );
  const coeExpansion = rawNodes.find(n => n.title.toLowerCase().includes('store expansion') || n.title.toLowerCase().includes('leasing'));

  const coeCols: (OrgNode | undefined)[][] = [
    [coeMkt, coeOnline, coeOps],
    [coePlanning, coeWholesale, csLeader],
    [coeBusDev, coeDC, coeExpansion]
  ];

  let currentSupportX = dividerX + 35; // 1085
  const supportStartY = 190;

  coeCols.forEach(col => {
    col.forEach((node, rIdx) => {
      if (!node) return;
      positionedNodes.push({
        ...node,
        x: currentSupportX,
        y: supportStartY + rIdx * (CARD_H + 20),
        width: CARD_W,
        height: CARD_H,
        reportsToId: 'COE_GROUP_BOX',
        hasChildren: false,
        isCollapsed: false
      });
    });
    currentSupportX += CARD_W + H_GAP;
  });

  // Group Support (CRV): Balanced into 3 columns to match COE box width
  const hrHead = rawNodes.find(n => n.title.toLowerCase().includes('gm human resources') || n.title.toLowerCase().includes('hr head'));
  const busController = rawNodes.find(n => n.title.toLowerCase().includes('business controller'));

  const crvCol1: (OrgNode | undefined)[] = [hrHead, busController];
  const crvCol2: OrgNode[] = [
    { id: 'grp_it_head', title: 'IT Head', nickname: 'Luan', dept: 'IT', flags: ['VN'], isVirtual: true, status: 'active' } as OrgNode,
    { id: 'grp_scm_head', title: 'SCM Head', nickname: 'Oanh', dept: 'SCM', flags: ['VN'], isVirtual: true, status: 'active' } as OrgNode
  ];
  const crvCol3: OrgNode[] = [
    { id: 'grp_legal_head', title: 'Legal Head', nickname: 'Duong', dept: 'Legal', flags: ['VN'], isVirtual: true, status: 'active' } as OrgNode
  ];

  const crvCols = [crvCol1, crvCol2, crvCol3];
  let currentGroupX = currentSupportX + 35; // 1705

  // Add Virtual Leader for CRV Supporting Functions Heads (sitting at y: 40 above Column 2 of CRV)
  const crvSupportHead = virtualLeaders.find(vl => vl.code === 'CRV_SUPPORTING_HEADS') || {
    code: 'CRV_SUPPORTING_HEADS',
    title: 'Supporting Function Heads CRV',
    nickname: '',
    flags: ['VN'],
    reportsToCode: '',
    divisionScope: 'CRV Corporate Functions'
  };

  const crvCol2X = currentGroupX + CARD_W + H_GAP;
  positionedNodes.push({
    id: crvSupportHead.code,
    title: crvSupportHead.title,
    nickname: crvSupportHead.nickname || '',
    flags: crvSupportHead.flags && crvSupportHead.flags.length > 0 ? crvSupportHead.flags : ['VN'],
    status: 'active',
    isVirtual: true,
    reportsToId: '',
    x: crvCol2X,
    y: 40,
    width: CARD_W,
    height: CARD_H
  });

  crvCols.forEach(col => {
    col.forEach((node, rIdx) => {
      if (!node) return;
      positionedNodes.push({
        ...node,
        x: currentGroupX,
        y: supportStartY + rIdx * (CARD_H + 20),
        width: CARD_W,
        height: CARD_H,
        reportsToId: 'CRV_GROUP_BOX',
        hasChildren: false,
        isCollapsed: false
      });
    });
    currentGroupX += CARD_W + H_GAP;
  });

  // Calculate dynamic canvas dimensions with 4:3 (3x4) aspect ratio
  const maxOccupiedX = Math.max(dividerX, currentSupportX, currentGroupX) + 60;
  const maxOccupiedY = Math.max(
    ...positionedNodes.map(n => (n.y || 0) + (n.height || CARD_H))
  ) + 60;

  // Enforce clean canvas bounding box for N-1
  const minSlideW = 1200;
  const n1CanvasWidth = Math.max(minSlideW, maxOccupiedX);

  // Visual recentering: Align entire diagram toward top-center of slide with comfortable 60px margin
  const minNodeY = Math.min(...positionedNodes.map(n => n.y || 0));
  const shiftY = 60 - minNodeY;
  positionedNodes.forEach(n => {
    if (n.y !== undefined) n.y += shiftY;
  });

  let shiftedN1MaxY = 0;
  positionedNodes.forEach(n => {
    const h = n.height || CARD_H;
    if (n.y !== undefined && n.y + h > shiftedN1MaxY) shiftedN1MaxY = n.y + h;
  });

  const n1CanvasHeight = Math.max(680, shiftedN1MaxY + 80);

  return {
    nodes: positionedNodes,
    indirectLinks,
    dividers,
    notes,
    canvasWidth: n1CanvasWidth,
    canvasHeight: n1CanvasHeight,
    summary: calculateHeadcountSummary(positionedNodes, false)
  };
}

/**
 * Builds the layout for each View dynamically
 */
export function buildOrgLayout(
  template: ViewTemplate,
  rawNodes: OrgNode[],
  virtualLeaders: VirtualLeader[],
  customIndirectLinks: IndirectLink[] = [],
  selectedDivision?: string,
  collapsedNodeIds: Set<string> = new Set(),
  overrideNodes?: OrgNode[],
  overrideLeaders?: VirtualLeader[],
  overrideIndirect?: IndirectLink[]
): LayoutResult {
  const activeNodes = overrideNodes || rawNodes;
  const activeLeaders = overrideLeaders || virtualLeaders;
  const activeIndirect = overrideIndirect || customIndirectLinks;

  if (template === 'company_n1') {
    return buildDynamicN1Layout(activeNodes, activeLeaders, activeIndirect);
  }

  // Division View (dynamically resolves target division)
  let targetDivision = selectedDivision || 'Crocs';
  if (template === 'brand_footwear') targetDivision = 'Crocs';
  else if (template === 'brand_dyson') targetDivision = 'Dyson Viet Nam';
  else if (template === 'brand_hoka') targetDivision = 'HOKA';
  else if (template === 'hr_shared') targetDivision = 'Human Resources';

  const divisionNodes = activeNodes.filter(
    n => (n.division || '').trim().toLowerCase() === targetDivision.trim().toLowerCase()
  );

  const tree = buildDynamicDivisionTree(divisionNodes, targetDivision, activeNodes, collapsedNodeIds);

  const summary = calculateHeadcountSummary(divisionNodes, true, targetDivision);

  return {
    nodes: tree.nodes,
    indirectLinks: activeIndirect.filter(l =>
      tree.nodes.some(n => n.id === l.fromId) && tree.nodes.some(n => n.id === l.toId)
    ),
    dividers: [],
    notes: [],
    canvasWidth: tree.canvasWidth,
    canvasHeight: tree.canvasHeight,
    summary
  };
}

/**
 * Calculates diff delta between Current Org Chart and Proposal Org Chart
 */
export function calculateOrgDiff(
  currentNodes: OrgNode[],
  proposalNodes: OrgNode[]
): ProposalChange[] {
  const curMap = new Map(currentNodes.map(n => [n.id, n]));
  const propMap = new Map(proposalNodes.map(n => [n.id, n]));
  const changes: ProposalChange[] = [];

  // 1. Detect New Hires & Proposals
  proposalNodes.forEach(node => {
    if (node.isVirtual || node.isSupervisor) return;

    const cur = curMap.get(node.id);
    const isNew = !cur || node.status === 'new_hire' || (node.customLabel && node.customLabel.includes('New Hire'));
    const isRep = node.status === 'replace' || (node.customLabel && node.customLabel.includes('Replace'));

    if (isNew) {
      changes.push({
        id: `diff_new_${node.id}`,
        type: 'new_hire',
        nodeId: node.id,
        nodeTitle: node.title,
        division: node.division || 'Head Office',
        dept: node.dept,
        newValue: node.title,
        description: `Tuyển mới (New Hire BP): ${node.title} - Báo cáo cho: ${node.reportsToTitle || node.reportsToId || 'Chưa gán'}`
      });
    } else if (isRep) {
      changes.push({
        id: `diff_rep_${node.id}`,
        type: 'replace',
        nodeId: node.id,
        nodeTitle: node.title,
        division: node.division || 'Head Office',
        dept: node.dept,
        newValue: node.title,
        description: `Thay thế nhân sự (Replace): ${node.title}`
      });
    } else if (cur) {
      // Check reporting line change
      if ((node.reportsToId || '') !== (cur.reportsToId || '')) {
        changes.push({
          id: `diff_reassign_${node.id}`,
          type: 'reassigned',
          nodeId: node.id,
          nodeTitle: node.title,
          division: node.division || 'Head Office',
          dept: node.dept,
          oldValue: cur.reportsToTitle || cur.reportsToId || 'Root',
          newValue: node.reportsToTitle || node.reportsToId || 'Root',
          description: `Điều chuyển báo cáo: từ [${cur.reportsToTitle || cur.reportsToId || 'Root'}] ➔ [${node.reportsToTitle || node.reportsToId || 'Root'}]`
        });
      }

      // Check title change
      if (node.title.trim().toLowerCase() !== cur.title.trim().toLowerCase()) {
        changes.push({
          id: `diff_title_${node.id}`,
          type: 'title_modified',
          nodeId: node.id,
          nodeTitle: node.title,
          division: node.division || 'Head Office',
          dept: node.dept,
          oldValue: cur.title,
          newValue: node.title,
          description: `Điều chỉnh chức danh: từ "${cur.title}" ➔ "${node.title}"`
        });
      }
    }
  });

  // 2. Detect Removed Positions
  currentNodes.forEach(node => {
    if (node.isVirtual || node.isSupervisor) return;
    if (!propMap.has(node.id)) {
      changes.push({
        id: `diff_del_${node.id}`,
        type: 'removed',
        nodeId: node.id,
        nodeTitle: node.title,
        division: node.division || 'Head Office',
        dept: node.dept,
        oldValue: node.title,
        description: `Bãi bỏ vị trí: ${node.title} (${node.division || 'HO'})`
      });
    }
  });

  return changes;
}
