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
  const nodes: OrgNode[] = [];
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

      nodes.push({
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
        status: status
      });
    }
  }

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
    officeRows: officeCount
  };
}
