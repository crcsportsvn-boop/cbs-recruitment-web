import * as XLSX from 'xlsx';
import { OrgNode, VirtualLeader, IndirectLink, NodeFlag, NodeStatus } from '@/types/org-chart';
import { DEFAULT_VIRTUAL_LEADERS, DEFAULT_INDIRECT_LINKS } from './default-config';

export interface ParsedOrgData {
  nodes: OrgNode[];
  virtualLeaders: VirtualLeader[];
  indirectLinks: IndirectLink[];
  divisions: string[];
  totalRawRows: number;
  officeRows: number;
}

/**
 * Flexible field value extractor that normalises keys (handles \r\n, spaces, casing, underscores, dots)
 */
export function getRowValue(row: any, ...fieldPatterns: string[]): string {
  if (!row) return '';
  const keys = Object.keys(row);
  for (const pattern of fieldPatterns) {
    const cleanPattern = pattern.toLowerCase().replace(/[\s\r\n_\/\.\-]/g, '');
    const foundKey = keys.find(k => k.toLowerCase().replace(/[\s\r\n_\/\.\-]/g, '').includes(cleanPattern));
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return String(row[foundKey]).trim();
    }
  }
  return '';
}

/**
 * Extracts flag array from text (e.g. '🇲🇾 🇹🇭 🇻🇳' -> ['MY', 'TH', 'VN'])
 */
export function parseFlagsFromText(text: string): NodeFlag[] {
  if (!text) return ['VN'];
  const flags: NodeFlag[] = [];
  if (text.includes('🇲🇾') || text.toUpperCase().includes('MY')) flags.push('MY');
  if (text.includes('🇹🇭') || text.toUpperCase().includes('TH')) flags.push('TH');
  if (text.includes('🇻🇳') || text.toUpperCase().includes('VN')) {
    flags.push(text.includes('⭐️') || text.includes('star') || text.includes('*') ? 'VN_STAR' : 'VN');
  }
  if (flags.length === 0) {
    flags.push('VN');
  }
  return flags;
}

/**
 * Extracts a 4-digit calendar year from various date string formats, Date objects, or Excel serial numbers.
 * Dynamically supports any year format (e.g. 2026-12-31, 31/12/2026, 12/31/26, 46387).
 */
export function extractYearFromDate(dateVal: any): number | null {
  if (dateVal === null || dateVal === undefined) return null;

  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    return dateVal.getFullYear();
  }

  const str = String(dateVal).trim();
  if (!str || str.toLowerCase() === 'none' || str.toLowerCase() === 'null') return null;

  // 1. Match 4-digit year directly (e.g. 2026-12-31, 31/12/2026, 2026)
  const match4 = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (match4 && match4[1]) {
    return parseInt(match4[1], 10);
  }

  // 2. Match 2-digit year at end of date (e.g. "31/12/26", "12/31/26", "31-Dec-26")
  const match2 = str.match(/[\/\-\.](\d{2})(?:\s|$)/);
  if (match2 && match2[1]) {
    const yr2 = parseInt(match2[1], 10);
    return 2000 + yr2;
  }

  // 3. Fallback to Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const yr = parsed.getFullYear();
    if (yr >= 1990 && yr <= 2100) return yr;
  }

  // 4. Excel numeric serial date (e.g. ~46000 for 2026)
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 70000) {
    const excelDate = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(excelDate.getTime())) {
      return excelDate.getFullYear();
    }
  }

  return null;
}

/**
 * Derives display nickname with fallback logic:
 * 1. Explicit Nickname column value
 * 2. If 'Vacant' in full name -> 'Vacant'
 * 3. Last word of Vietnamese full name (e.g. 'Cao Thị Hồng Vân' -> 'Vân')
 */
export function deriveNickname(fullName: string = '', nickName: string = ''): string {
  const trimmedNick = (nickName || '').trim();
  if (trimmedNick && trimmedNick !== 'None') return trimmedNick;

  const trimmedFull = (fullName || '').trim();
  if (!trimmedFull || trimmedFull.toLowerCase().includes('vacant') || trimmedFull === 'None') {
    return 'Vacant';
  }

  const parts = trimmedFull.split(/\s+/);
  return parts[parts.length - 1] || trimmedFull;
}

