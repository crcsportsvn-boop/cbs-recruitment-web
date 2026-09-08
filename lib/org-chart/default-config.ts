import { VirtualLeader, IndirectLink, NodeFlag } from '@/types/org-chart';

/**
 * Built-in Regional & Virtual Leaders
 * Extracted from Central Retail C-Suite / Regional structures
 */
export const DEFAULT_VIRTUAL_LEADERS: VirtualLeader[] = [
  {
    code: 'THL_BU_PRES_CMG',
    title: 'BU President CMG THL',
    nickname: 'Damien',
    flags: ['MY', 'TH', 'VN'],
    reportsToCode: '',
    divisionScope: 'CMG Thailand Group'
  },
  {
    code: 'THL_BU_PRES_CRC',
    title: 'BU President CRC Sports THL',
    nickname: 'Alex',
    flags: ['MY', 'TH', 'VN'],
    reportsToCode: '',
    divisionScope: 'CRC Sports Thailand'
  },
  {
    code: 'VN_BU_PRES',
    title: 'BU President CBS VN',
    nickname: 'Andrew F.',
    flags: ['VN'],
    reportsToCode: '',
    divisionScope: 'CBS Vietnam'
  },
  {
    code: 'THL_CAT_TECH_BEAUTY',
    title: 'Category Head Tech & Beauty',
    nickname: 'K Pavi',
    flags: ['TH', 'VN'],
    reportsToCode: 'THL_BU_PRES_CMG',
    divisionScope: 'Tech & Beauty Category'
  },
  {
    code: 'THL_CAT_FASHION',
    title: 'Category Head Fashion',
    nickname: 'K Joyce',
    flags: ['TH', 'VN'],
    reportsToCode: 'THL_BU_PRES_CMG',
    divisionScope: 'Fashion Category'
  },
  {
    code: 'THL_REG_DYSON',
    title: 'Regional Head of Dyson',
    nickname: 'K Ming',
    flags: ['MY', 'TH', 'VN'],
    reportsToCode: 'THL_CAT_TECH_BEAUTY',
    divisionScope: 'Dyson Regional'
  },
  {
    code: 'THL_REG_FOOTWEAR',
    title: 'Regional Head of Footwear',
    nickname: 'Penny',
    flags: ['MY', 'TH', 'VN'],
    reportsToCode: 'THL_CAT_TECH_BEAUTY',
    divisionScope: 'Footwear Regional'
  },
  {
    code: 'THL_REG_HOKA',
    title: 'Regional Head of Hoka',
    nickname: 'Joel',
    flags: ['MY', 'TH', 'VN'],
    reportsToCode: 'THL_BU_PRES_CRC',
    divisionScope: 'Hoka Merchandise'
  },
  {
    code: 'THL_REG_MKT_HOKA',
    title: 'Regional Head of MKT - Hoka',
    nickname: 'Nino',
    flags: ['MY', 'TH', 'VN'],
    reportsToCode: 'THL_BU_PRES_CRC',
    divisionScope: 'Hoka Marketing'
  },
  {
    code: 'THL_REG_SPORTS_DL',
    title: 'Regional Head of Sports D&L Brands',
    nickname: 'Hermann',
    flags: ['MY', 'TH', 'VN'],
    reportsToCode: 'THL_BU_PRES_CRC',
    divisionScope: 'Sports D&L Regional'
  },
  {
    code: 'THL_DYSON_SC',
    title: 'Dyson THL - SC',
    nickname: '',
    flags: ['TH'],
    reportsToCode: 'THL_REG_DYSON',
    divisionScope: 'Service Center Support'
  },
  {
    code: 'CRV_GROUP_HR',
    title: 'Group HR Director',
    nickname: 'Thao',
    flags: ['VN'],
    reportsToCode: '',
    divisionScope: 'CRV Corporate HR'
  },
  {
    code: 'CRV_SUPPORTING_HEADS',
    title: 'Supporting Function Heads CRV',
    nickname: '',
    flags: ['VN'],
    reportsToCode: '',
    divisionScope: 'CRV Corporate Functions'
  }
];

/**
 * Built-in Indirect / Matrix Reporting lines (Single clean label)
 */
export const DEFAULT_INDIRECT_LINKS: IndirectLink[] = [
  {
    id: 'ind_pres_dyson',
    fromId: 'VN_BU_PRES',
    toId: 'SHO-DYS-114-117-050-1',
    label: 'Dotted Service / Admin'
  },
  {
    id: 'ind_pres_crocs',
    fromId: 'VN_BU_PRES',
    toId: 'SHO-CRO-015-014-049-1',
    label: ''
  },
  {
    id: 'ind_pres_hoka',
    fromId: 'VN_BU_PRES',
    toId: 'SHO-HOK-BM-01',
    label: ''
  },
  {
    id: 'ind_pres_sports',
    fromId: 'VN_BU_PRES',
    toId: 'SHO-MSD-191-206-073-1',
    label: ''
  },
  {
    id: 'ind_dyson_sc',
    fromId: 'THL_DYSON_SC',
    toId: 'SHO-DYS-111-114-122-1',
    label: 'Technical Support'
  }
];

/**
 * Supporting Functions & CRV Shared list for the right sidebar
 */
export const SUPPORTING_FUNCTIONS_SIDEBAR = [
  'Wholesale',
  'Store Expansion',
  'Planning - Database',
  'Operations',
  'HR',
  'Customer Service',
  'D&C',
  'Executive Team',
  'Finance'
];

export const CRV_SHARED_SITTING_IN_BU = [
  { title: 'IT Head', nickname: 'Luan' },
  { title: 'SCM Head', nickname: 'Oanh' },
  { title: 'Legal Head', nickname: 'Duong' }
];

export const BRAND_SUB_ITEMS: Record<string, string[]> = {
  'Crocs': ['Crocs', 'Matin Kim', 'Havaianas (tbc)'],
  'Dyson': ['Dyson'],
  'Hoka': ['Hoka'],
  'Sports Brands': ['UA', 'Columbia', 'Speedo', 'TNF'],
  'SSP': ['Teva', 'Boardriders', 'Reebok', 'Reef', 'Brooks']
};
