"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHeadcountSummary = calculateHeadcountSummary;
exports.buildDynamicDivisionTree = buildDynamicDivisionTree;
exports.buildDynamicN1Layout = buildDynamicN1Layout;
exports.buildOrgLayout = buildOrgLayout;
exports.calculateOrgDiff = calculateOrgDiff;
/**
 * Calculates Headcount summary:
 * - Excludes Virtual Leaders and External Supervisors
 * - In Division view: counts only seats in that division
 * - In N-1 view: counts all HO company seats
 */
function calculateHeadcountSummary(nodes, isDivisionView, targetDivision) {
    if (isDivisionView === void 0) { isDivisionView = false; }
    var occupied = 0;
    var vacant = 0;
    var newHireBP = 0;
    var replacement = 0;
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        if (node.isVirtual || node.isSupervisor)
            continue;
        if (isDivisionView && targetDivision && node.division) {
            if (node.division.trim().toLowerCase() !== targetDivision.trim().toLowerCase()) {
                continue;
            }
        }
        if (node.status === 'new_hire' || (node.customLabel && node.customLabel.includes('New Hire'))) {
            newHireBP++;
        }
        else if (node.status === 'replace' ||
            (node.customLabel && node.customLabel.includes('Replace')) ||
            (node.title || '').toLowerCase().includes('(replace)')) {
            replacement++;
        }
        else if (node.status === 'vacant' || (node.nickname || '').toLowerCase() === 'vacant') {
            vacant++;
        }
        else {
            occupied++;
        }
    }
    var totalSeats = occupied + vacant + replacement;
    var plannedTotal = totalSeats + newHireBP;
    return {
        totalSeats: totalSeats,
        occupied: occupied,
        vacant: vacant,
        newHireBP: newHireBP,
        replacement: replacement,
        plannedTotal: plannedTotal
    };
}
/**
 * Dynamic Division Tree Builder:
 * - Automatically adapts card sizes: generous for small divisions, compact for large divisions.
 * - Multi-tier compact wrapping: max 3-4 cards per sub-row for large teams to prevent excessive width.
 * - Includes external supervisor at the top if the division reports to an outside leader (President/Regional).
 */
