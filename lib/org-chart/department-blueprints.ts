import { OrgNode, VirtualLeader, IndirectLink, CustomDivider, NodeFlag, NodeStatus } from '@/types/org-chart';

export interface Headcount3YRow {
  year: string;
  b2026: number | string;
  e2026: number | string;
  y2027: number | string;
  y2028: number | string;
  y2029: number | string;
  detail?: string;
}

export interface SlideContainerBox {
  id: string;
  title?: string;
  subtitle?: string;
  footerTitle?: string;
  footerSubtitle?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderStyle?: 'solid' | 'dashed' | 'subtle';
  subHeaders?: { text: string; x: number; y: number; width?: number }[];
}

export interface PillarPill {
  id: string;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isSubPill?: boolean;
  isUnderline?: boolean;
}

export interface BlueprintCard {
  id: string;
  title: string;
  nickname: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  status?: NodeStatus;
  customLabel?: string;
  flags?: NodeFlag[];
  reportsToId?: string;
  division?: string;
  dept?: string;
  subDept?: string;
}

export interface DepartmentBlueprint {
  key: string;
  divisionNames: string[];
  slideTitle: string;
  headcount3Y: Headcount3YRow[];
  leaders: BlueprintCard[];
  pillarPills: PillarPill[];
  cards: BlueprintCard[];
  indirectLinks: IndirectLink[];
  hasCRVShared?: boolean;
  containerBoxes?: SlideContainerBox[];
  canvasWidth?: number;
  canvasHeight?: number;
}

export const CBS_VN_SHARED_SERVICES = [
  'Wholesale',
  'Customer Service',
  'Store Expansion',
  'D&C',
  'Planning - Database',
  'Executive Team',
  'Operations',
  'Finance',
  'HR'
];

export const CRV_SHARED_SERVICES = [
  'Legal',
  'IT',
  'SCM'
];

