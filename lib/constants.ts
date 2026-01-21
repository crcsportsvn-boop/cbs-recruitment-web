export const RECRUITMENT_SOURCES = [
  "TopCV",
  "LinkedIn",
  "Facebook Ads",
  "Facebook",
  "Network",
  "Referal",
  "Headhunt",
  "Vietnamworks",
  "Email",
  "Internal",
  "Chotot",
  "Ops/Office",
  "Talent pool",
  "Lead form",
  "Others",
] as const;

export type RecruitmentSource = (typeof RECRUITMENT_SOURCES)[number];

export interface JobPosition {
  id: string; // The Job Code e.g., "HO-000173"
  positionId: string; // The specific position ID e.g., "NYS-DYS-HO-135-310"
  name: string; // Display name e.g., "Marketing Executive"
  requirements: string[]; // Auto-filled requirements
}

// Initial mock data as requested. In production, this might come from a DB.
export const ACTIVE_JOBS: JobPosition[] = [
  {
    id: "HO-000173",
    positionId: "NYS-DYS-HO-135-310",
    name: "Marketing Executive",
    requirements: [
      "Kinh nghiệm CRM",
      "Kỹ năng báo cáo",
      "Làm việc tại Hồ Chí Minh",
    ],
  },
  {
    id: "HO-000174",
    positionId: "SALES-MAN-001",
    name: "Sales Manager",
    requirements: [
      "5 năm kinh nghiệm quản lý",
      "Tiếng Anh giao tiếp tốt",
      "Chịu được áp lực cao",
    ],
  },
  {
    id: "ST-000055",
    positionId: "STORE-MGR-055",
    name: "Cửa hàng trưởng (Store Manager)",
    requirements: [
      "Kinh nghiệm bán lẻ thời trang",
      "Quản lý đội nhóm >10 người",
      "Làm xoay ca",
    ],
  },
];