/**
 * Resolves a raw label or text from Org_Config into a valid Node ID or Virtual Leader Code
 */
export function resolveNodeIdentifier(
  rawText: string,
  nodes: OrgNode[],
  virtualLeaders: VirtualLeader[]
): string {
  if (!rawText) return '';
  const clean = rawText.replace(/[\u00a0\r\n\t]/g, ' ').trim();

  // 1. Direct match with Leader Code
  const matchedLeader = virtualLeaders.find(
    vl => vl.code.toLowerCase() === clean.toLowerCase() || clean.toLowerCase().startsWith(vl.code.toLowerCase())
  );
  if (matchedLeader) return matchedLeader.code;

  // 2. Direct match with Position ID
  const matchedById = nodes.find(n => n.id.toLowerCase() === clean.toLowerCase());
  if (matchedById) return matchedById.id;

  // 3. Match with Leader Code substring (e.g., "THL_CAT_FASHION (K Joyce)" -> "THL_CAT_FASHION")
  const codeMatch = clean.match(/\b(THL_[A-Z0-9_]+|VN_[A-Z0-9_]+|CRV_[A-Z0-9_]+|SHO-[A-Z0-9\-]+)\b/i);
  if (codeMatch && codeMatch[1]) {
    const code = codeMatch[1].toUpperCase();
    const leader = virtualLeaders.find(vl => vl.code.toUpperCase() === code);
    if (leader) return leader.code;
    const node = nodes.find(n => n.id.toUpperCase() === code);
    if (node) return node.id;
  }

  // 4. Match with Title (e.g. "Head of Crocs (Nikki)" -> "Head of Crocs")
  const titlePart = clean.replace(/\(.*?\)/g, '').trim().toLowerCase();
  if (titlePart) {
    const matchedByTitle = nodes.find(
      n => n.title.toLowerCase().includes(titlePart) || titlePart.includes(n.title.toLowerCase())
    );
    if (matchedByTitle) return matchedByTitle.id;
  }

  // 5. Match with Nickname (e.g. "Nikki", "Andy", "Liam", "Van", "April")
  const nickPartMatch = clean.match(/\((.*?)\)/);
  const nickName = nickPartMatch ? nickPartMatch[1]?.trim().toLowerCase() : clean.toLowerCase();
  if (nickName) {
    const matchedByNick = nodes.find(n => (n.nickname || '').toLowerCase() === nickName);
    if (matchedByNick) return matchedByNick.id;
  }

  return clean;
}

/**
 * Parses uploaded Excel workbook ArrayBuffer
 */