export const DEPARTMENT_BLUEPRINTS: Record<string, DepartmentBlueprint> = {
  // 1. BRAND - HOKA (Page 2)
  hoka: {
    key: 'hoka',
    divisionNames: ['hoka'],
    slideTitle: 'BRAND – HOKA',
    headcount3Y: [
      { year: 'HC', b2026: 4, e2026: 5, y2027: 5, y2028: 5, y2029: 5, detail: '01 Sr. VM Executive' }
    ],
    leaders: [
      {
        id: 'THL_REG_HOKA',
        title: 'Regional Head of Hoka',
        nickname: 'Joel',
        flags: ['MY', 'TH', 'VN'],
        x: 350,
        y: 190,
        width: 130,
        height: 48
      },
      {
        id: 'THL_REG_MKT_HOKA',
        title: 'Regional Head of MKT - Hoka',
        nickname: 'Nino',
        flags: ['MY', 'VN'],
        x: 540,
        y: 190,
        width: 130,
        height: 48
      }
    ],
    pillarPills: [
      { id: 'pill_merch', label: 'Merchandise', x: 350, y: 260, width: 130 },
      { id: 'pill_mkt', label: 'Marketing', x: 540, y: 260, width: 130 }
    ],
    cards: [
      { id: 'hoka_bm', title: 'Brand Manager', nickname: 'Liam', x: 350, y: 310, reportsToId: 'THL_REG_HOKA', dept: 'Merchandise' },
      { id: 'hoka_buyer', title: 'Buyer', nickname: 'Quang', x: 350, y: 370, reportsToId: 'hoka_bm', dept: 'Merchandise' },
      { id: 'hoka_vm', title: 'Sr.VM Executive', nickname: 'Trang', x: 350, y: 430, status: 'new_hire', customLabel: 'New-Jul 2026', reportsToId: 'hoka_bm', dept: 'Merchandise' },
      { id: 'hoka_mkt_mgr', title: 'Marketing Mgr.', nickname: 'Trang', x: 540, y: 310, reportsToId: 'THL_REG_MKT_HOKA', dept: 'Marketing' },
      { id: 'hoka_mkt_exe', title: 'Marketing Exe.', nickname: 'Vi', x: 540, y: 370, reportsToId: 'hoka_mkt_mgr', dept: 'Marketing' }
    ],
    indirectLinks: []
  },

  // 2. BRAND - DYSON (Page 3)
  dyson: {
    key: 'dyson',
    divisionNames: ['dyson', 'dyson viet nam'],
    slideTitle: 'BRAND – DYSON',
    canvasWidth: 1010,
    canvasHeight: 680,
    headcount3Y: [
      { year: 'HC', b2026: 32, e2026: 34, y2027: 35, y2028: 36, y2029: 36, detail: '01 Head of Sales & OPS, 01 Affiliate Sup., 01 VM Sup., 01 3P Channel Manager' }
    ],
    leaders: [
      { id: 'THL_REG_DYSON', title: 'Regional Head of Dyson\nCMG THL', nickname: 'K Ming', flags: ['TH', 'VN'], x: 420, y: 70, width: 125, height: 46 },
      { id: 'SHO-DYS-114-117-050-1', title: 'Head of Dyson', nickname: 'Andy', flags: ['VN_STAR'], x: 435, y: 130, width: 95, height: 42, reportsToId: 'THL_REG_DYSON' },
      { id: 'VN_PRES_DYSON', title: 'VN CBS President', nickname: 'Andrew F.', flags: ['VN_STAR'], x: 840, y: 70, width: 145, height: 48 },
      { id: 'THL_DYSON_SC', title: 'Dyson\nTHL - SC', nickname: '', flags: ['TH'], x: 745, y: 140, width: 65, height: 32 }
    ],
    pillarPills: [
      { id: 'pill_sales_ops', label: 'Sales & Operations', x: 50, y: 200, width: 270 },
      { id: 'pill_ops', label: 'Operations', x: 95, y: 295, width: 75, isSubPill: true },
      { id: 'pill_3p', label: '3P Omni', x: 95, y: 520, width: 75, isSubPill: true },
      { id: 'pill_ecom', label: 'Ecommerce', x: 185, y: 295, width: 135, isSubPill: true },
      { id: 'pill_ka', label: 'Key Account', x: 180, y: 360, width: 65, isSubPill: true },
      { id: 'pill_onl_ops', label: 'Online Operations', x: 250, y: 360, width: 70, isSubPill: true },
      { id: 'pill_livestream', label: 'Livestream', x: 250, y: 445, width: 70, isSubPill: true },
      { id: 'pill_b2b', label: 'B2B', x: 335, y: 200, width: 60 },
      { id: 'pill_vm', label: 'VM', x: 410, y: 200, width: 55 },
      { id: 'pill_training', label: 'Training', x: 480, y: 200, width: 60 },
      { id: 'pill_mkt', label: 'Marketing', x: 555, y: 200, width: 65 },
      { id: 'pill_trade', label: 'Trade', x: 555, y: 320, width: 65, isSubPill: true },
      { id: 'pill_cs', label: 'C. Service', x: 555, y: 485, width: 65, isSubPill: true },
      { id: 'pill_merch', label: 'Merchandise', x: 635, y: 200, width: 68 },
      { id: 'pill_sc', label: 'SC', x: 715, y: 200, width: 68 }
    ],
    cards: [
      // Sales & Operations
      { id: 'dys_head_sales_ops', title: 'Head of Sales &\nOperations', nickname: 'New', x: 120, y: 235, width: 125, height: 40, status: 'new_hire', customLabel: 'New', reportsToId: 'SHO-DYS-114-117-050-1' },
      { id: 'dys_admin', title: 'Brand Admin', nickname: 'Linh', x: 15, y: 330, width: 65, height: 42, reportsToId: 'dys_head_sales_ops' },
      // Operations sub-column
      { id: 'dys_srdm', title: 'Sr. DM.', nickname: 'Hạnh', x: 95, y: 325, width: 75, height: 38, reportsToId: 'dys_head_sales_ops' },
      { id: 'dys_dms1', title: 'DM-S', nickname: 'Thanh', x: 95, y: 370, width: 75, height: 38, reportsToId: 'dys_srdm' },
      { id: 'dys_dms2', title: 'DM-S', nickname: 'Thiện', x: 95, y: 415, width: 75, height: 38, reportsToId: 'dys_srdm' },
      { id: 'dys_dmn', title: 'DM-N', nickname: 'Quan', x: 95, y: 460, width: 75, height: 38, reportsToId: 'dys_srdm' },
      { id: 'dys_3p_mgr', title: '3P Channel Mgr.', nickname: 'New- Jan 2028', x: 95, y: 550, width: 75, height: 42, status: 'new_hire', customLabel: 'New- Jan 2028' },
      { id: 'dys_ka_exe_3p', title: 'KA Exe. (3P Omni)', nickname: 'Minh', x: 95, y: 600, width: 75, height: 42, reportsToId: 'dys_head_sales_ops' },
      // Ecommerce sub-column
      { id: 'dys_ecom_mgr', title: 'Ecommerce Mgr.', nickname: 'Nhi', x: 215, y: 325, width: 75, height: 38, reportsToId: 'dys_head_sales_ops' },
      { id: 'dys_ecom_sp', title: 'Ecom Ex. -SP', nickname: 'Ngan', x: 180, y: 390, width: 65, height: 38, reportsToId: 'dys_ecom_mgr' },
      { id: 'dys_ecom_tt', title: 'Sr. Ecom. Ex. -TT', nickname: 'Tu - 13Jul', x: 180, y: 435, width: 65, height: 42, status: 'highlight', customLabel: 'Tu - 13Jul', reportsToId: 'dys_ecom_mgr' },
      { id: 'dys_ecom_web', title: 'Ecom Ex - Web', nickname: 'Khôi', x: 180, y: 485, width: 65, height: 38, reportsToId: 'dys_ecom_mgr' },
      { id: 'dys_affiliate', title: 'Affiliate Mgmt. Sup.', nickname: 'New-Nov 2026', x: 180, y: 530, width: 65, height: 45, status: 'new_hire', customLabel: 'New-Nov 2026' },
      { id: 'dys_ecom_op', title: 'Ecom Ex - OP', nickname: 'Huyen', x: 250, y: 390, width: 70, height: 38, reportsToId: 'dys_ecom_mgr' },
      { id: 'dys_livestream', title: 'Ecom Exe', nickname: 'Khai', x: 250, y: 475, width: 70, height: 38, reportsToId: 'dys_ecom_mgr' },
      // B2B
      { id: 'dys_ka_mgr', title: 'Key Account Mgr.', nickname: 'Thủy', x: 330, y: 260, width: 70, height: 42, reportsToId: 'SHO-DYS-114-117-050-1' },
      { id: 'dys_ka_admin', title: 'KA Admin', nickname: 'Phuong- 13Jul', x: 330, y: 330, width: 70, height: 42, status: 'highlight', customLabel: 'Phuong- 13Jul', reportsToId: 'dys_ka_mgr' },
      // VM
      { id: 'dys_vm_mgr', title: 'VM Manager', nickname: 'Ngọc', x: 405, y: 260, width: 65, height: 42, reportsToId: 'SHO-DYS-114-117-050-1' },
      { id: 'dys_vm_sup', title: 'VM Sup.', nickname: 'New Jan 2027', x: 405, y: 330, width: 65, height: 42, status: 'new_hire', customLabel: 'New Jan 2027' },
      { id: 'dys_designer', title: 'Designer', nickname: 'My', x: 405, y: 385, width: 65, height: 38, reportsToId: 'dys_vm_mgr' },
      // Training
      { id: 'dys_training_mgr', title: 'Sr. Training Mgr.', nickname: 'Minh', x: 475, y: 260, width: 70, height: 42, reportsToId: 'SHO-DYS-114-117-050-1' },
      // Marketing
      { id: 'dys_mkt_mgr', title: 'MKT Mgr.', nickname: 'Thy', x: 555, y: 260, width: 65, height: 42, reportsToId: 'SHO-DYS-114-117-050-1' },
      { id: 'dys_mkt_exe1', title: 'MKT Exe.', nickname: 'Hiền', x: 555, y: 350, width: 65, height: 38, reportsToId: 'dys_mkt_mgr' },
      { id: 'dys_sr_mkt_exe', title: 'Sr. MKT Exe.', nickname: 'Thúy', x: 555, y: 395, width: 65, height: 38, reportsToId: 'dys_mkt_mgr' },
      { id: 'dys_mkt_exe2', title: 'MKT Exe.', nickname: 'Thảo', x: 555, y: 440, width: 65, height: 38, reportsToId: 'dys_mkt_mgr' },
      { id: 'dys_crm_exe', title: 'Sr. CRM Exe.', nickname: 'Vi', x: 555, y: 515, width: 65, height: 38, reportsToId: 'dys_mkt_mgr' },
      // Merchandise
      { id: 'dys_mer_mgr', title: 'Mer Mgr.', nickname: 'Hằng', x: 635, y: 260, width: 68, height: 42, reportsToId: 'SHO-DYS-114-117-050-1' },
      { id: 'dys_sr_me', title: 'Senior ME', nickname: 'Aaron', x: 635, y: 330, width: 68, height: 42, reportsToId: 'dys_mer_mgr' },
      { id: 'dys_me', title: 'ME', nickname: 'Phang', x: 635, y: 380, width: 68, height: 38, reportsToId: 'dys_mer_mgr' },
      // SC
      { id: 'dys_sc_mgr', title: 'Service Center\nMgr.', nickname: 'Phúc', x: 715, y: 260, width: 68, height: 45, reportsToId: 'SHO-DYS-114-117-050-1' },
      { id: 'dys_sc_am', title: 'SC Ops. AM-S', nickname: 'Replace', x: 715, y: 330, width: 68, height: 42, status: 'replace', customLabel: 'Replace', reportsToId: 'dys_sc_mgr' },
      { id: 'dys_sc_admin1', title: 'SC-Admin-S', nickname: 'Nhi', x: 715, y: 380, width: 68, height: 38, reportsToId: 'dys_sc_mgr' },
      { id: 'dys_sc_admin2', title: 'SC-Admin-S', nickname: 'Thu', x: 715, y: 425, width: 68, height: 38, reportsToId: 'dys_sc_mgr' },
      { id: 'dys_tech', title: 'Sr.Technician-S', nickname: 'Thiện', x: 715, y: 470, width: 68, height: 42, reportsToId: 'dys_sc_mgr' },
      { id: 'dys_spare_parts', title: 'Spare Part.\nInv. Exe. - S', nickname: 'Huy', x: 715, y: 520, width: 68, height: 45, reportsToId: 'dys_sc_mgr' }
    ],
    indirectLinks: [
      { id: 'ind_dyson_sc', fromId: 'THL_DYSON_SC', toId: 'dys_sc_mgr', label: '' },
      { id: 'ind_dyson_pres', fromId: 'SHO-DYS-114-117-050-1', toId: 'VN_PRES_DYSON', label: '' }
    ],
    hasCRVShared: true
  },

  // 3. BRAND - FOOTWEAR (Crocs & Havaianas - Page 4)
  footwear: {
    key: 'footwear',
    divisionNames: ['crocs', 'footwear', 'havaianas'],
    slideTitle: 'BRAND – Crocs',
    canvasWidth: 1010,
    canvasHeight: 680,
    headcount3Y: [
      { year: 'HC', b2026: 32, e2026: 34, y2027: 35, y2028: 37, y2029: 37, detail: 'Crocs(+2): 01 Digital MKT, 01 Ecom Operator; Crocs(+1): 01 Mer. Planner' }
    ],
    leaders: [
      { id: 'THL_REG_FOOTWEAR', title: 'Regional Head of FW\nCMG THL', nickname: 'K Penny', flags: ['TH', 'VN'], x: 410, y: 70, width: 125, height: 46 },
      { id: 'SHO-CRO-015-014-049-1', title: 'Head of Footwear', nickname: 'Nikki', flags: ['VN_STAR'], customLabel: 'When??', x: 410, y: 130, width: 125, height: 46, reportsToId: 'THL_REG_FOOTWEAR' },
      { id: 'VN_PRES_CROCS', title: 'VN CBS President', nickname: 'Andrew F.', flags: ['VN_STAR'], x: 840, y: 70, width: 140, height: 48 }
    ],
    pillarPills: [
      { id: 'pill_hav', label: 'Havaianas', x: 45, y: 200, width: 85, isUnderline: true },
      { id: 'pill_crocs', label: 'Crocs', x: 195, y: 200, width: 80 },
      { id: 'pill_product', label: 'Product', x: 160, y: 290, width: 70, isSubPill: true },
      { id: 'pill_cro_vm', label: 'VM', x: 240, y: 290, width: 70, isSubPill: true },
      { id: 'pill_cro_mkt', label: 'MKT', x: 335, y: 200, width: 80 },
      { id: 'pill_trade', label: 'Trade', x: 335, y: 290, width: 80, isSubPill: true },
      { id: 'pill_design', label: 'Design', x: 335, y: 470, width: 80, isSubPill: true },
      { id: 'pill_cro_ecom', label: 'Ecommerce', x: 445, y: 200, width: 235 },
      { id: 'pill_web', label: 'Website', x: 425, y: 290, width: 75, isSubPill: true },
      { id: 'pill_tech', label: 'Tech', x: 425, y: 510, width: 75, isSubPill: true },
      { id: 'pill_mkp', label: 'Marketplace', x: 510, y: 290, width: 75, isSubPill: true },
      { id: 'pill_dig_mkt', label: 'Digital MKT', x: 595, y: 290, width: 75, isSubPill: true },
      { id: 'pill_cro_ops', label: 'Operations', x: 700, y: 200, width: 140 },
      { id: 'pill_ops_sub', label: 'Ops', x: 675, y: 290, width: 75, isSubPill: true },
      { id: 'pill_training_sub', label: 'Training', x: 760, y: 290, width: 75, isSubPill: true }
    ],
    cards: [
      // Crocs Brand
      { id: 'cro_bm', title: 'Brand Mgr.', nickname: 'Thảo Vũ', x: 195, y: 235, width: 80, height: 42, reportsToId: 'SHO-CRO-015-014-049-1' },
      // Product
      { id: 'cro_buyer', title: 'Sr Buyer', nickname: 'Nhi', x: 160, y: 320, width: 70, height: 38, reportsToId: 'cro_bm' },
      { id: 'cro_ma1', title: 'MA', nickname: 'Ha', x: 160, y: 365, width: 70, height: 38, reportsToId: 'cro_buyer' },
      { id: 'cro_ma2', title: 'MA', nickname: 'Thuong', x: 160, y: 410, width: 70, height: 38, reportsToId: 'cro_buyer' },
      { id: 'cro_ma3', title: 'MA (Online)', nickname: 'Mai', x: 160, y: 455, width: 70, height: 42, reportsToId: 'cro_buyer' },
      { id: 'cro_mer_plan', title: 'Mer. Planner', nickname: 'New Mar 2027', x: 160, y: 505, width: 70, height: 45, status: 'new_hire', customLabel: 'New Mar 2027' },
      // VM
      { id: 'cro_vm_mgr', title: 'VM Manager', nickname: 'Dustin', x: 240, y: 320, width: 70, height: 42, reportsToId: 'cro_bm' },
      { id: 'cro_vm_s', title: 'VM Exec - S', nickname: 'Thanh', x: 240, y: 370, width: 70, height: 42, reportsToId: 'cro_vm_mgr' },
      { id: 'cro_vm_n', title: 'VM Exec - N', nickname: 'Linh', x: 240, y: 420, width: 70, height: 42, reportsToId: 'cro_vm_mgr' },
      // MKT
      { id: 'cro_mkt_mgr', title: 'Marketing Mgr.', nickname: 'Lan Anh', x: 335, y: 235, width: 80, height: 42, reportsToId: 'SHO-CRO-015-014-049-1' },
      { id: 'cro_mkt_exe', title: 'MKT Exe.', nickname: 'Hannah', x: 335, y: 320, width: 80, height: 38, reportsToId: 'cro_mkt_mgr' },
      { id: 'cro_pr', title: 'Content & PR', nickname: 'Uyen-25Jul', x: 335, y: 365, width: 80, height: 42, status: 'highlight', customLabel: 'Uyen-25Jul', reportsToId: 'cro_mkt_mgr' },
      { id: 'cro_mkt_admin', title: 'MKT Admin', nickname: 'Phuc', x: 335, y: 415, width: 80, height: 38, reportsToId: 'cro_mkt_mgr' },
      { id: 'cro_designer', title: 'Designer', nickname: 'Trung', x: 335, y: 500, width: 80, height: 38, reportsToId: 'cro_mkt_mgr' },
      // Ecommerce
      { id: 'cro_ecom_mgr', title: 'Ecommerce Mgr.', nickname: 'Thảo Hoàng', x: 490, y: 235, width: 90, height: 42, reportsToId: 'SHO-CRO-015-014-049-1' },
      { id: 'cro_web_mgr', title: 'D. Web. Mgr.', nickname: 'Nga', x: 425, y: 320, width: 75, height: 42, reportsToId: 'cro_ecom_mgr' },
      { id: 'cro_ecom_exe', title: 'Ecom. Exe.', nickname: 'Huy', x: 425, y: 370, width: 75, height: 38, reportsToId: 'cro_web_mgr' },
      { id: 'cro_pro_content', title: 'Pro. Content', nickname: 'Vân', x: 425, y: 415, width: 75, height: 42, reportsToId: 'cro_web_mgr' },
      { id: 'cro_ecom_op1', title: 'Ecom. Operator', nickname: 'New 2026', x: 425, y: 465, width: 75, height: 42, status: 'new_hire', customLabel: 'New 2026' },
      { id: 'cro_po', title: 'Product Owner', nickname: 'Thang', x: 425, y: 540, width: 75, height: 42, reportsToId: 'cro_ecom_mgr' },
      { id: 'cro_mkp_mgr', title: 'D. MKP Mgr.', nickname: 'Zac', x: 510, y: 320, width: 75, height: 42, reportsToId: 'cro_ecom_mgr' },
      { id: 'cro_mkp_exe', title: 'Ecom. Exe.', nickname: 'Minh Anh', x: 510, y: 370, width: 75, height: 42, reportsToId: 'cro_mkp_mgr' },
      { id: 'cro_ecom_op2', title: 'Ecom. Operator', nickname: 'Ánh', x: 510, y: 420, width: 75, height: 42, reportsToId: 'cro_mkp_mgr' },
      { id: 'cro_ecom_op3', title: 'Ecom. Operator', nickname: 'Han', x: 510, y: 470, width: 75, height: 42, reportsToId: 'cro_mkp_mgr' },
      { id: 'cro_ecom_sup', title: 'Ecom. OPS Sup.', nickname: 'New-Jan 2028', x: 510, y: 520, width: 75, height: 45, status: 'new_hire', customLabel: 'New-Jan 2028' },
      { id: 'cro_mkt_lead', title: 'Perfor. MKT Lead', nickname: 'An', x: 595, y: 320, width: 75, height: 45, status: 'highlight', customLabel: 'Internal Promote' },
      { id: 'cro_digital_exe', title: 'Digital Exe.', nickname: 'New 2026', x: 595, y: 375, width: 75, height: 42, status: 'new_hire', customLabel: 'New 2026' },
      // Operations
      { id: 'cro_ops_mgr', title: 'Operations Mgr.', nickname: 'Jen', x: 700, y: 235, width: 90, height: 42, reportsToId: 'SHO-CRO-015-014-049-1' },
      { id: 'cro_dm_s1', title: 'Sr. DM - S', nickname: 'Hellen', x: 675, y: 320, width: 75, height: 42, reportsToId: 'cro_ops_mgr' },
      { id: 'cro_dm_s2', title: 'Sr. DM-S', nickname: 'Tamie', x: 675, y: 370, width: 75, height: 45, status: 'highlight', customLabel: 'Internal Promote' },
      { id: 'cro_dm_n1', title: 'Sr. DM - N', nickname: 'Vivian', x: 675, y: 425, width: 75, height: 42, reportsToId: 'cro_ops_mgr' },
      { id: 'cro_dm_n2', title: 'DM - N', nickname: 'Nhàn', x: 675, y: 475, width: 75, height: 38, reportsToId: 'cro_ops_mgr' },
      { id: 'cro_dm_c', title: 'DM - C', nickname: 'Tram', x: 675, y: 520, width: 75, height: 38, reportsToId: 'cro_ops_mgr' },
      { id: 'cro_dm_new', title: 'DM', nickname: 'New-Jan 2028', x: 675, y: 565, width: 75, height: 42, status: 'new_hire', customLabel: 'New-Jan 2028' },
      { id: 'cro_train_mgr', title: 'Training Mgr.', nickname: 'Judy', x: 760, y: 320, width: 75, height: 42, reportsToId: 'cro_ops_mgr' },
      { id: 'cro_train_exe', title: 'Train. Exe. - N', nickname: 'Trang', x: 760, y: 370, width: 75, height: 42, reportsToId: 'cro_train_mgr' }
    ],
    indirectLinks: [
      { id: 'ind_crocs_pres', fromId: 'SHO-CRO-015-014-049-1', toId: 'VN_PRES_CROCS', label: '' }
    ]
  },

  // 4. BRAND - SUPERSPORTS (Page 7)
  supersports: {
    key: 'supersports',
    divisionNames: ['supersports'],
    slideTitle: 'BRAND – SUPERSPORTS',
    headcount3Y: [
      { year: 'HC', b2026: 16, e2026: 17, y2027: 18, y2028: 19, y2029: 19, detail: '01 Merch. Assistant, 01 Buyer, 01 Merch. Assistant' }
    ],
    leaders: [
      { id: 'ssp_head', title: 'Head of SSP', nickname: 'Thao', flags: ['VN_STAR'], x: 480, y: 195, width: 135, height: 44 }
    ],
    pillarPills: [
      { id: 'pill_run', label: 'Running', x: 220, y: 260, width: 110 },
      { id: 'pill_train_life', label: 'Training & Lifestyle', x: 345, y: 260, width: 125 },
      { id: 'pill_water', label: 'Water & Outdoor', x: 485, y: 260, width: 115 },
      { id: 'pill_vertical', label: 'Vertical Sports', x: 615, y: 260, width: 110 },
      { id: 'pill_vm_ssp', label: 'Visual Merchandise SSP & Hoka', x: 745, y: 260, width: 135 }
    ],
    cards: [
      // Running
      { id: 'ssp_cat_run', title: 'Category Mgr.', nickname: 'Hương', x: 220, y: 310, width: 110, reportsToId: 'ssp_head' },
      { id: 'ssp_buyer_run', title: 'Sr. Buyer', nickname: 'Hannah', x: 220, y: 360, width: 110, reportsToId: 'ssp_cat_run' },
      { id: 'ssp_ma_run1', title: 'Merch. Asst.', nickname: 'Phúc', x: 220, y: 410, width: 110, reportsToId: 'ssp_buyer_run' },
      { id: 'ssp_ma_run2', title: 'Merch. Asst.', nickname: 'New Aug2026', x: 220, y: 460, width: 110, status: 'new_hire', customLabel: 'New Aug 2026' },
      // Training & Lifestyle
      { id: 'ssp_cat_train', title: 'Category Mgr.', nickname: 'Kat', x: 345, y: 310, width: 120, reportsToId: 'ssp_head' },
      { id: 'ssp_buyer_t1', title: 'Buyer', nickname: 'Hân', x: 345, y: 360, width: 120, reportsToId: 'ssp_cat_train' },
      { id: 'ssp_buyer_t2', title: 'Buyer', nickname: 'Ngoc', x: 345, y: 410, width: 120, reportsToId: 'ssp_cat_train' },
      { id: 'ssp_buyer_t3', title: 'Buyer', nickname: 'New Jan 2027', x: 345, y: 460, width: 120, status: 'new_hire', customLabel: 'New Jan 2027' },
      { id: 'ssp_ma_t1', title: 'Merch. Asst.', nickname: 'New Jan 2028', x: 345, y: 510, width: 120, status: 'new_hire', customLabel: 'New Jan 2028' },
      { id: 'ssp_ma_t2', title: 'Merch. Asst.', nickname: 'Trang', x: 345, y: 560, width: 120, reportsToId: 'ssp_cat_train' },
      // Water & Outdoor
      { id: 'ssp_cat_water', title: 'Category Mgr.', nickname: 'Katie', x: 485, y: 310, width: 115, reportsToId: 'ssp_head' },
      { id: 'ssp_buyer_water', title: 'Senior Buyer', nickname: 'My', x: 485, y: 360, width: 115, status: 'highlight', customLabel: 'Internal Promote' },
      { id: 'ssp_ma_water', title: 'Merch. Asst.', nickname: 'Nhi', x: 485, y: 410, width: 115, reportsToId: 'ssp_buyer_water' },
      // Vertical Sports
      { id: 'ssp_buyer_vert', title: 'Senior Buyer', nickname: 'Ziggy – 1-Oct', x: 615, y: 310, width: 115, reportsToId: 'ssp_head' },
      { id: 'ssp_ma_vert', title: 'Merch. Asst.', nickname: 'Truc', x: 615, y: 360, width: 115, reportsToId: 'ssp_buyer_vert' },
      // VM SSP & Hoka
      { id: 'ssp_rbm', title: 'Retail Brand Mgr.', nickname: 'Sophie', x: 745, y: 310, width: 125, reportsToId: 'ssp_head' },
      { id: 'ssp_vmam', title: 'VMAM - S', nickname: 'Thơ', x: 745, y: 360, width: 125, reportsToId: 'ssp_rbm' },
      { id: 'ssp_vme', title: 'VME - N', nickname: 'Diệu', x: 745, y: 410, width: 125, reportsToId: 'ssp_rbm' }
    ],
    indirectLinks: []
  },

  // 5. HR - CRV SHARED SERVICE (Page 14)
  hr: {
    key: 'hr',
    divisionNames: ['human resources', 'hr'],
    slideTitle: 'HR - CRV SHARED SERVICE',
    headcount3Y: [
      { year: 'HC', b2026: 11, e2026: 11, y2027: 12, y2028: 13, y2029: 14, detail: '01 HRBP Sup., 01 TA Mass, 01 C&B Specialist' }
    ],
    leaders: [
      { id: 'CRV_GROUP_HR', title: 'Group HR Director', nickname: 'Thao', flags: ['VN_STAR'], x: 780, y: 150, width: 130, height: 44 },
      { id: 'SHO-HR-001', title: 'Head of HR', nickname: 'Vân', flags: ['VN_STAR'], x: 480, y: 195, width: 130, height: 44 }
    ],
    pillarPills: [
      { id: 'pill_cb', label: 'C&B Operations', x: 180, y: 260, width: 120 },
      { id: 'pill_bp', label: 'Business Partner', x: 480, y: 260, width: 130 },
      { id: 'pill_data', label: 'HR Data Analyst', x: 730, y: 260, width: 110 },
      { id: 'pill_admin', label: 'Admin', x: 860, y: 260, width: 90 }
    ],
    cards: [
      // C&B
      { id: 'hr_cb_mgr', title: 'C&B Mgr.', nickname: 'Liểu', x: 180, y: 300, width: 120, reportsToId: 'SHO-HR-001' },
      { id: 'hr_cb_spec1', title: 'C&B Specialist', nickname: 'Tam', x: 180, y: 395, width: 115, reportsToId: 'hr_cb_mgr' },
      { id: 'hr_cb_spec2', title: 'C&B Specialist', nickname: 'Thiên', x: 180, y: 450, width: 115, reportsToId: 'hr_cb_mgr' },
      { id: 'hr_cb_spec3', title: 'C&B Specialist', nickname: 'New Jan 2029', x: 180, y: 505, width: 115, status: 'new_hire', customLabel: 'New Jan 2029' },
      // Business Partner
      { id: 'hr_bp_mgr', title: 'HRBP & OD Mgr.', nickname: 'Hugo', x: 480, y: 300, width: 130, reportsToId: 'SHO-HR-001' },
      // TA Office
      { id: 'hr_ta_office', title: 'TA Office', nickname: 'Nga', x: 370, y: 395, width: 105, reportsToId: 'hr_bp_mgr' },
      // TA Store
      { id: 'hr_ta_store1', title: 'TA Mass - Sports, D&L', nickname: 'Vu', x: 480, y: 395, width: 120, reportsToId: 'hr_bp_mgr' },
      { id: 'hr_ta_store2', title: 'TA Mass – Dyson,Crocs- S', nickname: 'Wean', x: 480, y: 450, width: 120, reportsToId: 'hr_bp_mgr' },
      { id: 'hr_ta_store3', title: 'TA Mass – Dyson,Crocs- N', nickname: 'P.Anh', x: 480, y: 505, width: 120, reportsToId: 'hr_bp_mgr' },
      { id: 'hr_ta_store4', title: 'TA Mass MK+New Brand', nickname: 'New Jan 2028', x: 480, y: 560, width: 120, status: 'new_hire', customLabel: 'New Jan 2028' },
      // HRBP
      { id: 'hr_hrbp_sup', title: 'HRBP Supervisor', nickname: 'New Jan 2027', x: 615, y: 395, width: 110, status: 'new_hire', customLabel: 'New Jan 2027' },
      // Data Analyst
      { id: 'hr_analyst', title: 'HR Data Analyst', nickname: 'Sang', x: 730, y: 395, width: 110, reportsToId: 'SHO-HR-001' },
      // Admin
      { id: 'hr_admin', title: 'Office Admin', nickname: 'Phanh', x: 860, y: 440, width: 100, reportsToId: 'SHO-HR-001' }
    ],
    indirectLinks: [
      { id: 'ind_group_hr', fromId: 'CRV_GROUP_HR', toId: 'SHO-HR-001', label: '' }
    ]
  },

  // 6. FINANCE - CRV SHARED SERVICE (Page 13)
  finance: {
    key: 'finance',
    divisionNames: ['finance'],
    slideTitle: 'FINANCE - CRV SHARED SERVICE',
    headcount3Y: [
      { year: 'HC', b2026: 7, e2026: 8, y2027: 9, y2028: 9, y2029: 10, detail: '01 BI Analyst, 01 FP&A Exe., 01 FP&A Exe.' }
    ],
    leaders: [
      { id: 'fin_cfo', title: 'Deputy CFO', nickname: 'K Yui', flags: ['TH'], x: 770, y: 150, width: 125, height: 44 },
      { id: 'fin_ctrl', title: 'Business Controller', nickname: 'Phước', flags: ['VN_STAR'], x: 470, y: 195, width: 135, height: 44 }
    ],
    pillarPills: [
      { id: 'pill_fin_sports', label: 'Sports', x: 310, y: 260, width: 115 },
      { id: 'pill_fin_cmg', label: 'CMG', x: 470, y: 260, width: 115 },
      { id: 'pill_fin_bi', label: 'BI', x: 630, y: 260, width: 115 }
    ],
    cards: [
      // Sports
      { id: 'fin_fpa_mgr_sports', title: 'FP&A Mgr.', nickname: 'Tuyền', x: 310, y: 300, width: 115, reportsToId: 'fin_ctrl' },
      { id: 'fin_inv_s', title: 'Inventory Checker - S', nickname: 'Thuong', x: 235, y: 380, width: 105, reportsToId: 'fin_fpa_mgr_sports' },
      { id: 'fin_inv_n', title: 'Inventory Checker - N', nickname: 'Mung', x: 235, y: 430, width: 105, reportsToId: 'fin_fpa_mgr_sports' },
      { id: 'fin_fpa_exe_cuc', title: 'FP&A Executive', nickname: 'Cuc Anh', x: 350, y: 380, width: 110, reportsToId: 'fin_fpa_mgr_sports' },
      { id: 'fin_fpa_exe_new', title: 'FP&A Executive', nickname: 'New Apr 2029', x: 350, y: 430, width: 110, status: 'new_hire', customLabel: 'New Apr 2029' },
      // CMG
      { id: 'fin_fpa_mgr_cmg', title: 'FP&A Mgr.', nickname: 'Duyen', x: 470, y: 300, width: 115, reportsToId: 'fin_ctrl' },
      { id: 'fin_fpa_exe_huyen', title: 'FP&A Executive', nickname: 'Huyen', x: 470, y: 380, width: 115, reportsToId: 'fin_fpa_mgr_cmg' },
      { id: 'fin_fpa_exe_cmg_new', title: 'FP&A Executive', nickname: 'New Oct 2027', x: 470, y: 430, width: 115, status: 'new_hire', customLabel: 'New Oct 2027' },
      // BI
      { id: 'fin_bi_analyst', title: 'BI Analyst.', nickname: 'New 2026', x: 630, y: 300, width: 125, status: 'new_hire', customLabel: 'New 2026 – Additional HC', reportsToId: 'fin_ctrl' }
    ],
    indirectLinks: [
      { id: 'ind_cfo', fromId: 'fin_cfo', toId: 'fin_ctrl', label: '' }
    ]
  },

  // 7. PLANNING (Page 11)
  planning: {
    key: 'planning',
    divisionNames: ['planning'],
    slideTitle: 'PLANNING',
    headcount3Y: [
      { year: 'HC', b2026: 7, e2026: 7, y2027: 7, y2028: 7, y2029: 7, detail: '-' }
    ],
    leaders: [
      { id: 'plan_head', title: 'Head of Planning', nickname: 'Replace', flags: ['VN_STAR'], x: 480, y: 195, width: 135, height: 44, status: 'replace', customLabel: 'Replace' }
    ],
    pillarPills: [
      { id: 'pill_bu_shared', label: 'BU Shared', x: 300, y: 260, width: 130 },
      { id: 'pill_sys_support', label: 'System, Support & Project', x: 300, y: 295, width: 130, isSubPill: true },
      { id: 'pill_sports_shared', label: 'Sports Shared', x: 620, y: 260, width: 130 },
      { id: 'pill_planning_sub', label: 'Planning', x: 620, y: 295, width: 130, isSubPill: true }
    ],
    cards: [
      // BU Shared
      { id: 'plan_rep', title: 'Replenish. Analyst', nickname: 'Thy', x: 120, y: 345, width: 105, reportsToId: 'plan_head' },
      { id: 'plan_merch_admin', title: 'Merch. Admin', nickname: 'Mai', x: 235, y: 345, width: 100, reportsToId: 'plan_head' },
      { id: 'plan_pmo', title: 'PMO Planning Exe.', nickname: 'Son', x: 345, y: 345, width: 105, reportsToId: 'plan_head' },
      { id: 'plan_db', title: 'Database Manag. Exe.', nickname: 'Dung', x: 460, y: 345, width: 105, reportsToId: 'plan_head' },
      // Sports Shared
      { id: 'plan_mgr', title: 'Planning Mgr. – SSP & D&L', nickname: 'May', x: 620, y: 345, width: 125, reportsToId: 'plan_head' },
      { id: 'plan_exe', title: 'Planning Exe. – D&L & Rev Runnr', nickname: 'Nhi', x: 755, y: 345, width: 125, reportsToId: 'plan_mgr' }
    ],
    indirectLinks: []
  },

  // 8. BRAND - SPORTS D&L BRANDS (Page 6)
  sports_dl: {
    key: 'sports_dl',
    divisionNames: ['sports brands', 'sports brands - ua, col.', 'ua', 'columbia'],
    slideTitle: 'BRAND - SPORTS D&L BRANDS',
    headcount3Y: [
      { year: 'HC', b2026: 7, e2026: 11, y2027: 15, y2028: 16, y2029: 16, detail: 'TNF: +1 Buyer; MKT (+3): transferred from MKT-Sports; TNF(+3): MA, VM, MKT' }
    ],
    leaders: [
      { id: 'dl_reg_leader', title: 'Regional Head of D&L Brands CRC Sports THL', nickname: 'Hermann', flags: ['MY', 'TH', 'VN'], x: 380, y: 140, width: 145, height: 44 },
      { id: 'dl_head_vn', title: 'Head of Sports D&L Brands', nickname: 'April', flags: ['VN_STAR'], x: 380, y: 195, width: 145, height: 44 },
      { id: 'dl_reg_mkt', title: 'Regional Head of MKT – Sports D&L Brands & Hoka', nickname: 'Nino', flags: ['MY', 'VN'], x: 620, y: 140, width: 140, height: 44 }
    ],
    pillarPills: [
      { id: 'pill_tnf', label: 'TNF', x: 190, y: 260, width: 105 },
      { id: 'pill_ua', label: 'UA', x: 305, y: 260, width: 105 },
      { id: 'pill_columbia', label: 'COLUMBIA & SPEEDO', x: 420, y: 260, width: 120 },
      { id: 'pill_dl_vm', label: 'VM', x: 550, y: 260, width: 105 },
      { id: 'pill_dl_mkt', label: 'Marketing', x: 665, y: 260, width: 110 }
    ],
    cards: [
      // TNF
      { id: 'tnf_bm', title: 'Brand Manager', nickname: 'Jan 2028', x: 190, y: 305, width: 105, reportsToId: 'dl_head_vn' },
      { id: 'tnf_buyer', title: 'Buyer', nickname: 'Sep 26', x: 190, y: 355, width: 105, reportsToId: 'tnf_bm' },
      { id: 'tnf_ma', title: 'Merch. Asst', nickname: 'New-Jan 2027', x: 190, y: 405, width: 105, status: 'new_hire', customLabel: 'New Jan 2027' },
      // UA
      { id: 'ua_sr_buyer', title: 'Senior Buyer', nickname: 'Linh', x: 305, y: 305, width: 105, reportsToId: 'dl_head_vn' },
      { id: 'ua_ma', title: 'Merch. Asst', nickname: 'Quế Anh', x: 305, y: 355, width: 105, reportsToId: 'ua_sr_buyer' },
      // Columbia & Speedo
      { id: 'col_bm', title: 'Brand Manager', nickname: 'New-Oct 2027', x: 420, y: 305, width: 120, status: 'new_hire', customLabel: 'New Oct 2027' },
      { id: 'col_sr_buyer', title: 'Senior Buyer', nickname: 'Khánh', x: 420, y: 355, width: 120, reportsToId: 'col_bm' },
      { id: 'col_ma', title: 'Merch. Asst', nickname: 'Hoang Anh', x: 420, y: 405, width: 120, reportsToId: 'col_sr_buyer' },
      // VM
      { id: 'dl_vm_mgr', title: 'VM Manager', nickname: 'Blue', x: 550, y: 305, width: 105, reportsToId: 'dl_head_vn' },
      { id: 'dl_vme', title: 'VME - N', nickname: 'Thanh', x: 550, y: 355, width: 105, reportsToId: 'dl_vm_mgr' },
      { id: 'dl_vm_tnf', title: 'VM - TNF', nickname: 'New-Apri 2027', x: 550, y: 405, width: 105, status: 'new_hire', customLabel: 'New Apr 2027' },
      // Marketing
      { id: 'dl_mkt_mgr', title: 'MKT Manager', nickname: 'Thi', x: 665, y: 305, width: 110, reportsToId: 'dl_head_vn' },
      { id: 'dl_mkt_exe1', title: 'MKT Exe. –', nickname: 'Diễm-ML 7-Jul', x: 665, y: 355, width: 110, reportsToId: 'dl_mkt_mgr' },
      { id: 'dl_mkt_exe2', title: 'MKT Exe.', nickname: 'Nhi', x: 665, y: 405, width: 110, reportsToId: 'dl_mkt_mgr' },
      { id: 'dl_mkt_tnf', title: 'MKT - TNF', nickname: 'New-Jan 2027', x: 665, y: 455, width: 110, status: 'new_hire', customLabel: 'New Jan 2027' }
    ],
    indirectLinks: [
      { id: 'ind_dl_mkt', fromId: 'dl_reg_mkt', toId: 'dl_mkt_mgr', label: '' }
    ]
  },

  // 9. BRAND - FASHION (Matin Kim - Page 5)
  fashion: {
    key: 'fashion',
    divisionNames: ['fashion - matin kim', 'fashion', 'matin kim'],
    slideTitle: 'BRAND – FASHION',
    headcount3Y: [
      { year: 'HC', b2026: 0, e2026: 5, y2027: 6, y2028: 6, y2029: 6, detail: 'MK (+5): 01 BM, 01 Buyer, 01 MKT, 01 VM, 01 Ecom Lead; 01 Head of Fashion' }
    ],
    leaders: [
      { id: 'fash_cat_head', title: 'Category Head Fashion & Watch CMG THL', nickname: 'K Joyce', flags: ['TH', 'VN'], x: 450, y: 110, width: 185, height: 76 },
      { id: 'fash_head', title: 'Head of Fashion', nickname: 'New- Sep 2026', flags: ['VN_STAR'], x: 450, y: 200, width: 185, height: 76, status: 'new_hire', customLabel: 'New Sep 2026' }
    ],
    pillarPills: [
      { id: 'pill_matin_kim', label: 'Matin Kim', x: 340, y: 260, width: 130 },
      { id: 'pill_new_brand', label: 'New Brand', x: 640, y: 260, width: 120 }
    ],
    cards: [
      { id: 'mk_bm', title: 'Brand Mgr.', nickname: 'New -Q2/2026', x: 340, y: 305, width: 130, status: 'new_hire', customLabel: 'New Q2 2026', reportsToId: 'fash_head' },
      { id: 'mk_buyer', title: 'Buyer', nickname: 'Linh', x: 260, y: 375, width: 100, reportsToId: 'mk_bm' },
      { id: 'mk_mkt_exe', title: 'MKT Exe.', nickname: 'New-Q2/2026', x: 370, y: 375, width: 105, status: 'new_hire', customLabel: 'New Q2 2026', reportsToId: 'mk_bm' },
      { id: 'mk_vm_exe', title: 'VM Exe.', nickname: 'New-Q3/2026', x: 370, y: 425, width: 105, status: 'new_hire', customLabel: 'New Q3 2026', reportsToId: 'mk_bm' },
      { id: 'mk_ecom', title: 'Ecom. Leader', nickname: 'New-Q3/2026', x: 485, y: 375, width: 105, status: 'new_hire', customLabel: 'New Q3 2026', reportsToId: 'mk_bm' }
    ],
    indirectLinks: []
  },

  // 10. ONLINE SPORTS (Page 8)
  online_sports: {
    key: 'online_sports',
    divisionNames: ['online', 'online sports'],
    slideTitle: 'ONLINE SPORTS',
    headcount3Y: [
      { year: 'HC', b2026: 28, e2026: 31, y2027: 33, y2028: 35, y2029: 36, detail: '01 MKP Executive, 02 Streaming Talent, 01 Deputy Web Mgr, 01 EC Coordinator' }
    ],
    leaders: [
      { id: 'onl_head', title: 'Senior Ecom Mgr.', nickname: 'Emma', flags: ['VN_STAR'], x: 480, y: 195, width: 135, height: 44 }
    ],
    pillarPills: [
      { id: 'pill_onl_comm', label: 'Commercial', x: 220, y: 260, width: 120 },
      { id: 'pill_onl_perf', label: 'Performance Analysis', x: 420, y: 260, width: 120 },
      { id: 'pill_onl_omni', label: 'Omnichannel', x: 620, y: 260, width: 120 },
      { id: 'pill_onl_platform', label: 'Digital Platform', x: 820, y: 260, width: 120 }
    ],
    cards: [
      // Commercial
      { id: 'onl_ecom_mgr', title: 'Ecom. Mgr.', nickname: 'Replace 1-Sep', x: 220, y: 305, width: 120, status: 'replace', customLabel: 'Replace 1-Sep', reportsToId: 'onl_head' },
      { id: 'onl_web_mgr', title: 'Deputy Web Mgr.', nickname: 'New Jan 2028', x: 120, y: 375, width: 100, status: 'new_hire', customLabel: 'New Jan 2028' },
      { id: 'onl_web_lead', title: 'Web Leader', nickname: 'Giàu', x: 120, y: 425, width: 100, reportsToId: 'onl_ecom_mgr' },
      { id: 'onl_coord', title: 'Online Coordinator', nickname: 'Quan', x: 120, y: 475, width: 100, reportsToId: 'onl_ecom_mgr' },
      { id: 'onl_d2c_mgr', title: 'D2C & Commercial Mgr.', nickname: 'Hailee', x: 120, y: 535, width: 100, reportsToId: 'onl_ecom_mgr' },
      // Marketplace
      { id: 'onl_mkp_mgr', title: 'Deputy MKP Mgr. -LZ/TT', nickname: 'Thảo ICDP', x: 230, y: 375, width: 105, reportsToId: 'onl_ecom_mgr' },
      { id: 'onl_stream1', title: 'Streaming Talent', nickname: 'Như', x: 180, y: 440, width: 95 },
      { id: 'onl_stream2', title: 'Streaming Talent', nickname: 'Huy', x: 180, y: 485, width: 95 },
      { id: 'onl_stream3', title: 'Streaming Talent', nickname: 'Công', x: 180, y: 530, width: 95 },
      { id: 'onl_stream4', title: 'Streaming Talent', nickname: 'Phát', x: 180, y: 575, width: 95 },
      { id: 'onl_stream5', title: 'Streaming Talent', nickname: 'New Aug 2026', x: 180, y: 620, width: 95, status: 'new_hire', customLabel: 'New Aug 2026' },
      { id: 'onl_stream6', title: 'Streaming Talent', nickname: 'New Aug 2026', x: 180, y: 665, width: 95, status: 'new_hire', customLabel: 'New Aug 2026' },
      { id: 'onl_mkp_lead', title: 'MKP. Leader', nickname: 'New Dec 2028', x: 285, y: 440, width: 95, status: 'new_hire', customLabel: 'New Dec 2028' },
      { id: 'onl_mkp_exe1', title: 'MKP Executive -SP/TK', nickname: 'Hảo', x: 285, y: 485, width: 95 },
      { id: 'onl_mkp_coord', title: 'Ecom Coordinator', nickname: 'New Jan 2029', x: 285, y: 530, width: 95, status: 'new_hire', customLabel: 'New Jan 2029' },
      { id: 'onl_mkp_exe2', title: 'MKP Executive', nickname: 'New Aug 2026', x: 285, y: 575, width: 95, status: 'new_hire', customLabel: 'New Aug 2026' },
      // Digital
      { id: 'onl_mkt_nam', title: 'Sr. Digital MKT', nickname: 'Nam', x: 390, y: 375, width: 95 },
      { id: 'onl_des1', title: 'Designer', nickname: 'Ngan', x: 390, y: 425, width: 95 },
      { id: 'onl_des2', title: 'Designer', nickname: 'Hùng', x: 390, y: 475, width: 95 },
      // Performance Analysis
      { id: 'onl_perf_analyst', title: 'Ecom. Perf. Analyst', nickname: 'Linh', x: 495, y: 305, width: 105 },
      // Omnichannel
      { id: 'onl_omni_mgr', title: 'Omni OPS & Production Manager', nickname: 'Quyên - ICDP', x: 620, y: 305, width: 130, reportsToId: 'onl_head' },
      { id: 'onl_op_phuc', title: 'Ecom. Operator', nickname: 'Phúc', x: 570, y: 375, width: 95 },
      { id: 'onl_op_an', title: 'Ecom. Operator', nickname: 'Ẩn', x: 570, y: 425, width: 95 },
      { id: 'onl_op_nguyen', title: 'Ecom. Operator', nickname: 'Nguyên-ML Huyn', x: 570, y: 475, width: 95 },
      { id: 'onl_op_vy', title: 'Ecom. Operator cum Admin', nickname: 'Vy', x: 570, y: 525, width: 95 },
      { id: 'onl_cont_chau', title: 'Product Content', nickname: 'Châu', x: 675, y: 375, width: 95 },
      { id: 'onl_cont_phong', title: 'Pro. Photo Editor', nickname: 'Phong', x: 675, y: 425, width: 95 },
      { id: 'onl_cont_ngan', title: 'Product Content', nickname: 'Ngân', x: 675, y: 475, width: 95 },
      { id: 'onl_cont_thy', title: 'Product Content', nickname: 'Thy', x: 675, y: 525, width: 95 },
      // Digital Platform
      { id: 'onl_plat_mgr', title: 'Dig. Platform Mgr.', nickname: 'Đức', x: 820, y: 305, width: 120, reportsToId: 'onl_head' },
      { id: 'onl_lead_app', title: 'Product Leader', nickname: 'New Sep 2027', x: 770, y: 375, width: 95, status: 'new_hire', customLabel: 'New Sep 2027' },
      { id: 'onl_po_app', title: 'Product Owner', nickname: 'New Sep 2027', x: 770, y: 425, width: 95, status: 'new_hire', customLabel: 'New Sep 2027' },
      { id: 'onl_po_ssp', title: 'Prod. Owner SSP', nickname: 'Vy', x: 875, y: 375, width: 95 },
      { id: 'onl_po_mono', title: 'Prod. Owner Mono', nickname: 'Trang', x: 875, y: 425, width: 95 },
      { id: 'onl_uiux', title: 'UIUX Design- SSP', nickname: 'Trúc', x: 875, y: 475, width: 95 }
    ],
    indirectLinks: []
  },

  // 11. OPERATIONS SPORTS (Page 9)
  operations_sports: {
    key: 'operations_sports',
    divisionNames: ['operations - sports', 'operations'],
    slideTitle: 'OPERATIONS SPORTS',
    headcount3Y: [
      { year: 'HC', b2026: 13, e2026: 12, y2027: 13, y2028: 13, y2029: 14, detail: 'Transferred 01 OPS Admin to CRV; 01 DM (2027), 01 DM (2029)' }
    ],
    leaders: [
      { id: 'ops_head', title: 'Head of Operations', nickname: 'Thi', flags: ['VN_STAR'], x: 480, y: 195, width: 135, height: 44 }
    ],
    pillarPills: [
      { id: 'pill_ops_main', label: 'Operations', x: 210, y: 260, width: 120 },
      { id: 'pill_ops_event', label: 'Event/ Clearance', x: 420, y: 260, width: 120 },
      { id: 'pill_ops_excel', label: 'Ops Excellence', x: 620, y: 260, width: 120 },
      { id: 'pill_ops_admin', label: 'Admin', x: 820, y: 260, width: 120 }
    ],
    cards: [
      // Operations
      { id: 'ops_ivan', title: 'Retail Ops & Academy Mgr.', nickname: 'Ivan', x: 210, y: 305, width: 125, reportsToId: 'ops_head' },
      { id: 'ops_dm_new1', title: 'DM', nickname: 'New Jan 2027', x: 100, y: 380, width: 95, status: 'new_hire', customLabel: 'New Jan 2027' },
      { id: 'ops_dm_new2', title: 'DM', nickname: 'New Jan 2029', x: 100, y: 430, width: 95, status: 'new_hire', customLabel: 'New Jan 2029' },
      { id: 'ops_dm_nam', title: 'Sr. DM-North', nickname: 'Nam', x: 205, y: 380, width: 95 },
      { id: 'ops_dm_viet', title: 'DM – North', nickname: 'Viet', x: 205, y: 440, width: 95 },
      { id: 'ops_train_kevin', title: 'Training Sup.', nickname: 'Kevin', x: 310, y: 380, width: 95 },
      { id: 'ops_trainer_max', title: 'Trainer –N', nickname: 'Max', x: 310, y: 430, width: 95 },
      // Event
      { id: 'ops_nhon', title: 'Event Mgr.', nickname: 'Nhơn', x: 420, y: 305, width: 120, reportsToId: 'ops_head' },
      // Ops Excellence
      { id: 'ops_bee', title: 'Retail OPS Excellence Mgr.', nickname: 'Bee', x: 620, y: 305, width: 125, reportsToId: 'ops_head' },
      // Admin
      { id: 'ops_admin_maya', title: 'Admin Sup. - S', nickname: 'Maya', x: 820, y: 305, width: 120, reportsToId: 'ops_head' },
      { id: 'ops_admin_hoan', title: 'Sr. Admin - N', nickname: 'Hoan', x: 820, y: 380, width: 120 },
      { id: 'ops_admin_nguyen', title: 'Admin - S', nickname: 'Nguyên', x: 820, y: 430, width: 120 },
      { id: 'ops_admin_anh', title: 'Admin - S', nickname: 'Hoàng Anh', x: 820, y: 480, width: 120 }
    ],
    indirectLinks: []
  },

  // 12. MARKETING SPORTS (Page 10)
  marketing_sports: {
    key: 'marketing_sports',
    divisionNames: ['marketing - sports'],
    slideTitle: 'MARKETING SPORTS',
    headcount3Y: [
      { year: 'HC', b2026: 17, e2026: 18, y2027: 19, y2028: 20, y2029: 21, detail: '01 Social Leader, 01 CS Executive (2027), 01 CS Executive (2028), 01 CS Executive (2029)' }
    ],
    leaders: [
      { id: 'mkt_sports_head', title: 'Senior Marketing Manager', nickname: 'Stella', flags: ['VN_STAR'], x: 480, y: 195, width: 140, height: 44 }
    ],
    pillarPills: [
      { id: 'pill_mkt_ssp', label: 'Supersports', x: 230, y: 260, width: 120 },
      { id: 'pill_mkt_ssp_dl', label: 'Supersports – D&L - Hoka', x: 480, y: 260, width: 140 },
      { id: 'pill_mkt_cs', label: 'Customer Service', x: 740, y: 260, width: 130 }
    ],
    cards: [
      // Supersports
      { id: 'mkt_tien', title: 'Dig. MKT Leader', nickname: 'Tiên', x: 175, y: 310, width: 100, reportsToId: 'mkt_sports_head' },
      { id: 'mkt_tuan', title: 'Partner Leader', nickname: 'Tuân', x: 285, y: 310, width: 100, reportsToId: 'mkt_sports_head' },
      { id: 'mkt_han', title: 'Partner Executive', nickname: 'Han', x: 285, y: 360, width: 100, reportsToId: 'mkt_tuan' },
      // Social
      { id: 'mkt_social_lead', title: 'Social Leader', nickname: 'New July 2026', x: 480, y: 310, width: 110, status: 'new_hire', customLabel: 'New July 2026', reportsToId: 'mkt_sports_head' },
      { id: 'mkt_content_nhi', title: 'Content & PR Exe.', nickname: 'Nhi', x: 480, y: 360, width: 110, reportsToId: 'mkt_social_lead' },
      { id: 'mkt_design_hong', title: 'Design Leader', nickname: 'Hồng', x: 480, y: 410, width: 110, reportsToId: 'mkt_social_lead' },
      { id: 'mkt_motion', title: 'Motion Designer', nickname: 'Tường', x: 480, y: 460, width: 110, reportsToId: 'mkt_social_lead' },
      // Customer Service
      { id: 'cs_giang', title: 'CS Team Leader', nickname: 'Giang', x: 740, y: 310, width: 125, reportsToId: 'mkt_sports_head' },
      { id: 'cs_ngan', title: 'Customer Exp.', nickname: 'Ngân', x: 675, y: 380, width: 100, reportsToId: 'cs_giang' },
      { id: 'cs_nhi', title: 'CS Exe.', nickname: 'Nhi', x: 785, y: 380, width: 95 },
      { id: 'cs_thuy', title: 'CSE', nickname: 'Thùy', x: 785, y: 425, width: 95 },
      { id: 'cs_huyen', title: 'CSE', nickname: 'Huyen-6-Jul', x: 785, y: 470, width: 95 },
      { id: 'cs_hien', title: 'CSE', nickname: 'Hiền', x: 785, y: 515, width: 95 },
      { id: 'cs_rep1', title: 'CSE', nickname: 'Replace', x: 785, y: 560, width: 95, status: 'replace', customLabel: 'Replace' },
      { id: 'cs_tien', title: 'CSE', nickname: 'Tiên', x: 785, y: 605, width: 95 },
      { id: 'cs_rep2', title: 'CSE', nickname: 'Replace', x: 785, y: 650, width: 95, status: 'replace', customLabel: 'Replace' },
      { id: 'cs_hao', title: 'CSE', nickname: 'Hảo', x: 785, y: 695, width: 95 },
      { id: 'cs_new1', title: 'CSE', nickname: 'New Apr 2027', x: 785, y: 740, width: 95, status: 'new_hire', customLabel: 'New Apr 2027' },
      { id: 'cs_new2', title: 'CSE', nickname: 'New Apr 2028', x: 785, y: 785, width: 95, status: 'new_hire', customLabel: 'New Apr 2028' },
      { id: 'cs_new3', title: 'CSE', nickname: 'New Apr 2029', x: 785, y: 830, width: 95, status: 'new_hire', customLabel: 'New Apr 2029' }
    ],
    indirectLinks: []
  },

  // 13. EXECUTIVE / COE (Page 12)
  executive: {
    key: 'executive',
    divisionNames: ['executive', 'cbs shared coe’s', 'bd', 'wholesale', 'store expansion', 'project'],
    slideTitle: 'Executive, BD, WS, Store Expansion, Project',
    headcount3Y: [
      { year: 'HC', b2026: 12, e2026: 12, y2027: 12, y2028: 14, y2029: 14, detail: '01 Wholesale Exe. (2028), 01 Store Expan. Exe. (2028)' }
    ],
    leaders: [],
    pillarPills: [
      { id: 'pill_bd', label: 'BD', x: 140, y: 260, width: 110 },
      { id: 'pill_ceo_office', label: 'CEO Office', x: 290, y: 260, width: 110 },
      { id: 'pill_ws', label: 'Wholesale', x: 440, y: 260, width: 110 },
      { id: 'pill_store_exp', label: 'Store Expansion', x: 590, y: 260, width: 120 },
      { id: 'pill_proj', label: 'Project', x: 750, y: 260, width: 120 }
    ],
    cards: [
      // BD
      { id: 'bd_rachel', title: 'BD Manager', nickname: 'Rachel', x: 140, y: 305, width: 110 },
      { id: 'bd_lan_anh', title: 'BD Executive', nickname: 'Lan Anh', x: 140, y: 380, width: 110, reportsToId: 'bd_rachel' },
      // CEO Office
      { id: 'ceo_my', title: 'Exe. Assistant', nickname: 'Mỹ', x: 290, y: 305, width: 110 },
      // Wholesale
      { id: 'ws_amy', title: 'Wholesale Mgr.', nickname: 'Amy', x: 440, y: 305, width: 110 },
      { id: 'ws_quang', title: 'Sr. Wholesale Exe.', nickname: 'Quang', x: 440, y: 380, width: 110, reportsToId: 'ws_amy' },
      { id: 'ws_new', title: 'Wholesale Exe.', nickname: 'New Aug 2028', x: 440, y: 430, width: 110, status: 'new_hire', customLabel: 'New Aug 2028' },
      // Store Expansion
      { id: 'exp_hayley', title: 'Store Expansion Mgr.', nickname: 'Hayley', x: 590, y: 305, width: 120 },
      { id: 'exp_duyen', title: 'Store Expansion Exe.', nickname: 'Duyen', x: 590, y: 380, width: 120, reportsToId: 'exp_hayley' },
      { id: 'exp_new', title: 'Store Expansion Exe.', nickname: 'New Apr 2028', x: 590, y: 430, width: 120, status: 'new_hire', customLabel: 'New Apr 2028' },
      // Project
      { id: 'proj_khoa', title: 'Senior Mgr., D&C', nickname: 'Khoa', x: 750, y: 305, width: 120 },
      { id: 'proj_thuy', title: 'Project Admin', nickname: 'Thùy', x: 700, y: 380, width: 100, reportsToId: 'proj_khoa' },
      { id: 'proj_tuan', title: 'Project Sup. - N', nickname: 'Tuấn', x: 810, y: 380, width: 100, reportsToId: 'proj_khoa' },
      { id: 'proj_thien', title: 'Project Sup. - S', nickname: 'Thien', x: 810, y: 430, width: 100, reportsToId: 'proj_khoa' }
    ],
    indirectLinks: []
  }
};

/**
 * Helper to find the matching blueprint for a given division name
 */
export function getBlueprintForDivision(divisionName: string): DepartmentBlueprint | null {
  const norm = (divisionName || '').toLowerCase().trim();
  for (const bp of Object.values(DEPARTMENT_BLUEPRINTS)) {
    if (bp.divisionNames.some(d => norm.includes(d) || d.includes(norm))) {
      return bp;
    }
  }
  return null;
}
