import { OrgNode, VirtualLeader, IndirectLink, CustomDivider, CustomNote, ViewTemplate, HeadcountSummary, NodeStatus } from '@/types/org-chart';

export interface LayoutResult {
  nodes: OrgNode[];
  indirectLinks: IndirectLink[];
  dividers: CustomDivider[];
  notes: CustomNote[];
  canvasWidth: number;
  canvasHeight: number;
  summary: HeadcountSummary;
}

/**
 * Calculates Headcount summary:
 * - Excludes Virtual Leaders (Regional C-Suite/Expats)
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
    if (node.isVirtual) continue;

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
 * Advanced Dynamic Division Tree Builder:
 * - Multi-tier compact wrapping: max 3 cards per row for large teams.
 * - Collapsible hierarchy: hides descendant nodes when a manager is collapsed.
 */
export function buildDynamicDivisionTree(
  divisionNodes: OrgNode[],
  divisionName: string,
  rawNodes: OrgNode[],
  collapsedNodeIds: Set<string> = new Set()
): { nodes: OrgNode[]; canvasWidth: number; canvasHeight: number } {
  const CARD_W = 185;
  const CARD_H = 72;
  const H_GAP = 28;
  const V_GAP = 70;
  const MAX_PER_ROW = 3; // Max 3 cards per sub-row for compact presentation

  if (divisionNodes.length === 0) {
    return { nodes: [], canvasWidth: 1200, canvasHeight: 700 };
  }

  const divNodeIds = new Set(divisionNodes.map(n => n.id));
  let roots = divisionNodes.filter(n => !n.reportsToId || !divNodeIds.has(n.reportsToId));

  if (roots.length === 0) {
    roots = [divisionNodes[0]!];
  }

  // Count total descendants for any node
  function countDescendants(nodeId: string): number {
    const direct = divisionNodes.filter(c => c.reportsToId === nodeId);
    let count = direct.length;
    direct.forEach(c => {
      count += countDescendants(c.id);
    });
    return count;
  }

  interface LayoutSubtreeResult {
    placedNodes: OrgNode[];
    width: number;
    height: number;
  }

  const placedNodeMap = new Map<string, OrgNode>();

  // Recursively layout a subtree for a given node
  function layoutSubtree(node: OrgNode, startX: number, startY: number): LayoutSubtreeResult {
    const children = divisionNodes.filter(c => c.reportsToId === node.id);
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

    // Check if children are all leaf nodes
    const allChildrenAreLeaves = children.every(c => divisionNodes.filter(gc => gc.reportsToId === c.id).length === 0);

    if (allChildrenAreLeaves && children.length > MAX_PER_ROW) {
      // Multi-row wrapping for leaf teams (e.g. 16 staff into rows of 3-4)
      const rows: OrgNode[][] = [];
      for (let i = 0; i < children.length; i += MAX_PER_ROW) {
        rows.push(children.slice(i, i + MAX_PER_ROW));
      }

      let maxRowCards = 0;
      rows.forEach(r => {
        if (r.length > maxRowCards) maxRowCards = r.length;
      });

      const teamWidth = maxRowCards * CARD_W + (maxRowCards - 1) * H_GAP;
      const parentX = startX + Math.max(0, (teamWidth - CARD_W) / 2);

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

      const placedChildren: OrgNode[] = [];
      rows.forEach((row, rowIdx) => {
        const rowY = startY + (rowIdx + 1) * (CARD_H + V_GAP);
        const rowWidth = row.length * CARD_W + (row.length - 1) * H_GAP;
        const rowStartX = startX + (teamWidth - rowWidth) / 2;

        row.forEach((child, cIdx) => {
          const placedChild: OrgNode = {
            ...child,
            x: rowStartX + cIdx * (CARD_W + H_GAP),
            y: rowY,
            width: CARD_W,
            height: CARD_H,
            hasChildren: false,
            isCollapsed: false
          };
          placedNodeMap.set(child.id, placedChild);
          placedChildren.push(placedChild);
        });
      });

      const totalHeight = (rows.length + 1) * CARD_H + rows.length * V_GAP;
      return {
        placedNodes: [placedParent, ...placedChildren],
        width: Math.max(CARD_W, teamWidth),
        height: totalHeight
      };
    }

    // Standard recursive subtree layout
    let currentX = startX;
    const childResults: LayoutSubtreeResult[] = [];

    children.forEach(child => {
      const res = layoutSubtree(child, currentX, startY + CARD_H + V_GAP);
      childResults.push(res);
      currentX += res.width + H_GAP;
    });

    const totalChildrenWidth = currentX - startX - H_GAP;
    const subtreeWidth = Math.max(CARD_W, totalChildrenWidth);
    const parentX = startX + (subtreeWidth - CARD_W) / 2;

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

  // Layout all root subtrees with generous gap
  let currentRootX = 50;
  roots.forEach(root => {
    const res = layoutSubtree(root, currentRootX, 60);
    currentRootX += res.width + 60;
  });

  const totalWidth = Math.max(1200, currentRootX + 320); // Extra room on right for CBS VN Shared sidebar
  const allNodes = Array.from(placedNodeMap.values());

  let maxY = 700;
  allNodes.forEach(n => {
    if (n.y && n.y + (n.height || CARD_H) > maxY) maxY = n.y + (n.height || CARD_H);
  });

  return {
    nodes: allNodes,
    canvasWidth: totalWidth,
    canvasHeight: Math.max(760, maxY + 120)
  };
}

/**
 * Builds the layout for each View with clean, non-intersecting vertical hierarchy
 */
export function buildOrgLayout(
  template: ViewTemplate,
  rawNodes: OrgNode[],
  virtualLeaders: VirtualLeader[],
  customIndirectLinks: IndirectLink[] = [],
  selectedDivision?: string,
  collapsedNodeIds: Set<string> = new Set()
): LayoutResult {
  let positionedNodes: OrgNode[] = [];
  let indirectLinks: IndirectLink[] = [...customIndirectLinks];
  let dividers: CustomDivider[] = [];
  let notes: CustomNote[] = [];

  const rawMap = new Map<string, OrgNode>();
  rawNodes.forEach(n => rawMap.set(n.id, n));

  const getNodeInfo = (id: string, fallbackTitle: string, fallbackNick: string) => {
    const found = rawMap.get(id);
    return {
      title: found?.title || fallbackTitle,
      nickname: found?.nickname || fallbackNick,
      holderName: found?.holderName,
      jobGrade: found?.jobGrade,
      status: found?.status || 'active'
    };
  };

  if (template === 'company_n1') {
    // =========================================================================
    // 1. ORGANIZATION N-1 (Andrew Org Chart - Clean Columns & Stacks)
    // =========================================================================
    // C-Suite Row (y=40)
    positionedNodes.push({
      id: 'THL_BU_PRES_CMG',
      title: 'BU President CMG THL',
      nickname: 'Damien',
      flags: ['MY', 'TH', 'VN'],
      status: 'active',
      isVirtual: true,
      x: 135,
      y: 40,
      width: 175,
      height: 60
    });

    positionedNodes.push({
      id: 'THL_BU_PRES_CRC',
      title: 'BU President CRC Sports THL',
      nickname: 'Alex',
      flags: ['MY', 'TH', 'VN'],
      status: 'active',
      isVirtual: true,
      x: 515,
      y: 40,
      width: 175,
      height: 60
    });

    // Andrew F. centered over Supersports + CBS VN Shared columns (815 to 1475)
    positionedNodes.push({
      id: 'VN_BU_PRES',
      title: 'BU President CBS VN',
      nickname: 'Andrew F.',
      flags: ['VN'],
      status: 'active',
      isVirtual: true,
      x: 1145,
      y: 40,
      width: 180,
      height: 60
    });

    // CRV Supporting Heads aligned directly over Column 7 (x: 1630)
    positionedNodes.push({
      id: 'CRV_SUPPORTING_HEADS',
      title: 'Supporting Function Heads CRV',
      nickname: '',
      flags: ['VN'],
      status: 'active',
      isVirtual: true,
      x: 1630,
      y: 40,
      width: 175,
      height: 60
    });

    // Category Heads Row (y=150)
    positionedNodes.push({
      id: 'THL_CAT_TECH_BEAUTY',
      title: 'Category Head Tech & Beauty',
      nickname: 'K Pavi',
      flags: ['TH', 'VN'],
      status: 'active',
      isVirtual: true,
      reportsToId: 'THL_BU_PRES_CMG',
      x: 40,
      y: 150,
      width: 170,
      height: 55
    });

    positionedNodes.push({
      id: 'THL_CAT_FASHION',
      title: 'Category Head Fashion',
      nickname: 'K Joyce',
      flags: ['TH', 'VN'],
      status: 'active',
      isVirtual: true,
      reportsToId: 'THL_BU_PRES_CMG',
      x: 230,
      y: 150,
      width: 170,
      height: 55
    });

    // Regional Heads Row (y=250)
    positionedNodes.push({
      id: 'THL_REG_DYSON',
      title: 'Regional Head of Dyson',
      nickname: 'K Ming',
      flags: ['MY', 'TH', 'VN'],
      status: 'active',
      isVirtual: true,
      reportsToId: 'THL_CAT_TECH_BEAUTY',
      x: 40,
      y: 250,
      width: 170,
      height: 55
    });

    positionedNodes.push({
      id: 'THL_REG_FOOTWEAR',
      title: 'Regional Head of Footwear',
      nickname: 'Penny',
      flags: ['MY', 'TH', 'VN'],
      status: 'active',
      isVirtual: true,
      reportsToId: 'THL_CAT_FASHION',
      x: 230,
      y: 250,
      width: 170,
      height: 55
    });

    positionedNodes.push({
      id: 'THL_REG_HOKA',
      title: 'Regional Head of Hoka',
      nickname: 'Joel',
      flags: ['MY', 'TH', 'VN'],
      status: 'active',
      isVirtual: true,
      reportsToId: 'THL_BU_PRES_CRC',
      x: 420,
      y: 250,
      width: 170,
      height: 55
    });

    positionedNodes.push({
      id: 'THL_REG_SPORTS_DL',
      title: 'Regional Head of Sports D&L Brands',
      nickname: 'Hermann',
      flags: ['MY', 'TH', 'VN'],
      status: 'active',
      isVirtual: true,
      reportsToId: 'THL_BU_PRES_CRC',
      x: 610,
      y: 250,
      width: 170,
      height: 55
    });

    // Brand Heads Row (y=380)
    const dysonHead = getNodeInfo('SHO-DYS-114-117-050-1', 'Head of Dyson', 'Andy');
    positionedNodes.push({
      id: 'SHO-DYS-114-117-050-1',
      title: dysonHead.title,
      nickname: dysonHead.nickname,
      division: 'Dyson Viet Nam',
      flags: ['VN'],
      status: dysonHead.status,
      reportsToId: 'THL_REG_DYSON',
      x: 40,
      y: 380,
      width: 170,
      height: 60
    });

    const crocsHead = getNodeInfo('SHO-CRO-015-014-049-1', 'Head of Crocs', 'Nikki');
    positionedNodes.push({
      id: 'SHO-CRO-015-014-049-1',
      title: crocsHead.title,
      nickname: crocsHead.nickname,
      division: 'Crocs',
      flags: ['VN'],
      status: crocsHead.status,
      reportsToId: 'THL_REG_FOOTWEAR',
      x: 230,
      y: 380,
      width: 170,
      height: 60
    });

    const hokaHead = getNodeInfo('SHO-HOK-146-149-010-1', 'Hoka Brand Manager', 'Liam');
    positionedNodes.push({
      id: 'SHO-HOK-BM-01',
      title: hokaHead.title,
      nickname: hokaHead.nickname,
      division: 'HOKA',
      flags: ['VN'],
      status: hokaHead.status,
      reportsToId: 'THL_REG_HOKA',
      x: 420,
      y: 380,
      width: 170,
      height: 60
    });

    const sportsHead = getNodeInfo('SHO-SPO-158-167-057-1', 'Head of Sports Brands', 'April');
    positionedNodes.push({
      id: 'SHO-MSD-191-206-073-1',
      title: sportsHead.title,
      nickname: sportsHead.nickname,
      division: 'Sports Brands',
      flags: ['VN'],
      status: sportsHead.status,
      reportsToId: 'THL_REG_SPORTS_DL',
      x: 610,
      y: 380,
      width: 170,
      height: 60
    });

    // Col 5: Supersports under Andrew F. (x: 815)
    const supersportsHead = getNodeInfo('SHO-SUP-161-170-058-1', 'Head of Supersports', 'Thảo');
    positionedNodes.push({
      id: 'SHO-SSP-HEAD-01',
      title: supersportsHead.title,
      nickname: supersportsHead.nickname,
      division: 'Supersports',
      flags: ['VN'],
      status: supersportsHead.status,
      reportsToId: 'VN_BU_PRES',
      x: 815,
      y: 380,
      width: 170,
      height: 60
    });

    positionedNodes.push({
      id: 'SHO-SSP-MKT-01',
      title: 'Sr. Marketing Manager',
      nickname: 'Stella',
      division: 'Supersports',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'SHO-SSP-HEAD-01',
      x: 815,
      y: 460,
      width: 170,
      height: 55
    });

    // Col 6: CBS VN Shared Columns (Clean vertical reporting chains per column)
    // Sub-col A: Online & Operations (x: 1005)
    positionedNodes.push({
      id: 'shared_node_0',
      title: 'Head of Sports Online',
      nickname: 'K Tooh',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'VN_BU_PRES',
      x: 1005,
      y: 380,
      width: 135,
      height: 60
    });
    positionedNodes.push({
      id: 'shared_node_1',
      title: 'Head of Sports Operations',
      nickname: 'Thi',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'shared_node_0',
      x: 1005,
      y: 460,
      width: 135,
      height: 60
    });

    // Sub-col B: Planning, Wholesale, Expansion (x: 1155)
    positionedNodes.push({
      id: 'shared_node_2',
      title: 'Head of Planning',
      nickname: 'Replace',
      flags: ['VN'],
      status: 'replace',
      reportsToId: 'VN_BU_PRES',
      x: 1155,
      y: 380,
      width: 135,
      height: 60
    });
    positionedNodes.push({
      id: 'shared_node_3',
      title: 'Wholesale Manager',
      nickname: 'Amy',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'shared_node_2',
      x: 1155,
      y: 460,
      width: 135,
      height: 60
    });
    positionedNodes.push({
      id: 'shared_node_4',
      title: 'Store Expansion Manager',
      nickname: 'Hayley',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'shared_node_3',
      x: 1155,
      y: 535,
      width: 135,
      height: 60
    });

    // Sub-col C: Bus Dev, D&C (x: 1305)
    positionedNodes.push({
      id: 'shared_node_5',
      title: 'Bus Dev Manager',
      nickname: 'Rachel',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'VN_BU_PRES',
      x: 1305,
      y: 380,
      width: 135,
      height: 60
    });
    positionedNodes.push({
      id: 'shared_node_6',
      title: 'D&C Manager',
      nickname: 'Khoa',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'shared_node_5',
      x: 1305,
      y: 460,
      width: 135,
      height: 60
    });

    // Sub-col D: Controller, HR (x: 1455)
    positionedNodes.push({
      id: 'shared_node_7',
      title: 'Business Controller',
      nickname: 'Phuoc',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'VN_BU_PRES',
      x: 1455,
      y: 380,
      width: 135,
      height: 60
    });
    positionedNodes.push({
      id: 'shared_node_8',
      title: 'HR Head',
      nickname: 'Van',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'shared_node_7',
      x: 1455,
      y: 460,
      width: 135,
      height: 60
    });

    // Col 7: CRV Shared Sitting in BU (x: 1630 - Single Vertical Chain)
    positionedNodes.push({
      id: 'crv_it',
      title: 'IT Head',
      nickname: 'Luan',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'CRV_SUPPORTING_HEADS',
      x: 1630,
      y: 380,
      width: 135,
      height: 55
    });
    positionedNodes.push({
      id: 'crv_scm',
      title: 'SCM Head',
      nickname: 'Oanh',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'crv_it',
      x: 1630,
      y: 450,
      width: 135,
      height: 55
    });
    positionedNodes.push({
      id: 'crv_legal',
      title: 'Legal Head',
      nickname: 'Duong',
      flags: ['VN'],
      status: 'active',
      reportsToId: 'crv_scm',
      x: 1630,
      y: 520,
      width: 135,
      height: 55
    });

    // Dividers perfectly positioned between column clusters
    dividers.push({
      id: 'div_ops_support',
      type: 'vertical',
      position: 795,
      labelLeft: 'VN – Brands directly reporting to THL – Heads of Brand',
      labelRight: 'Supporting Functions serving all VN- Brands transversally'
    });

    dividers.push({
      id: 'div_crv_shared',
      type: 'vertical',
      position: 1605,
      labelLeft: 'CBS VN Shared',
      labelRight: 'CRV Shared Sitting in their own BU'
    });

    notes.push({
      id: 'note_matin_kim',
      text: '- Matin Kim',
      x: 230,
      y: 470,
      isBox: true
    });
    notes.push({
      id: 'note_sports_sub',
      text: '- UA\n- Columbia\n- Speedo\n- TNF',
      x: 610,
      y: 470,
      isBox: true
    });

  } else {
    // =========================================================================
    // 2. DIVISION VIEW (Filter strictly by selectedDivision)
    // =========================================================================
    const targetDivision = (selectedDivision || 'Crocs').trim();

    const divisionNodes = rawNodes.filter(n =>
      (n.division || '').trim().toLowerCase() === targetDivision.toLowerCase()
    );

    const tree = buildDynamicDivisionTree(divisionNodes, targetDivision, rawNodes, collapsedNodeIds);
    positionedNodes = tree.nodes;

    // Optional President card on top right if division reports to President
    if (['Crocs', 'Dyson Viet Nam', 'HOKA', 'Supersports', 'Sports Brands', 'Finance', 'Human Resources', 'Operations', 'Marketing', 'Online', 'Planning', 'Project', 'Wholesale'].includes(targetDivision)) {
      positionedNodes.push({
        id: 'VN_BU_PRES',
        title: 'BU President CBS VN',
        nickname: 'Andrew F.',
        flags: ['VN'],
        status: 'active',
        isVirtual: true,
        x: Math.max(1050, tree.canvasWidth - 260),
        y: 40,
        width: 180,
        height: 60
      });
    }

    // Add divider for sidebar
    if (['Crocs', 'Dyson Viet Nam', 'HOKA', 'Matin Kim'].includes(targetDivision)) {
      dividers.push({
        id: `div_${targetDivision}_shared`,
        type: 'vertical',
        position: Math.max(960, tree.canvasWidth - 300),
        labelLeft: `${targetDivision} Organization`,
        labelRight: 'CBS VN Shared'
      });
    }
  }

  let maxX = 1450;
  let maxY = 750;
  positionedNodes.forEach(n => {
    if (n.x && n.x + (n.width || 185) > maxX) maxX = n.x + (n.width || 185);
    if (n.y && n.y + (n.height || 72) > maxY) maxY = n.y + (n.height || 72);
  });

  const isDivView = template !== 'company_n1';
  const targetDiv = selectedDivision || 'Crocs';
  const summary = calculateHeadcountSummary(positionedNodes, isDivView, targetDiv);

  return {
    nodes: positionedNodes,
    indirectLinks,
    dividers,
    notes,
    canvasWidth: maxX + 160,
    canvasHeight: maxY + 160,
    summary
  };
}