export function parseOrgChartWorkbook(buffer: ArrayBuffer): ParsedOrgData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  // 1. Locate Raw Data Sheet
  const rawSheetName =
    sheetNames.find(s => s.toLowerCase().replace(/[\s_-]/g, '') === 'orgchartraw') ||
    sheetNames.find(s => s.toLowerCase().includes('raw')) ||
    sheetNames.find(s => s.toLowerCase().includes('chart') && !s.toLowerCase().includes('check')) ||
    sheetNames[0];

  const rawSheet = rawSheetName ? workbook.Sheets[rawSheetName] : null;
  const rawJson: any[] = rawSheet ? XLSX.utils.sheet_to_json(rawSheet, { defval: '', raw: false }) : [];

  // 2. Process Raw Data -> Filter 'Office' only
  interface ParsedItem {
    node: OrgNode;
    effectiveEndDate: string;
    notePositionId: string;
  }

  const rawItems: ParsedItem[] = [];
  const divisionSet = new Set<string>();
  let officeCount = 0;

  for (const row of rawJson) {
    const group = getRowValue(row, 'group', 'office/stores', 'location');
    const isOffice = group.toLowerCase() === 'office';

    if (isOffice) {
      officeCount++;
      const posId = getRowValue(row, 'positionid', 'posid', 'position id');
      if (!posId) continue;

      const title = getRowValue(row, 'positionname', 'position name');
      const division = getRowValue(row, 'division');
      const dept = getRowValue(row, 'dept', 'department');
      const subDept = getRowValue(row, 'subdept', 'sub dept');
      const jobGrade = getRowValue(row, 'jobgrade', 'job grade');
      const reportsToId = getRowValue(row, 'reportstopositionid', 'reports to position id', 'reportsto');
      const reportsToTitle = getRowValue(row, 'reporttopositionname', 'report to position name');
      const fullName = getRowValue(row, 'master_data.fullname', 'fullname', 'full name');
      const nickNameCol = getRowValue(row, 'master_data.nickname', 'nickname', 'nick name');

      const effectiveEndDate = getRowValue(
        row,
        'effectiveenddate',
        'effective end date',
        'enddate',
        'end date',
        'effectivedate',
        'effective date',
        'planenddate',
        'plan end date',
        'closingdate',
        'closedate',
        'ngayketthuc',
        'ngayhethan'
      );
      const notePositionId = getRowValue(row, 'notepositionid', 'note position id', 'noteposid', 'note position', 'note pos id');

      const nickname = deriveNickname(fullName, nickNameCol);
      const isVacant = !fullName || fullName.toLowerCase().includes('vacant');

      let status: NodeStatus = isVacant ? 'vacant' : 'active';
      if (title.toLowerCase().includes('replace') || title.toLowerCase().includes('(replace)')) {
        status = 'replace';
      }

      if (division) divisionSet.add(division);

      // Determine flag
      let flags: NodeFlag[] = ['VN'];
      const titleLower = title.toLowerCase();
      if (titleLower.includes('president') || titleLower.includes('gm human resources') || titleLower.includes('director')) {
        flags = ['VN_STAR'];
      }

      rawItems.push({
        node: {
          id: posId,
          title: title,
          division: division,
          dept: dept || division,
          subDept: subDept,
          jobGrade: jobGrade,
          reportsToId: reportsToId,
          reportsToTitle: reportsToTitle,
          holderName: fullName,
          nickname: nickname,
          flags: flags,
          status: status,
          effectiveEndDate: effectiveEndDate || undefined,
          notePositionId: notePositionId || undefined
        },
        effectiveEndDate,
        notePositionId
      });
    }
  }

  // Dynamic current calendar year using year(today) - never hardcoded!
  const currentYear = new Date().getFullYear();

  const nodeMap = new Map<string, OrgNode>();
  rawItems.forEach(item => nodeMap.set(item.node.id.toLowerCase().trim(), item.node));

  // Pass 1: Optimize seats based on Effective End Date & Note Position ID (replacement / transfer)
  // If an old seat has both fields and matches a target seat (Note Position ID),
  // transfer holderName + nickname to the new seat, hide the old seat, and re-link its direct reports.
  rawItems.forEach(item => {
    if (item.effectiveEndDate && item.notePositionId) {
      const targetId = item.notePositionId.toLowerCase().trim();
      const targetNode = nodeMap.get(targetId);
      if (targetNode) {
        if (item.node.holderName && !item.node.holderName.toLowerCase().includes('vacant')) {
          targetNode.holderName = item.node.holderName;
          targetNode.nickname = item.node.nickname || targetNode.nickname;
          targetNode.status = 'active';
        }
        item.node.isHidden = true;

        // Reassign subordinate seats to the new seat
        rawItems.forEach(other => {
          if (other.node.reportsToId && other.node.reportsToId.toLowerCase().trim() === item.node.id.toLowerCase().trim()) {
            other.node.reportsToId = targetNode.id;
            other.node.reportsToTitle = targetNode.title;
          }
        });
      }
    }
  });

  // Pass 2: Filter out seats scheduled for closure in the current year (rule-based planned closure)
  // If a seat's Effective End Date has a year equal to the current year (year(today)), remove the seat.
  // Direct reports of the closing seat are automatically re-routed to its manager to keep the hierarchy unbroken.
  rawItems.forEach(item => {
    if (item.node.isHidden) return; // already transferred/hidden

    if (item.effectiveEndDate) {
      const endYear = extractYearFromDate(item.effectiveEndDate);
      if (endYear !== null && (endYear === currentYear || endYear <= currentYear)) {
        item.node.isHidden = true;

        // Reassign subordinate seats to the manager of this closing seat
        const parentReportsToId = item.node.reportsToId;
        const parentReportsToTitle = item.node.reportsToTitle;
        rawItems.forEach(other => {
          if (other.node.reportsToId && other.node.reportsToId.toLowerCase().trim() === item.node.id.toLowerCase().trim()) {
            other.node.reportsToId = parentReportsToId;
            other.node.reportsToTitle = parentReportsToTitle;
          }
        });
      }
    }
  });

  const nodes: OrgNode[] = rawItems.filter(item => !item.node.isHidden).map(item => item.node);

  let virtualLeaders: VirtualLeader[] = [...DEFAULT_VIRTUAL_LEADERS];
  let indirectLinks: IndirectLink[] = [...DEFAULT_INDIRECT_LINKS];

  // 3. Check for Config / Org_Config sheet
  const configSheetName = sheetNames.find(s => {
    const clean = s.toLowerCase().replace(/[\s_-]/g, '');
    return clean === 'orgconfig' || clean === 'config' || clean.includes('config');
  });

  if (configSheetName && workbook.Sheets[configSheetName]) {
    const configSheet = workbook.Sheets[configSheetName];
    const configJson: any[] = XLSX.utils.sheet_to_json(configSheet, { header: 1, defval: '', raw: false });

    const customLeaders: VirtualLeader[] = [];
    const customIndirect: IndirectLink[] = [];

    for (let i = 1; i < configJson.length; i++) {
      const row = configJson[i];
      if (!row || row.length === 0) continue;

      // Table 1: Leader Code (0), Title (1), Name (2), Flag (3), Reports To (4), Scope (5)
      const leaderCode = String(row[0] || '').trim();
      const title = String(row[1] || '').trim();
      const name = String(row[2] || '').trim();
      const flagText = String(row[3] || '').trim();
      const reportsTo = String(row[4] || '').trim();
      const scope = String(row[5] || '').trim();

      if (leaderCode && title && !leaderCode.toLowerCase().includes('leader code')) {
        customLeaders.push({
          code: leaderCode,
          title: title,
          nickname: name,
          flags: parseFlagsFromText(flagText),
          reportsToCode: reportsTo.includes('(Root)') ? '' : reportsTo,
          divisionScope: scope
        });
      }

      // Table 2: Node Nguồn (9), Node Đích (10), Loại liên kết (11)
      const rawFrom = String(row[9] || '').trim();
      const rawTo = String(row[10] || '').trim();
      const linkType = String(row[11] || '').trim();

      if (rawFrom && rawTo && !rawFrom.toLowerCase().includes('node')) {
        const resolvedFrom = resolveNodeIdentifier(rawFrom, nodes, customLeaders.length > 0 ? customLeaders : virtualLeaders);
        const resolvedTo = resolveNodeIdentifier(rawTo, nodes, customLeaders.length > 0 ? customLeaders : virtualLeaders);

        if (resolvedFrom && resolvedTo) {
          customIndirect.push({
            id: `ind_cfg_${i}`,
            fromId: resolvedFrom,
            toId: resolvedTo,
            label: linkType || 'Indirect Report',
            style: 'dashed'
          });
        }
      }
    }

    if (customLeaders.length > 0) virtualLeaders = customLeaders;
    if (customIndirect.length > 0) indirectLinks = customIndirect;
  }

  const divisionsList = Array.from(divisionSet).sort();

  return {
    nodes,
    virtualLeaders,
    indirectLinks,
    divisions: divisionsList,
    totalRawRows: rawJson.length,
    officeRows: nodes.length
  };
}
