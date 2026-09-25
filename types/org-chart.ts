export type NodeFlag = 'VN' | 'TH' | 'MY' | 'TH_VN' | 'MY_TH_VN' | 'VN_STAR' | 'NONE';

export type NodeStatus = 'active' | 'vacant' | 'new_hire' | 'replace' | 'highlight';

export type DensityMode = 'full' | 'position_only' | 'compact';

export type ViewTemplate = 
  | 'company_n1'      // C-Suite / Organization N-1 (Andrew Org Chart)
  | 'brand_footwear'  // Footwear (Crocs, Havaianas, Reef)
  | 'brand_dyson'     // Dyson
  | 'brand_hoka'      // Hoka
  | 'hr_shared'       // HR - CRV Shared Service
  | 'custom_division' // Any other division selected dynamically
  | 'custom_canvas';  // Blank canvas for custom proposal

export interface OrgNode {
  id: string;                    // Position ID or Virtual ID
  title: string;                 // Position Name (e.g. "Brand Manager")
  holderName?: string;           // Legal Full Name
  nickname?: string;             // Display Nickname (e.g. "Liam", "Nikki", "Thảo")
  division?: string;             // e.g. "Crocs", "Dyson Viet Nam", "HOKA"
  dept?: string;                 // e.g. "Ecommerce", "Marketing", "Operations"
  subDept?: string;              // e.g. "Website", "Marketplace", "Digital MKT"
  jobGrade?: string;
  reportsToId?: string;          // Direct reporting manager Position ID
  reportsToTitle?: string;
  flags: NodeFlag[];             // Nationality/Location flags
  status: NodeStatus;            // 'active' | 'vacant' | 'new_hire' | 'replace' | 'highlight'
  customLabel?: string;          // Optional custom tag (e.g. "New Hire BP", "New Hire 2027")
  isVirtual?: boolean;           // true if Regional THL / Expat node
  groupType?: 'Office' | 'Stores' | 'Intern';
  x?: number;                    // Canvas coordinates for drag & drop
  y?: number;
  width?: number;
  height?: number;
  highlightColor?: string;       // Custom highlight (e.g. Yellow for Havaianas)
  isDirectReport?: boolean;
  hasChildren?: boolean;         // Node has subordinate seats
  isCollapsed?: boolean;         // Subtree is currently collapsed
  collapsedCount?: number;       // Total hidden descendant seats
  isSupervisor?: boolean;        // true if external supervisor node shown for context
}

export interface IndirectLink {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  style?: 'dashed' | 'dotted' | 'solid';
  color?: string;
}

export interface VirtualLeader {
  code: string;
  title: string;
  nickname: string;
  flags: NodeFlag[];
  reportsToCode: string;
  divisionScope: string;
}

export interface CustomDivider {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number;              // X coordinate if vertical, Y if horizontal
  labelLeft?: string;            // e.g. "Brand Organization"
  labelRight?: string;           // e.g. "Supporting Functions organization"
}

export interface CustomNote {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  isBox?: boolean;
  color?: string;
}

export interface HeadcountSummary {
  totalSeats: number;
  occupied: number;
  vacant: number;
  newHireBP: number;
  replacement: number;
  plannedTotal: number;
}

export interface OrgProposalState {
  template: ViewTemplate;
  selectedDivision?: string;
  nodes: OrgNode[];
  indirectLinks: IndirectLink[];
  dividers: CustomDivider[];
  notes: CustomNote[];
  densityMode: DensityMode;
  showNicknames: boolean;
  showSumUpTable: boolean;
  showSharedSidebar: boolean;
  zoomLevel: number;
  activeMode?: OrgChartMode;
  justificationRows?: ProposalJustificationRow[];
}

export type OrgChartMode = 'current' | 'proposal' | 'diff';

export interface ProposalChange {
  id: string;
  type: 'new_hire' | 'replace' | 'removed' | 'reassigned' | 'title_modified';
  nodeId: string;
  nodeTitle: string;
  division: string;
  dept?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

export interface ProposalJustificationRow {
  id: string;
  positionId: string;
  title: string;
  division: string;
  changeType: 'new_hire' | 'replace' | 'reassigned' | 'restructure' | 'other';
  justification: string;
  timeline: string;
  jobGrade?: string;
  budgetImpact?: string;
}