function buildDynamicDivisionTree(divisionNodes, divisionName, rawNodes, collapsedNodeIds) {
    if (collapsedNodeIds === void 0) { collapsedNodeIds = new Set(); }
    var count = divisionNodes.length;
    var isDyson = divisionName.trim().toLowerCase().includes('dyson');
    var isSmall = count <= 5;
    var isMed = count <= 12;
    var CARD_W = isSmall ? 210 : (isMed ? 190 : 185);
    var CARD_H = isSmall ? 78 : (isMed ? 74 : 72);
    var H_GAP = isSmall ? 24 : (isMed ? 20 : 18);
    var V_GAP = isSmall ? 36 : 30;
    if (divisionNodes.length === 0) {
        return { nodes: [], canvasWidth: 1440, canvasHeight: 810 };
    }
    var divNodeIds = new Set(divisionNodes.map(function (n) { return n.id; }));
    // Connect orphan nodes whose reportsToId is outside but reportsToTitle matches a position inside this division
    var cleanedNodes = divisionNodes.map(function (n) {
        var repId = divNodeIds.has(n.reportsToId || '') ? n.reportsToId : undefined;
        if (!repId && n.reportsToTitle) {
            var matchByTitle = divisionNodes.find(function (m) { return m.id !== n.id && (m.title.trim().toLowerCase() === n.reportsToTitle.trim().toLowerCase() ||
                (n.reportsToTitle.toLowerCase().includes('operations manager') && m.title.toLowerCase().includes('sales & operations')) ||
                (n.reportsToTitle.toLowerCase().includes('operations manager') &&
                    m.title.toLowerCase().includes('operations') &&
                    !m.title.toLowerCase().includes('executive') &&
                    !m.title.toLowerCase().includes('sc '))); });
            if (matchByTitle)
                repId = matchByTitle.id;
        }
        return __assign(__assign({}, n), { reportsToId: repId });
    });
    var roots = cleanedNodes.filter(function (n) { return !n.reportsToId; });
    if (roots.length === 0) {
        roots = [cleanedNodes[0]];
    }
    // Count total descendants for any node (with cycle prevention)
    function countDescendants(nodeId, visited) {
        if (visited === void 0) { visited = new Set(); }
        if (visited.has(nodeId))
            return 0;
        visited.add(nodeId);
        var direct = cleanedNodes.filter(function (c) { return c.reportsToId === nodeId; });
        var total = direct.length;
        direct.forEach(function (c) {
            total += countDescendants(c.id, visited);
        });
        return total;
    }
    var placedNodeMap = new Map();
    // Recursively layout a subtree for a given node
    function layoutSubtree(node, startX, startY, isRoot) {
        if (isRoot === void 0) { isRoot = false; }
        var children = cleanedNodes.filter(function (c) { return c.reportsToId === node.id; });
        var hasChildren = children.length > 0;
        var isCollapsed = collapsedNodeIds.has(node.id);
        var totalDescendants = hasChildren ? countDescendants(node.id) : 0;
        if (!hasChildren || isCollapsed) {
            var placed = __assign(__assign({}, node), { x: startX, y: startY, width: CARD_W, height: CARD_H, hasChildren: hasChildren, isCollapsed: isCollapsed, collapsedCount: totalDescendants });
            placedNodeMap.set(node.id, placed);
            return { placedNodes: [placed], width: CARD_W, height: CARD_H };
        }
        // Helper to evaluate seniority / rank of a position (higher number = higher rank)
        var getSeniorityScore = function (c) {
            var t = (c.title || '').toLowerCase();
            var grade = parseInt(c.jobGrade || '0', 10);
            var score = 10;
            if (t.includes('general manager') || t.includes('director') || t.includes('head') || t.includes('gm'))
                score += 40;
            if (t.includes('manager') || t.includes('leader'))
                score += 25;
            if (t.includes('senior') || t.includes('lead') || t.includes('deputy') || t.includes('supervisor'))
                score += 15;
            if (grade >= 14)
                score += 10;
            else if (grade >= 12)
                score += 5;
            return score;
        };
        var branchChildren = children.filter(function (c) { return cleanedNodes.some(function (gc) { return gc.reportsToId === c.id; }); });
        var leafChildren = children.filter(function (c) { return cleanedNodes.every(function (gc) { return gc.reportsToId !== c.id; }); });
        // Sort by seniority descending so managers/seniors are placed on top rows
        branchChildren.sort(function (a, b) { return getSeniorityScore(b) - getSeniorityScore(a); });
        leafChildren.sort(function (a, b) { return getSeniorityScore(b) - getSeniorityScore(a); });
        // Case 1: Pure leaf subordinates under this manager (no sub-branches)
        if (branchChildren.length === 0) {
            // In division view, stack in 1 column (CARD_W) for sub-managers to prevent horizontal sprawl
            // Division root allowed up to 3 columns banner
            var colCount_1 = isRoot ? Math.min(leafChildren.length, 3) : 1;
            var rowCount = leafChildren.length;
            var gridWidth = colCount_1 * CARD_W + (colCount_1 - 1) * H_GAP;
            var totalWidth = Math.max(CARD_W, gridWidth);
            var parentX_1 = startX + Math.max(0, (totalWidth - CARD_W) / 2);
            var placedParent_1 = __assign(__assign({}, node), { x: parentX_1, y: startY, width: CARD_W, height: CARD_H, hasChildren: true, isCollapsed: false, collapsedCount: totalDescendants });
            placedNodeMap.set(node.id, placedParent_1);
            var placedLeaves_1 = [placedParent_1];
            leafChildren.forEach(function (child, idx) {
                var colIdx = idx % colCount_1;
                var rowIdx = Math.floor(idx / colCount_1);
                var childX = startX + colIdx * (CARD_W + H_GAP);
                var childY = startY + CARD_H + V_GAP + rowIdx * (CARD_H + 18);
                var placedChild = __assign(__assign({}, child), { x: childX, y: childY, width: CARD_W, height: CARD_H, hasChildren: false, isCollapsed: false, collapsedCount: 0 });
                placedNodeMap.set(child.id, placedChild);
                placedLeaves_1.push(placedChild);
            });
            var totalGridHeight = CARD_H + V_GAP + rowCount * (CARD_H + 18) - 18;
            return {
                placedNodes: placedLeaves_1,
                width: totalWidth,
                height: totalGridHeight
            };
        }
        // Case 2: Mixed or multi-branch hierarchy
        // Strict 6-7 column capping:
        // - Sub-departments under a department manager pack into at most 2 columns (excess stacked vertically).
        // - Leaf subordinates under any manager stack strictly in 1 column.
        // - At division root, small functions (<= 2 members, like KA, VM, Training) bundle into 1 column.
        var curX = startX;
        var childResults = [];
        var childY = startY + CARD_H + V_GAP;
        var effectiveBranches = __spreadArray([], branchChildren, true);
        if (isRoot && effectiveBranches.length > 5 && !isDyson) {
            var largeBranches_1 = [];
            var smallBranches_1 = [];
            effectiveBranches.forEach(function (b) {
                var desc = countDescendants(b.id);
                if (desc <= 2) {
                    smallBranches_1.push(b);
                }
                else {
                    largeBranches_1.push(b);
                }
            });
            if (smallBranches_1.length > 1) {
                largeBranches_1.forEach(function (child) {
                    var res = layoutSubtree(child, curX, childY, false);
                    childResults.push(res);
                    curX += res.width + H_GAP;
                });
                // Pack small branches vertically into 1 column
                var smallY_1 = childY;
                var smallPlaced_1 = [];
                var smallMaxW_1 = CARD_W;
                smallBranches_1.forEach(function (sb) {
                    var res = layoutSubtree(sb, curX, smallY_1, false);
                    smallPlaced_1.push.apply(smallPlaced_1, res.placedNodes);
                    if (res.width > smallMaxW_1)
                        smallMaxW_1 = res.width;
                    smallY_1 += res.height + V_GAP;
                });
                childResults.push({
                    placedNodes: smallPlaced_1,
                    width: smallMaxW_1,
                    height: smallY_1 - childY - V_GAP
                });
                curX += smallMaxW_1 + H_GAP;
            }
            else {
                effectiveBranches.forEach(function (child) {
                    var res = layoutSubtree(child, curX, childY, false);
                    childResults.push(res);
                    curX += res.width + H_GAP;
                });
            }
        }
        else if (!isRoot && branchChildren.length > 2) {
            // Non-root department manager (e.g. Ecommerce Manager) with > 2 sub-branches:
            // Pack into 2 columns: Col 1 has first branch, Col 2 has remaining branches stacked vertically
            var res1 = layoutSubtree(branchChildren[0], curX, childY, false);
            childResults.push(res1);
            curX += res1.width + H_GAP;
            var col2Y_1 = childY;
            var col2Placed_1 = [];
            var col2MaxW_1 = CARD_W;
            branchChildren.slice(1).forEach(function (b) {
                var resB = layoutSubtree(b, curX, col2Y_1, false);
                col2Placed_1.push.apply(col2Placed_1, resB.placedNodes);
                if (resB.width > col2MaxW_1)
                    col2MaxW_1 = resB.width;
                col2Y_1 += resB.height + V_GAP;
            });
            childResults.push({
                placedNodes: col2Placed_1,
                width: col2MaxW_1,
                height: col2Y_1 - childY - V_GAP
            });
            curX += col2MaxW_1 + H_GAP;
        }
        else {
            branchChildren.forEach(function (child) {
                var res = layoutSubtree(child, curX, childY, false);
                childResults.push(res);
                curX += res.width + H_GAP;
            });
        }
        // Leaf children under this manager (stack strictly in 1 column)
        if (leafChildren.length > 0) {
            var leafGridWidth = CARD_W;
            var leafGridHeight = leafChildren.length * (CARD_H + 18) - 18;
            var bundledLeaves_1 = [];
            leafChildren.forEach(function (child, idx) {
                var childX = curX;
                var childYPos = childY + idx * (CARD_H + 18);
                var placedChild = __assign(__assign({}, child), { x: childX, y: childYPos, width: CARD_W, height: CARD_H, hasChildren: false, isCollapsed: false, collapsedCount: 0 });
                placedNodeMap.set(child.id, placedChild);
                bundledLeaves_1.push(placedChild);
            });
            childResults.push({
                placedNodes: bundledLeaves_1,
                width: leafGridWidth,
                height: leafGridHeight
            });
            curX += leafGridWidth + H_GAP;
        }
        var totalChildrenWidth = curX - startX - H_GAP;
        var subtreeWidth = Math.max(CARD_W, totalChildrenWidth);
        var parentX = startX + Math.max(0, (subtreeWidth - CARD_W) / 2);
        var placedParent = __assign(__assign({}, node), { x: parentX, y: startY, width: CARD_W, height: CARD_H, hasChildren: true, isCollapsed: false, collapsedCount: totalDescendants });
        placedNodeMap.set(node.id, placedParent);
        var maxChildHeight = 0;
        childResults.forEach(function (cr) {
            if (cr.height > maxChildHeight)
                maxChildHeight = cr.height;
        });
        var allPlaced = [placedParent];
        childResults.forEach(function (cr) { return allPlaced.push.apply(allPlaced, cr.placedNodes); });
        return {
            placedNodes: allPlaced,
            width: subtreeWidth,
            height: CARD_H + V_GAP + maxChildHeight
        };
    }
    // Layout all root subtrees side-by-side
    var currentRootX = 40;
    var START_TREE_Y = 80;
    roots.forEach(function (root) {
        var res = layoutSubtree(root, currentRootX, START_TREE_Y, true);
        currentRootX += res.width + H_GAP * 2;
    });
    var allPlacedNodes = Array.from(placedNodeMap.values());
    // Compute exact bounding box of placed nodes
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    allPlacedNodes.forEach(function (n) {
        var w = n.width || CARD_W;
        var h = n.height || CARD_H;
        if (n.x !== undefined) {
            if (n.x < minX)
                minX = n.x;
            if (n.x + w > maxX)
                maxX = n.x + w;
        }
        if (n.y !== undefined) {
            if (n.y < minY)
                minY = n.y;
            if (n.y + h > maxY)
                maxY = n.y + h;
        }
    });
    var contentW = maxX - minX;
    var contentH = maxY - minY;
    // Standard 4:3 (3x4) Presentation slide target dimensions
    var minW = 880;
    var minH = 660;
    var reqW = contentW + 120;
    var reqH = contentH + 140;
    var targetW = Math.max(minW, reqW);
    var targetH = isDyson ? Math.max(minH, reqH) : Math.round(targetW * 0.75);
    if (!isDyson && targetH < reqH) {
        targetH = reqH;
        targetW = Math.round(targetH * (4 / 3)); // Width = Height * 4/3
    }
    // Auto-center horizontally
    var shiftX = Math.round((targetW - contentW) / 2) - minX;
    // Vertically position with generous top clearance (starts cleanly at >= 75px, never clipped)
    var targetTopMargin = Math.max(75, Math.min(100, Math.round((targetH - contentH) / 2)));
    var shiftY = targetTopMargin - minY;
    allPlacedNodes.forEach(function (n) {
        if (n.x !== undefined)
            n.x += shiftX;
        if (n.y !== undefined)
            n.y += shiftY;
    });
    // Guarantee canvasHeight encloses lowest node with comfortable clearance
    var shiftedMaxY = 0;
    allPlacedNodes.forEach(function (n) {
        var h = n.height || CARD_H;
        if (n.y !== undefined && n.y + h > shiftedMaxY)
            shiftedMaxY = n.y + h;
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
function buildDynamicN1Layout(rawNodes, virtualLeaders, customIndirectLinks) {
    if (customIndirectLinks === void 0) { customIndirectLinks = []; }
    var CARD_W = 185;
    var CARD_H = 76;
    var H_GAP = 18;
    var V_GAP = 28;
    var rawMap = new Map();
    rawNodes.forEach(function (n) { return rawMap.set(n.id, n); });
    // 1. Locate President / MD Node
    var presNode = rawNodes.find(function (n) {
        return n.title.toLowerCase().includes('president, crc sports') ||
            n.title.toLowerCase().includes('president') ||
            n.title.toLowerCase().includes('managing director');
    });
    var presId = presNode ? presNode.id : 'VN_BU_PRES';
    var presTitle = presNode ? presNode.title : 'BU President CBS VN';
    var presNick = (presNode === null || presNode === void 0 ? void 0 : presNode.nickname) || 'Andrew F.';
    // 2. Find Direct Reports to President
    var presReports = rawNodes.filter(function (n) { return n.reportsToId === presId || (n.reportsToTitle && n.reportsToTitle.toLowerCase().includes('president')); });
    // Classify into Brand Heads vs Supporting Functions Heads
    var BRAND_DIVISIONS = ['crocs', 'dyson', 'dyson viet nam', 'hoka', 'sports brands', 'supersports', 'matin kim', 'footwear'];
    var brandHeads = [];
    var supportHeads = [];
    presReports.forEach(function (node) {
        var divLower = (node.division || '').toLowerCase();
        var titleLower = node.title.toLowerCase();
        if (BRAND_DIVISIONS.some(function (b) { return divLower.includes(b); }) ||
            titleLower.includes('head of crocs') ||
            titleLower.includes('head of dyson') ||
            titleLower.includes('brand manager') ||
            titleLower.includes('head of supersports') ||
            titleLower.includes('head of sports')) {
            brandHeads.push(node);
        }
        else {
            supportHeads.push(node);
        }
    });
    // Ensure unique primary head per brand division
    var uniqueBrandHeads = [];
    var seenDivisions = new Set();
    brandHeads.forEach(function (head) {
        var divKey = (head.division || head.title).toLowerCase();
        if (!seenDivisions.has(divKey)) {
            seenDivisions.add(divKey);
            uniqueBrandHeads.push(head);
        }
    });
    // Find CS Leader (Gianna)
    var csLeader = rawNodes.find(function (n) {
        return n.title.toLowerCase().includes('customer service team leader') ||
            (n.nickname || '').toLowerCase() === 'gianna';
    });
    var positionedNodes = [];
    var indirectLinks = __spreadArray([], customIndirectLinks, true);
    var dividers = [];
    var notes = [];
    // 3. Layout Regional Leaders on the Left (x: 40 to 650)
    // CMG Branch
    var buCmg = virtualLeaders.find(function (vl) { return vl.code === 'THL_BU_PRES_CMG'; }) || {
        code: 'THL_BU_PRES_CMG',
        title: 'BU President CMG THL',
        nickname: 'Damien',
        flags: ['MY', 'TH', 'VN'],
        reportsToCode: '',
        divisionScope: 'CMG'
    };
    positionedNodes.push({
        id: buCmg.code,
        title: buCmg.title,
        nickname: buCmg.nickname,
        flags: buCmg.flags,
        status: 'active',
        isVirtual: true,
        x: 137,
        y: 40,
        width: CARD_W,
        height: CARD_H
    });
    // CRC Branch
    var buCrc = virtualLeaders.find(function (vl) { return vl.code === 'THL_BU_PRES_CRC'; }) || {
        code: 'THL_BU_PRES_CRC',
        title: 'BU President CRC Sports THL',
        nickname: 'Alex',
        flags: ['MY', 'TH', 'VN'],
        reportsToCode: '',
        divisionScope: 'CRC Sports'
    };
    positionedNodes.push({
        id: buCrc.code,
        title: buCrc.title,
        nickname: buCrc.nickname,
        flags: buCrc.flags,
        status: 'active',
        isVirtual: true,
        x: 527,
        y: 40,
        width: CARD_W,
        height: CARD_H
    });
    // Category Heads (y: 135)
    var catTech = virtualLeaders.find(function (vl) { return vl.code === 'THL_CAT_TECH_BEAUTY'; });
    if (catTech) {
        positionedNodes.push({
            id: catTech.code,
            title: catTech.title,
            nickname: catTech.nickname,
            flags: catTech.flags,
            status: 'active',
            isVirtual: true,
            reportsToId: buCmg.code,
            x: 40,
            y: 135,
            width: CARD_W,
            height: CARD_H
        });
    }
    var catFashion = virtualLeaders.find(function (vl) { return vl.code === 'THL_CAT_FASHION'; });
    if (catFashion) {
        positionedNodes.push({
            id: catFashion.code,
            title: catFashion.title,
            nickname: catFashion.nickname,
            flags: catFashion.flags,
            status: 'active',
            isVirtual: true,
            reportsToId: buCmg.code,
            x: 235,
            y: 135,
            width: CARD_W,
            height: CARD_H
        });
    }
    // Regional Brand Heads (y: 225)
    var regDyson = virtualLeaders.find(function (vl) { return vl.code === 'THL_REG_DYSON'; });
    if (regDyson) {
        positionedNodes.push({
            id: regDyson.code,
            title: regDyson.title,
            nickname: regDyson.nickname,
            flags: regDyson.flags,
            status: 'active',
            isVirtual: true,
            reportsToId: (catTech === null || catTech === void 0 ? void 0 : catTech.code) || buCmg.code,
            x: 40,
            y: 225,
            width: CARD_W,
            height: CARD_H
        });
    }
    var regFootwear = virtualLeaders.find(function (vl) { return vl.code === 'THL_REG_FOOTWEAR'; });
    if (regFootwear) {
        positionedNodes.push({
            id: regFootwear.code,
            title: regFootwear.title,
            nickname: regFootwear.nickname,
            flags: regFootwear.flags,
            status: 'active',
            isVirtual: true,
            reportsToId: (catFashion === null || catFashion === void 0 ? void 0 : catFashion.code) || buCmg.code,
            x: 235,
            y: 225,
            width: CARD_W,
            height: CARD_H
        });
    }
    var regSportsDl = virtualLeaders.find(function (vl) { return vl.code === 'THL_REG_SPORTS_DL'; });
    if (regSportsDl) {
        positionedNodes.push({
            id: regSportsDl.code,
            title: regSportsDl.title,
            nickname: regSportsDl.nickname,
            flags: regSportsDl.flags,
            status: 'active',
            isVirtual: true,
            reportsToId: buCrc.code,
            x: 430,
            y: 135,
            width: CARD_W,
            height: CARD_H
        });
    }
    var regHoka = virtualLeaders.find(function (vl) { return vl.code === 'THL_REG_HOKA'; });
    if (regHoka) {
        positionedNodes.push({
            id: regHoka.code,
            title: regHoka.title,
            nickname: regHoka.nickname,
            flags: regHoka.flags,
            status: 'active',
            isVirtual: true,
            reportsToId: buCrc.code,
            x: 625,
            y: 135,
            width: CARD_W,
            height: CARD_H
        });
    }
    // 4. Layout VN President (MD) at top right of regional tree
    var presX = 920;
    var presY = 40;
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
    // Link President to Group Regional Leaders (Dotted indirect line)
    indirectLinks.push({
        id: 'ind_pres_cmg',
        fromId: buCmg.code,
        toId: presId,
        label: ''
    });
    indirectLinks.push({
        id: 'ind_pres_crc',
        fromId: buCrc.code,
        toId: presId,
        label: ''
    });
    // 5. Layout Direct Reporting Brand Heads under President & Regional Leaders (Left side, starting at y: 320)
    // Per requirement: keep only CEO direct N-1 Heads (no sub-managers/staff)
    var currentBrandX = 40;
    var brandStartY = 320;
    uniqueBrandHeads.forEach(function (head) {
        positionedNodes.push(__assign(__assign({}, head), { x: currentBrandX, y: brandStartY, width: CARD_W, height: CARD_H, reportsToId: presId, hasChildren: false, isCollapsed: false }));
        currentBrandX += CARD_W + H_GAP;
    });
    // Vertical Divider separating Brand Organization and Supporting Functions
    var dividerX = Math.max(currentBrandX + 15, 700);
    dividers.push({
        id: 'div_brand_support',
        type: 'vertical',
        position: dividerX,
        labelLeft: 'Khối Kinh Doanh (Brand Organization)',
        labelRight: 'Khối Chức Năng Hỗ Trợ (Supporting Functions)'
    });
    // 6. Layout Supporting Functions:
    // Per user requirement: keep only direct N-1 of CEO (Heads) + CS Leader (Gianna) + Group Support.
    // No other individual employees!
    var coeMkt = rawNodes.find(function (n) { return n.title.toLowerCase().includes('senior marketing manager'); }) || supportHeads.find(function (n) { return n.title.toLowerCase().includes('marketing'); });
    var coeOnline = rawNodes.find(function (n) { return n.title.toLowerCase().includes('head of online') || n.title.toLowerCase().includes('ecommerce manager'); });
    var coeOps = rawNodes.find(function (n) { return n.title.toLowerCase().includes('head of operations'); });
    var coePlanning = rawNodes.find(function (n) { return n.title.toLowerCase().includes('head of planning'); });
    var coeWholesale = rawNodes.find(function (n) { return n.title.toLowerCase().includes('wholesale manager'); });
    var coeBusDev = rawNodes.find(function (n) { return n.title.toLowerCase().includes('business development manager'); });
    var coeDC = rawNodes.find(function (n) { return n.title.toLowerCase().includes('senior project division manager') || n.title.toLowerCase().includes('project'); });
    var coeExpansion = rawNodes.find(function (n) { return n.title.toLowerCase().includes('store expansion') || n.title.toLowerCase().includes('leasing'); });
    var coeCols = [
        [coeMkt, coeOnline, coeOps],
        [coePlanning, coeWholesale, csLeader],
        [coeBusDev, coeDC, coeExpansion]
    ];
    var currentSupportX = dividerX + 35;
    var supportStartY = 160;
    coeCols.forEach(function (col) {
        col.forEach(function (node, rIdx) {
            if (!node)
                return;
            positionedNodes.push(__assign(__assign({}, node), { x: currentSupportX, y: supportStartY + rIdx * (CARD_H + 20), width: CARD_W, height: CARD_H, reportsToId: node.id === (csLeader === null || csLeader === void 0 ? void 0 : csLeader.id) ? (coeMkt ? coeMkt.id : presId) : presId, hasChildren: false, isCollapsed: false }));
        });
        currentSupportX += CARD_W + H_GAP;
    });
    // Group Support (HR Head, Business Controller, IT Head, SCM Head, Legal Head)
    var hrHead = rawNodes.find(function (n) { return n.title.toLowerCase().includes('gm human resources') || n.title.toLowerCase().includes('hr head'); });
    var busController = rawNodes.find(function (n) { return n.title.toLowerCase().includes('business controller'); });
    var groupCol1 = [hrHead, busController];
    var groupCol2 = [
        { id: 'grp_it_head', title: 'IT Head', nickname: 'Luan', isVirtual: true, status: 'active' },
        { id: 'grp_scm_head', title: 'SCM Head', nickname: 'Oanh', isVirtual: true, status: 'active' },
        { id: 'grp_legal_head', title: 'Legal Head', nickname: 'Duong', isVirtual: true, status: 'active' }
    ];
    var currentGroupX = currentSupportX + 25;
    [groupCol1, groupCol2].forEach(function (col) {
        col.forEach(function (node, rIdx) {
            if (!node)
                return;
            positionedNodes.push(__assign(__assign({}, node), { x: currentGroupX, y: supportStartY + rIdx * (CARD_H + 20), width: CARD_W, height: CARD_H, reportsToId: presId, hasChildren: false, isCollapsed: false }));
        });
        currentGroupX += CARD_W + H_GAP;
    });
    // Calculate dynamic canvas dimensions with 4:3 (3x4) aspect ratio
    var maxOccupiedX = Math.max(currentBrandX, currentSupportX, currentGroupX) + 60;
    var maxOccupiedY = Math.max.apply(Math, positionedNodes.map(function (n) { return (n.y || 0) + (n.height || CARD_H); })) + 60;
    // Enforce 4:3 standard slide canvas bounding box
    var minSlideW = 1200;
    var minSlideH = 900;
    var n1CanvasWidth = Math.max(minSlideW, maxOccupiedX);
    var n1CanvasHeight = Math.max(minSlideH, Math.round(n1CanvasWidth * (3 / 4)));
    if (n1CanvasHeight < maxOccupiedY) {
        n1CanvasHeight = maxOccupiedY;
        n1CanvasWidth = Math.round(n1CanvasHeight * (4 / 3));
    }
    // Visual recentering: Align entire diagram toward top-center of slide with comfortable 60px margin
    var minNodeY = Math.min.apply(Math, positionedNodes.map(function (n) { return n.y || 0; }));
    var shiftY = 60 - minNodeY;
    positionedNodes.forEach(function (n) {
        if (n.y !== undefined)
            n.y += shiftY;
    });
    var shiftedN1MaxY = 0;
    positionedNodes.forEach(function (n) {
        var h = n.height || CARD_H;
        if (n.y !== undefined && n.y + h > shiftedN1MaxY)
            shiftedN1MaxY = n.y + h;
    });
    if (n1CanvasHeight < shiftedN1MaxY + 70) {
        n1CanvasHeight = shiftedN1MaxY + 70;
        n1CanvasWidth = Math.round(n1CanvasHeight * (4 / 3));
    }
    return {
        nodes: positionedNodes,
        indirectLinks: indirectLinks,
        dividers: dividers,
        notes: notes,
        canvasWidth: n1CanvasWidth,
        canvasHeight: n1CanvasHeight,
        summary: calculateHeadcountSummary(positionedNodes, false)
    };
}
/**
 * Builds the layout for each View dynamically
 */
function buildOrgLayout(template, rawNodes, virtualLeaders, customIndirectLinks, selectedDivision, collapsedNodeIds) {
    if (customIndirectLinks === void 0) { customIndirectLinks = []; }
    if (collapsedNodeIds === void 0) { collapsedNodeIds = new Set(); }
    if (template === 'company_n1') {
        return buildDynamicN1Layout(rawNodes, virtualLeaders, customIndirectLinks);
    }
    // Division View (dynamically resolves target division)
    var targetDivision = selectedDivision || 'Crocs';
    if (template === 'brand_footwear')
        targetDivision = 'Crocs';
    else if (template === 'brand_dyson')
        targetDivision = 'Dyson Viet Nam';
    else if (template === 'brand_hoka')
        targetDivision = 'HOKA';
    else if (template === 'hr_shared')
        targetDivision = 'Human Resources';
    var divisionNodes = rawNodes.filter(function (n) { return (n.division || '').trim().toLowerCase() === targetDivision.trim().toLowerCase(); });
    var tree = buildDynamicDivisionTree(divisionNodes, targetDivision, rawNodes, collapsedNodeIds);
    var summary = calculateHeadcountSummary(divisionNodes, true, targetDivision);
    return {
        nodes: tree.nodes,
        indirectLinks: customIndirectLinks.filter(function (l) {
            return tree.nodes.some(function (n) { return n.id === l.fromId; }) && tree.nodes.some(function (n) { return n.id === l.toId; });
        }),
        dividers: [],
        notes: [],
        canvasWidth: tree.canvasWidth,
        canvasHeight: tree.canvasHeight,
        summary: summary
    };
}
/**
 * Calculates diff delta between Current Org Chart and Proposal Org Chart
 */
function calculateOrgDiff(currentNodes, proposalNodes) {
    var curMap = new Map(currentNodes.map(function (n) { return [n.id, n]; }));
    var propMap = new Map(proposalNodes.map(function (n) { return [n.id, n]; }));
    var changes = [];
    // 1. Detect New Hires & Proposals
    proposalNodes.forEach(function (node) {
        if (node.isVirtual || node.isSupervisor)
            return;
        var cur = curMap.get(node.id);
        var isNew = !cur || node.status === 'new_hire' || (node.customLabel && node.customLabel.includes('New Hire'));
        var isRep = node.status === 'replace' || (node.customLabel && node.customLabel.includes('Replace'));
        if (isNew) {
            changes.push({
                id: "diff_new_".concat(node.id),
                type: 'new_hire',
                nodeId: node.id,
                nodeTitle: node.title,
                division: node.division || 'Head Office',
                dept: node.dept,
                newValue: node.title,
                description: "Tuy\u1EC3n m\u1EDBi (New Hire BP): ".concat(node.title, " - B\u00E1o c\u00E1o cho: ").concat(node.reportsToTitle || node.reportsToId || 'Chưa gán')
            });
        }
        else if (isRep) {
            changes.push({
                id: "diff_rep_".concat(node.id),
                type: 'replace',
                nodeId: node.id,
                nodeTitle: node.title,
                division: node.division || 'Head Office',
                dept: node.dept,
                newValue: node.title,
                description: "Thay th\u1EBF nh\u00E2n s\u1EF1 (Replace): ".concat(node.title)
            });
        }
        else if (cur) {
            // Check reporting line change
            if ((node.reportsToId || '') !== (cur.reportsToId || '')) {
                changes.push({
                    id: "diff_reassign_".concat(node.id),
                    type: 'reassigned',
                    nodeId: node.id,
                    nodeTitle: node.title,
                    division: node.division || 'Head Office',
                    dept: node.dept,
                    oldValue: cur.reportsToTitle || cur.reportsToId || 'Root',
                    newValue: node.reportsToTitle || node.reportsToId || 'Root',
                    description: "\u0110i\u1EC1u chuy\u1EC3n b\u00E1o c\u00E1o: t\u1EEB [".concat(cur.reportsToTitle || cur.reportsToId || 'Root', "] \u2794 [").concat(node.reportsToTitle || node.reportsToId || 'Root', "]")
                });
            }
            // Check title change
            if (node.title.trim().toLowerCase() !== cur.title.trim().toLowerCase()) {
                changes.push({
                    id: "diff_title_".concat(node.id),
                    type: 'title_modified',
                    nodeId: node.id,
                    nodeTitle: node.title,
                    division: node.division || 'Head Office',
                    dept: node.dept,
                    oldValue: cur.title,
                    newValue: node.title,
                    description: "\u0110i\u1EC1u ch\u1EC9nh ch\u1EE9c danh: t\u1EEB \"".concat(cur.title, "\" \u2794 \"").concat(node.title, "\"")
                });
            }
        }
    });
    // 2. Detect Removed Positions
    currentNodes.forEach(function (node) {
        if (node.isVirtual || node.isSupervisor)
            return;
        if (!propMap.has(node.id)) {
            changes.push({
                id: "diff_del_".concat(node.id),
                type: 'removed',
                nodeId: node.id,
                nodeTitle: node.title,
                division: node.division || 'Head Office',
                dept: node.dept,
                oldValue: node.title,
                description: "B\u00E3i b\u1ECF v\u1ECB tr\u00ED: ".concat(node.title, " (").concat(node.division || 'HO', ")")
            });
        }
    });
    return changes;
}
