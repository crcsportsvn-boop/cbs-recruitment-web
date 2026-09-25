import { OrgNode } from '@/types/org-chart';

/**
 * Pre-seeded Office Nodes (201 records) extracted from CBS_Org_Chart.xlsm
 */
export const DEFAULT_OFFICE_NODES: OrgNode[] = [
  {
    "id": "SHO-CRO-015-014-049-1",
    "title": "Head of Crocs",
    "division": "Crocs",
    "dept": "Crocs",
    "subDept": "Crocs",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Phạm Ánh Ngọc",
    "nickname": "Nikki",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-095-032-2",
    "title": "Digital Marketing Executive",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Digital Marketing",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-095-106-1",
    "reportsToTitle": "Senior Digital Marketing Executive",
    "holderName": "Cao Thị Hồng Vân",
    "nickname": "Vân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-095-106-1",
    "title": "Senior Digital Marketing Executive",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Digital Marketing",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Lý Hoàng Hải An",
    "nickname": "An",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-124-038-1",
    "title": "Ecommerce Manager",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Ecommerce",
    "jobGrade": "15",
    "reportsToId": "SHO-CRO-015-014-049-1",
    "reportsToTitle": "Head of Crocs",
    "holderName": "Hoàng Thị Kim Thảo",
    "nickname": "Thảo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-148-030-1",
    "title": "Deputy Marketplace Manager",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Marketplace",
    "jobGrade": "13",
    "reportsToId": "SHO-CRO-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Nguyễn Hoài Thương",
    "nickname": "Zac",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-148-039-1",
    "title": "Ecommerce Operator",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-148-030-1",
    "reportsToTitle": "Deputy Marketplace Manager",
    "holderName": "Huỳnh Ngọc Ánh",
    "nickname": "Ánh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-148-039-2",
    "title": "Ecommerce Operator",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-148-030-1",
    "reportsToTitle": "Deputy Marketplace Manager",
    "holderName": "Nguyễn Ngọc Hân",
    "nickname": "Hân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-148-036-1",
    "title": "Ecommerce Executive",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-148-030-1",
    "reportsToTitle": "Deputy Marketplace Manager",
    "holderName": "Đỗ Hồng Minh Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-186-091-1",
    "title": "Product Owner",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Tech",
    "jobGrade": "12",
    "reportsToId": "SHO-CRO-121-199-031-1",
    "reportsToTitle": "Deputy Website Manager",
    "holderName": "Nguyễn Doãn Thông",
    "nickname": "Thông",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-199-031-1",
    "title": "Deputy Website Manager",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Website",
    "jobGrade": "13",
    "reportsToId": "SHO-CRO-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Nguyễn Thị Kim Nga",
    "nickname": "Nga",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-199-037-1",
    "title": "Ecommerce Executive",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Website",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-199-031-1",
    "reportsToTitle": "Deputy Website Manager",
    "holderName": "Lê Thanh Huy",
    "nickname": "Huy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-199-039-1",
    "title": "Ecommerce Operator",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Website",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-199-031-1",
    "reportsToTitle": "Deputy Website Manager",
    "holderName": "Phạm Thị Hồng Chi",
    "nickname": "Chi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-121-199-090-1",
    "title": "Product Content and Online Customer Retention Executive",
    "division": "Crocs",
    "dept": "Ecommerce",
    "subDept": "Website",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-121-199-031-1",
    "reportsToTitle": "Deputy Website Manager",
    "holderName": "Dương Thị Thảo Vân",
    "nickname": "Vân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-145-147-073-1",
    "title": "Marketing Manager",
    "division": "Crocs",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-015-014-049-1",
    "reportsToTitle": "Head of Crocs",
    "holderName": "Bùi Lan Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-145-147-048-1",
    "title": "Graphic Designer",
    "division": "Crocs",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Nguyễn Dương Quỳnh Chi",
    "nickname": "Chi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-145-187-072-1",
    "title": "Marketing Executive",
    "division": "Crocs",
    "dept": "Marketing",
    "subDept": "Trade",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Nguyễn Vân Hà",
    "nickname": "Hannah",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-145-187-022-1",
    "title": "Content & PR Executive",
    "division": "Crocs",
    "dept": "Marketing",
    "subDept": "Trade",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Trần Đỗ Vy Uyển",
    "nickname": "Uyển",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-145-187-071-1",
    "title": "Marketing Admin",
    "division": "Crocs",
    "dept": "Marketing",
    "subDept": "Trade",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Trần Nguyên Phúc",
    "nickname": "Phúc",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-149-157-084-1",
    "title": "Operations Manager",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "15",
    "reportsToId": "SHO-CRO-015-014-049-1",
    "reportsToTitle": "Head of Crocs",
    "holderName": "Phan Trần Thùy Dung",
    "nickname": "Jen",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-149-157-035-3",
    "title": "District Manager",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-149-157-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-CRO-149-157-107-2",
    "title": "Senior District Manager",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-149-157-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Lê Thị Thùy Trang",
    "nickname": "Hellen",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-CRO-149-157-107-1",
    "title": "Senior District Manager",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-149-157-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Đỗ Thu Quỳnh",
    "nickname": "Vivian",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-149-157-035-2",
    "title": "District Manager",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-149-157-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Nguyễn Trần Thùy Trang",
    "nickname": "Tamie",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-CRO-149-157-035-1",
    "title": "District Manager",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "13",
    "reportsToId": "SHO-CRO-149-157-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Nguyễn Thị Nhàn",
    "nickname": "Nhàn",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-149-157-139-1",
    "title": "Training Specialist",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-149-188-138-1",
    "reportsToTitle": "Training Manager",
    "holderName": "Mai Thùy Trang",
    "nickname": "Trang",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-149-188-138-1",
    "title": "Training Manager",
    "division": "Crocs",
    "dept": "Operations",
    "subDept": "Training",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-149-157-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-CRO-152-149-104-1",
    "title": "Senior Buyer",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Merchandise",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-152-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Võ Thị Quỳnh Nhi",
    "nickname": "Anne",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-152-160-010-1",
    "title": "Brand Manager",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Product",
    "jobGrade": "15",
    "reportsToId": "SHO-CRO-015-014-049-1",
    "reportsToTitle": "Head of Crocs",
    "holderName": "Vũ Phương Thảo",
    "nickname": "Thảo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-152-160-077-3",
    "title": "Merchandise Assistant",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Product",
    "jobGrade": "12",
    "reportsToId": "SHO-CRO-152-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Lý Hà Thương",
    "nickname": "Thương",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-152-160-077-2",
    "title": "Merchandise Assistant",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Product",
    "jobGrade": "12",
    "reportsToId": "SHO-CRO-152-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Phạm Nhật Mai",
    "nickname": "Mai",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-152-160-077-1",
    "title": "Merchandise Assistant",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Product",
    "jobGrade": "12",
    "reportsToId": "SHO-CRO-152-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Lê Thị Thanh Hà",
    "nickname": "Hà",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-152-197-145-1",
    "title": "Visual Merchandise Manager",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Visual Merchandise",
    "jobGrade": "14",
    "reportsToId": "SHO-CRO-152-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Phạm Hà Vũ Hưng",
    "nickname": "Hưng",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-CRO-152-197-121-1",
    "title": "Senior Visual Merchandise Executive",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Visual Merchandise",
    "jobGrade": "12",
    "reportsToId": "SHO-CRO-152-197-145-1",
    "reportsToTitle": "Visual Merchandise Manager",
    "holderName": "Đoàn Trúc Linh",
    "nickname": "Linh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-CRO-152-197-121-2",
    "title": "Visual Merchandise Executive",
    "division": "Crocs",
    "dept": "Product",
    "subDept": "Visual Merchandise",
    "jobGrade": "11",
    "reportsToId": "SHO-CRO-152-197-145-1",
    "reportsToTitle": "Visual Merchandise Manager",
    "holderName": "Phan Tấn Thanh",
    "nickname": "Thanh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-002-003-067-1",
    "title": "Key Account Manager",
    "division": "Dyson Viet Nam",
    "dept": "B2B",
    "subDept": "B2B",
    "jobGrade": "15",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Nguyễn Thị Thủy",
    "nickname": "Thủy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-002-003-065-1",
    "title": "Key Account Admin",
    "division": "Dyson Viet Nam",
    "dept": "B2B",
    "subDept": "B2B",
    "jobGrade": "8",
    "reportsToId": "SHO-DYS-002-003-067-1",
    "reportsToTitle": "Key Account Manager",
    "holderName": "Huỳnh Hải Phượng",
    "nickname": "Phượng",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-111-114-122-1",
    "title": "Service Center Manager",
    "division": "Dyson Viet Nam",
    "dept": "Dyson Service Center",
    "subDept": "Dyson Service Center",
    "jobGrade": "14",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Phan Vạn Phúc",
    "nickname": "Phúc",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-111-114-007-1",
    "title": "Assistant Service Center Manager",
    "division": "Dyson Viet Nam",
    "dept": "Dyson Service Center",
    "subDept": "Dyson Service Center",
    "jobGrade": "13",
    "reportsToId": "SHO-DYS-111-114-122-1",
    "reportsToTitle": "Service Center Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-DYS-111-114-118-1",
    "title": "Senior Technician",
    "division": "Dyson Viet Nam",
    "dept": "Dyson Service Center",
    "subDept": "Dyson Service Center",
    "jobGrade": "12",
    "reportsToId": "SHO-DYS-111-114-007-1",
    "reportsToTitle": "Assistant Service Center Manager",
    "holderName": "Nguyễn Hữu Thiện",
    "nickname": "Thiện",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-111-114-123-1",
    "title": "Spare Parts Inventory  Executive",
    "division": "Dyson Viet Nam",
    "dept": "Dyson Service Center",
    "subDept": "Dyson Service Center",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-111-114-122-1",
    "reportsToTitle": "Service Center Manager",
    "holderName": "Trương Công Nhật Huy",
    "nickname": "Huy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-111-114-102-2",
    "title": "SC Operations Executive",
    "division": "Dyson Viet Nam",
    "dept": "Dyson Service Center",
    "subDept": "Dyson Service Center",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-111-114-007-1",
    "reportsToTitle": "Assistant Service Center Manager",
    "holderName": "Lê Ngọc Minh Nhi",
    "nickname": "Nhi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-111-114-102-1",
    "title": "SC Operations Executive",
    "division": "Dyson Viet Nam",
    "dept": "Dyson Service Center",
    "subDept": "Dyson Service Center",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-111-114-007-1",
    "reportsToTitle": "Assistant Service Center Manager",
    "holderName": "Vũ Nguyễn Anh Thư",
    "nickname": "Thư",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-114-117-050-1",
    "title": "Head of Dyson",
    "division": "Dyson Viet Nam",
    "dept": "Dyson Viet Nam",
    "subDept": "Dyson Viet Nam",
    "jobGrade": "19",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Nguyễn Việt Anh",
    "nickname": "Andy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-145-091-105-1",
    "title": "Senior CRM Executive",
    "division": "Dyson Viet Nam",
    "dept": "Marketing",
    "subDept": "Customer Services",
    "jobGrade": "12",
    "reportsToId": "SHO-DYS-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Trần Thị Nhụy Vi",
    "nickname": "Vi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-145-147-073-1",
    "title": "Marketing Manager",
    "division": "Dyson Viet Nam",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "14",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Nguyễn Anh Thư",
    "nickname": "Thư",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-145-187-109-1",
    "title": "Senior Marketing Executive",
    "division": "Dyson Viet Nam",
    "dept": "Marketing",
    "subDept": "Trade",
    "jobGrade": "12",
    "reportsToId": "SHO-DYS-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Trần Thị Thanh Thùy",
    "nickname": "Thùy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-145-187-072-1",
    "title": "Marketing Executive",
    "division": "Dyson Viet Nam",
    "dept": "Marketing",
    "subDept": "Trade",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Nguyễn Lê Thúy Hiền",
    "nickname": "Hiền",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-145-187-137-1",
    "title": "Trade Marketing Executive",
    "division": "Dyson Viet Nam",
    "dept": "Marketing",
    "subDept": "Trade",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-145-147-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Nguyễn Thị Thiên Thảo",
    "nickname": "Thảo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-146-149-070-1",
    "title": "Manager, Merchandise & Category Management",
    "division": "Dyson Viet Nam",
    "dept": "Merchandise",
    "subDept": "Merchandise",
    "jobGrade": "14",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Nguyễn Thị Hằng",
    "nickname": "Hằng",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-146-149-110-1",
    "title": "Senior Merchandise Executive",
    "division": "Dyson Viet Nam",
    "dept": "Merchandise",
    "subDept": "Merchandise",
    "jobGrade": "13",
    "reportsToId": "SHO-DYS-146-149-070-1",
    "reportsToTitle": "Manager, Merchandise & Category Management",
    "holderName": "Phạm Hoàng Anh",
    "nickname": "Aeron",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-146-149-078-1",
    "title": "Merchandise Executive",
    "division": "Dyson Viet Nam",
    "dept": "Merchandise",
    "subDept": "Merchandise",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-146-149-070-1",
    "reportsToTitle": "Manager, Merchandise & Category Management",
    "holderName": "Lê Thị Mỹ Phụng",
    "nickname": "Phụng",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-152-066-1",
    "title": "Key Account Executive",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Offline/3P",
    "jobGrade": "11",
    "reportsToId": "NHO-DYS-155-151-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Lê Nhật Minh",
    "nickname": "Minh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-153-100-1",
    "title": "Sales Admin",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Offline/Admin",
    "jobGrade": "11",
    "reportsToId": "NHO-DYS-155-151-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Võ Phương Thùy Linh",
    "nickname": "Linh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-151-056-2",
    "title": "Head of Sales & Operations",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Offline/Operations",
    "jobGrade": "16",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "NHO-DYS-155-151-094-2",
    "title": "Senior District Manager",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Offline/Operations",
    "jobGrade": "14",
    "reportsToId": "SHO-DYS-155-151-056-2",
    "reportsToTitle": "Head of Sales & Operations",
    "holderName": "Nguyễn Thị Hạnh",
    "nickname": "Hạnh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-DYS-155-151-035-3",
    "title": "District Manager",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Offline/Operations",
    "jobGrade": "14",
    "reportsToId": "NHO-DYS-155-151-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Trịnh Minh Quân",
    "nickname": "Ryan",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-151-035-2",
    "title": "District Manager",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Offline/Operations",
    "jobGrade": "14",
    "reportsToId": "NHO-DYS-155-151-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Hứa Vĩnh Thành",
    "nickname": "Thành",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-151-035-1",
    "title": "District Manager",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Offline/Operations",
    "jobGrade": "14",
    "reportsToId": "NHO-DYS-155-151-084-1",
    "reportsToTitle": "Operations Manager",
    "holderName": "Nguyễn Ngọc Lan Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-154-038-1",
    "title": "Ecommerce Manager",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Online",
    "jobGrade": "14",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Huỳnh Thị Yến Nhi",
    "nickname": "Nhi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-155-108-1",
    "title": "Senior Ecommerce Executive",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Online/Marketplace",
    "jobGrade": "12",
    "reportsToId": "SHO-DYS-155-154-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Vũ Minh Tú",
    "nickname": "Tú",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-155-136-1",
    "title": "Streaming Talent",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Online/Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-155-154-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-DYS-155-155-037-1",
    "title": "Ecommerce Executive",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Online/Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-155-154-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Võ Thị Phương Huyền",
    "nickname": "Huyền",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-156-036-1",
    "title": "Ecommerce Coordinator",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Online/Website",
    "jobGrade": "12",
    "reportsToId": "SHO-DYS-155-154-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Mai Hữu Khải",
    "nickname": "Khải",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-156-037-2",
    "title": "Ecommerce Executive",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Online/Website",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-155-154-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Nguyễn Thị Hồng Ngân",
    "nickname": "Ngân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-155-156-037-1",
    "title": "Ecommerce Executive",
    "division": "Dyson Viet Nam",
    "dept": "Sales & Operations",
    "subDept": "Online/Website",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-155-154-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Vũ Minh Khôi",
    "nickname": "Khôi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-175-188-119-1",
    "title": "Senior Training Manager",
    "division": "Dyson Viet Nam",
    "dept": "Training",
    "subDept": "Training",
    "jobGrade": "15",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-DYS-184-197-146-1",
    "title": "Visual Merchandise Manager",
    "division": "Dyson Viet Nam",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "14",
    "reportsToId": "SHO-DYS-114-117-050-1",
    "reportsToTitle": "Head of Dyson",
    "holderName": "Nguyễn Thị Hồng Ngọc",
    "nickname": "Ngọc",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-DYS-184-197-048-1",
    "title": "Graphic Designer",
    "division": "Dyson Viet Nam",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "11",
    "reportsToId": "SHO-DYS-184-197-146-1",
    "reportsToTitle": "Visual Merchandise Team Leader",
    "holderName": "Nguyễn Kiều My",
    "nickname": "My",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-EXE-005-004-167-1",
    "title": "Business Development Manager",
    "division": "Executive Team",
    "dept": "Business Development & Strategy",
    "subDept": "Business Development & Strategy",
    "jobGrade": "14",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Nguyễn Thị Hiền Thục",
    "nickname": "Rachel",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-EXE-005-004-012-1",
    "title": "Business Development & Strategy Executive",
    "division": "Executive Team",
    "dept": "Business Development & Strategy",
    "subDept": "Business Development & Strategy",
    "jobGrade": "12",
    "reportsToId": "SHO-EXE-005-004-013-2",
    "reportsToTitle": "Business Development & Strategy Manager",
    "holderName": "Nguyễn Ngọc Lan Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-EXE-125-007-043-1",
    "title": "Executive Assistant",
    "division": "Executive Team",
    "dept": "Executive Team",
    "subDept": "CEO Office",
    "jobGrade": "13",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Bùi Quang Thiện Mỹ",
    "nickname": "Mỹ",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-EXE-125-128-089-1",
    "title": "President, CRC Sports VN",
    "division": "Executive Team",
    "dept": "Executive Team",
    "subDept": "Executive Team",
    "jobGrade": "21",
    "reportsToId": "",
    "reportsToTitle": "",
    "holderName": "Andrew Robert Fairall",
    "nickname": "Andrew",
    "flags": [
      "VN_STAR"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FIN-126-129-168-1",
    "title": "BI Analyst",
    "division": "Finance",
    "dept": "FP&A CMG",
    "subDept": "BI",
    "jobGrade": "13",
    "reportsToId": "SHO-FIN-126-129-011-1",
    "reportsToTitle": "Business Controller",
    "holderName": "Lê Trung Tín",
    "nickname": "Tín",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FIN-120-123-045-1",
    "title": "Financial Planning & Analysis Manager",
    "division": "Finance",
    "dept": "FP&A CMG",
    "subDept": "FP&A CMG",
    "jobGrade": "15",
    "reportsToId": "SHO-FIN-126-129-011-1",
    "reportsToTitle": "Business Controller",
    "holderName": "Phan Nguyễn Kỳ Duyên",
    "nickname": "Duyên",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FIN-120-123-044-1",
    "title": "Financial Planning & Analysis Executive",
    "division": "Finance",
    "dept": "FP&A CMG",
    "subDept": "FP&A CMG",
    "jobGrade": "11",
    "reportsToId": "SHO-FIN-120-123-045-1",
    "reportsToTitle": "Financial Planning & Analysis Manager",
    "holderName": "Nguyễn Lâm Thanh Huyền",
    "nickname": "Huyền",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FIN-160-169-045-2",
    "title": "Financial Planning & Analysis Manager",
    "division": "Finance",
    "dept": "FP&A Sports",
    "subDept": "FP&A Sports",
    "jobGrade": "15",
    "reportsToId": "SHO-FIN-126-129-011-1",
    "reportsToTitle": "Business Controller",
    "holderName": "Lê Thị Bích Tuyền",
    "nickname": "Tuyền",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FIN-160-169-044-2",
    "title": "Senior Financial Planning & Analysis Executive",
    "division": "Finance",
    "dept": "FP&A Sports",
    "subDept": "FP&A Sports",
    "jobGrade": "11",
    "reportsToId": "SHO-FIN-126-129-011-1",
    "reportsToTitle": "Business Controller",
    "holderName": "Nguyễn Hoàng Dư",
    "nickname": "Dư",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FIN-142-145-064-2",
    "title": "Inventory Checker",
    "division": "Finance",
    "dept": "FP&A Sports",
    "subDept": "Inventory Check",
    "jobGrade": "10",
    "reportsToId": "SHO-FIN-160-169-045-1",
    "reportsToTitle": "Financial Planning & Analysis Manager",
    "holderName": "Nguyễn Hoài Thương",
    "nickname": "Thương",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-FIN-142-145-064-1",
    "title": "Inventory Checker",
    "division": "Finance",
    "dept": "FP&A Sports",
    "subDept": "Inventory Check",
    "jobGrade": "10",
    "reportsToId": "SHO-FIN-120-123-045-1",
    "reportsToTitle": "Financial Planning & Analysis Manager",
    "holderName": "Nguyễn Thị Mừng",
    "nickname": "Mừng",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FIN-126-129-011-1",
    "title": "Business Controller",
    "division": "Finance",
    "dept": "Finance",
    "subDept": "Finance",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Nguyễn Huy Phước",
    "nickname": "Phước",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HOK-146-149-010-1",
    "title": "Brand Manager",
    "division": "HOKA",
    "dept": "Merchandise",
    "subDept": "Merchandise",
    "jobGrade": "15",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Đặng Công Lâm",
    "nickname": "Liam",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HOK-146-146-014-1",
    "title": "Buyer",
    "division": "HOKA",
    "dept": "Merchandise",
    "subDept": "Merchandise",
    "jobGrade": "13",
    "reportsToId": "SHO-HOK-146-149-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Nguyễn Cao Đăng Quang",
    "nickname": "Quang",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HOK-146-149-121-1",
    "title": "Senior Visual Merchandise Executive",
    "division": "HOKA",
    "dept": "Merchandise",
    "subDept": "Merchandise",
    "jobGrade": "11",
    "reportsToId": "SHO-HOK-146-149-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Huỳnh Ngọc Trang",
    "nickname": "Trang",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-006-001-005-1",
    "title": "Admin Executive",
    "division": "Human Resources",
    "dept": "Business Partner",
    "subDept": "Admin",
    "jobGrade": "11",
    "reportsToId": "SHO-HUM-141-144-046-1",
    "reportsToTitle": "GM Human Resources",
    "holderName": "Lê Ngọc Phương Anh",
    "nickname": "Phanh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-006-005-061-1",
    "title": "HRBP cum OD Manager",
    "division": "Human Resources",
    "dept": "Business Partner",
    "subDept": "Business Partner",
    "jobGrade": "15",
    "reportsToId": "SHO-HUM-141-144-046-1",
    "reportsToTitle": "GM Human Resources",
    "holderName": "Lê Văn Hưởng",
    "nickname": "Hugo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-006-185-062-1",
    "title": "HRBP cum OD Supervisor",
    "division": "Human Resources",
    "dept": "Business Partner",
    "subDept": "Talent Acquisition",
    "jobGrade": "14",
    "reportsToId": "SHO-HUM-006-005-061-1",
    "reportsToTitle": "HRBP cum OD Manager",
    "holderName": "Hồ Phi Nga",
    "nickname": "Nga",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-006-185-161-1",
    "title": "Talent Acquisition Supervisor",
    "division": "Human Resources",
    "dept": "Business Partner",
    "subDept": "Talent Acquisition",
    "jobGrade": "14",
    "reportsToId": "SHO-HUM-006-005-061-1",
    "reportsToTitle": "HRBP cum OD Manager",
    "holderName": "Đặng Nguyễn Vũ",
    "nickname": "Vũ",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-006-185-117-1",
    "title": "Senior Talent Acquisition Specialist",
    "division": "Human Resources",
    "dept": "Business Partner",
    "subDept": "Talent Acquisition",
    "jobGrade": "13",
    "reportsToId": "SHO-HUM-006-005-061-1",
    "reportsToTitle": "HRBP cum OD Manager",
    "holderName": "Nguyễn Nguyên",
    "nickname": "Wean",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-HUM-006-185-060-1",
    "title": "HR Officer",
    "division": "Human Resources",
    "dept": "Business Partner",
    "subDept": "Talent Acquisition",
    "jobGrade": "12",
    "reportsToId": "SHO-HUM-006-005-061-1",
    "reportsToTitle": "HRBP cum OD Manager",
    "holderName": "Trần Thị Phương Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-007-006-015-1",
    "title": "C&B Manager",
    "division": "Human Resources",
    "dept": "C&B",
    "subDept": "C&B",
    "jobGrade": "15",
    "reportsToId": "SHO-HUM-141-144-046-1",
    "reportsToTitle": "GM Human Resources",
    "holderName": "Phạm Lê Thúy Liểu",
    "nickname": "Liểu",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-007-006-016-2",
    "title": "C&B Specialist",
    "division": "Human Resources",
    "dept": "C&B",
    "subDept": "C&B",
    "jobGrade": "11",
    "reportsToId": "SHO-HUM-007-006-015-1",
    "reportsToTitle": "C&B Manager",
    "holderName": "Võ Thị Lệ Thiên",
    "nickname": "Thiên",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-007-006-016-1",
    "title": "C&B Specialist",
    "division": "Human Resources",
    "dept": "C&B",
    "subDept": "C&B",
    "jobGrade": "11",
    "reportsToId": "SHO-HUM-007-006-015-1",
    "reportsToTitle": "C&B Manager",
    "holderName": "Bùi Thị Thanh Tâm",
    "nickname": "Tâm",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-141-144-046-1",
    "title": "GM Human Resources",
    "division": "Human Resources",
    "dept": "Human Resources",
    "subDept": "Human Resources",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Lê Thị Thanh Vân",
    "nickname": "Vân",
    "flags": [
      "VN_STAR"
    ],
    "status": "active"
  },
  {
    "id": "SHO-HUM-141-144-059-1",
    "title": "HR Data Analyst",
    "division": "Human Resources",
    "dept": "Human Resources",
    "subDept": "Human Resources",
    "jobGrade": "14",
    "reportsToId": "SHO-HUM-141-144-046-1",
    "reportsToTitle": "GM Human Resources",
    "holderName": "Nguyễn Đình Sang",
    "nickname": "Sang",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-LEA-143-146-131-1",
    "title": "Store Expansion Manager",
    "division": "Leasing",
    "dept": "Leasing",
    "subDept": "Leasing",
    "jobGrade": "13",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-LEA-143-146-163-1",
    "title": "Store Expansion Executive",
    "division": "Leasing",
    "dept": "Leasing",
    "subDept": "Leasing",
    "jobGrade": "11",
    "reportsToId": "SHO-LEA-143-146-131-1",
    "reportsToTitle": "Store Expansion Manager",
    "holderName": "Đào Thị Duyên",
    "nickname": "Duyên",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-014-013-023-1",
    "title": "CRM Executive",
    "division": "Marketing",
    "dept": "CRM",
    "subDept": "CRM",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Nguyễn Hồng Gia Hân",
    "nickname": "Hân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-026-1",
    "title": "Customer Service Team Leader",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "13",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Phạm Hoài Giang",
    "nickname": "Gianna",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-6",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Phạm Nguyễn Mỹ Hiền",
    "nickname": "Hiền",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-7",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Ngô Gia Nhi",
    "nickname": "Nhi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-5",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Trương Minh Thùy",
    "nickname": "Thùy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-3",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Trần Nguyễn Anh Thy",
    "nickname": "Thy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-8",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Hoàng Thị Ngọc Hảo",
    "nickname": "Hảo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-2",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Ngọc Thu Huyền",
    "nickname": "Huyền",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-1",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-MAR-091-091-024-1",
    "title": "Customer Experience Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Nguyễn Sophol Kim Ngân",
    "nickname": "Sophol",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-091-091-025-4",
    "title": "Customer Service Executive",
    "division": "Marketing",
    "dept": "Customer Services",
    "subDept": "Customer Services",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Nguyễn Thị Cẩm Tiên",
    "nickname": "Tiên",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-092-093-047-1",
    "title": "Graphic Design Team Leader",
    "division": "Marketing",
    "dept": "Design",
    "subDept": "Design",
    "jobGrade": "13",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Dư Giai Hồng",
    "nickname": "Hồng",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-092-093-079-1",
    "title": "Motion Graphic Designer",
    "division": "Marketing",
    "dept": "Design",
    "subDept": "Design",
    "jobGrade": "12",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Trương Mạnh Tường",
    "nickname": "Tường",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-093-095-033-1",
    "title": "Digital Marketing Team Leader",
    "division": "Marketing",
    "dept": "Digital Marketing",
    "subDept": "Digital Marketing",
    "jobGrade": "13",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Huỳnh Thị Cẩm Tiên",
    "nickname": "Tiên",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-093-095-022-1",
    "title": "Content & PR Executive",
    "division": "Marketing",
    "dept": "Digital Marketing",
    "subDept": "Digital Marketing",
    "jobGrade": "11",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Trần Hồng Uyên Nhi",
    "nickname": "Nhi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-145-147-164-1",
    "title": "Senior Marketing Manager",
    "division": "Marketing",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "16",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Lê Đỗ Thủy Tú",
    "nickname": "Tú",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MAR-161-170-074-1",
    "title": "Marketing Team Leader",
    "division": "Marketing",
    "dept": "Supersports",
    "subDept": "Supersports",
    "jobGrade": "13",
    "reportsToId": "SHO-MAR-145-147-164-1",
    "reportsToTitle": "Senior Marketing Manager",
    "holderName": "Lê Ngọc Tuân",
    "nickname": "Tuân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FSH-189-124-169-1",
    "title": "Ecommerce Leader",
    "division": "Matin Kim",
    "dept": "Ecommerce",
    "subDept": "Ecommerce",
    "jobGrade": "13",
    "reportsToId": "SHO-CRO-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-FSH-189-147-072-1",
    "title": "Marketing Executive",
    "division": "Matin Kim",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "11",
    "reportsToId": "SHO-FSH-189-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-FSH-189-160-010-1",
    "title": "Brand Manager",
    "division": "Matin Kim",
    "dept": "Matin Kim",
    "subDept": "Matin Kim",
    "jobGrade": "15",
    "reportsToId": "SHO-CRO-015-014-049-1",
    "reportsToTitle": "Head of Crocs",
    "holderName": "Vũ Huy Quốc Cường",
    "nickname": "Vincent",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FSH-189-160-014-1",
    "title": "Buyer",
    "division": "Matin Kim",
    "dept": "Product",
    "subDept": "Product",
    "jobGrade": "13",
    "reportsToId": "SHO-FSH-189-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Nguyễn Mỹ Linh",
    "nickname": "Linh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-FSH-189-197-144-1",
    "title": "Visual Merchandise Executive",
    "division": "Matin Kim",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "11",
    "reportsToId": "SHO-FSH-189-160-010-1",
    "reportsToTitle": "Brand Manager",
    "holderName": "Nguyễn Hồng Phúc",
    "nickname": "Phúc",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-094-096-034-1",
    "title": "Digital Product Manager",
    "division": "Online",
    "dept": "Digital Platform",
    "subDept": "Digital Platform",
    "jobGrade": "14",
    "reportsToId": "SHO-ONL-148-154-053-1",
    "reportsToTitle": "Head of Online - Supersports",
    "holderName": "Nguyễn Vũ Việt Đức",
    "nickname": "Đức",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-094-096-091-1",
    "title": "Product Owner",
    "division": "Online",
    "dept": "Digital Platform",
    "subDept": "Digital Platform",
    "jobGrade": "12",
    "reportsToId": "SHO-ONL-094-096-034-1",
    "reportsToTitle": "Digital Product Manager",
    "holderName": "Đoàn Thùy Bảo Vy",
    "nickname": "Vy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-094-096-091-2",
    "title": "Product Owner",
    "division": "Online",
    "dept": "Digital Platform",
    "subDept": "Digital Platform",
    "jobGrade": "12",
    "reportsToId": "SHO-ONL-094-096-034-1",
    "reportsToTitle": "Digital Product Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-ONL-094-096-141-1",
    "title": "UI/ UX Designer",
    "division": "Online",
    "dept": "Digital Platform",
    "subDept": "Digital Platform",
    "jobGrade": "12",
    "reportsToId": "SHO-ONL-094-096-034-1",
    "reportsToTitle": "Digital Product Manager",
    "holderName": "Nguyễn Thị Thủy Trúc",
    "nickname": "Trúc",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-092-027-1",
    "title": "D2C & Commercial Management Manager",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "D2C & Planning",
    "jobGrade": "14",
    "reportsToId": "SHO-ONL-148-154-053-1",
    "reportsToTitle": "Head of Online - Supersports",
    "holderName": "Quách Thị Ngọc Hà",
    "nickname": "Hailee",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-093-048-1",
    "title": "Graphic Designer",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Design",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Đỗ Kim Ngân",
    "nickname": "Ngân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-094-048-1",
    "title": "Graphic Designer",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Design",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Gịp Hòa Hùng",
    "nickname": "Hùng",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-094-106-1",
    "title": "Senior Digital Marketing Executive",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Digital",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Nguyễn Thành Nam",
    "nickname": "Nam",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-124-038-1",
    "title": "Ecommerce Manager",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Ecommerce",
    "jobGrade": "15",
    "reportsToId": "SHO-ONL-148-154-053-1",
    "reportsToTitle": "Head of Online - Supersports",
    "holderName": "Lê Phụng Khanh",
    "nickname": "Khanh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-148-075-1",
    "title": "Marketplace Leader",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Marketplace",
    "jobGrade": "13",
    "reportsToId": "SHO-ONL-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Nguyễn Vân Thảo",
    "nickname": "Thảo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-148-066-1",
    "title": "Marketplace Executive",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-148-075-1",
    "reportsToTitle": "Marketplace Leader",
    "holderName": "Trần Du Hảo",
    "nickname": "Hảo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-121-200-147-1",
    "title": "Web Store Leader",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Webstore",
    "jobGrade": "13",
    "reportsToId": "SHO-ONL-121-124-038-1",
    "reportsToTitle": "Ecommerce Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-ONL-121-200-081-1",
    "title": "Online Coordinator",
    "division": "Online",
    "dept": "Ecommerce",
    "subDept": "Webstore",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-200-147-1",
    "reportsToTitle": "Web Store Leader",
    "holderName": "Ngô Anh Quân",
    "nickname": "Quân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-144-148-136-2",
    "title": "Streaming Talent",
    "division": "Online",
    "dept": "Livestream",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-148-075-1",
    "reportsToTitle": "Marketplace Leader",
    "holderName": "Trần Huỳnh Như",
    "nickname": "Như",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-144-148-136-4",
    "title": "Streaming Talent",
    "division": "Online",
    "dept": "Livestream",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-148-075-1",
    "reportsToTitle": "Marketplace Leader",
    "holderName": "Đào Võ Phát",
    "nickname": "Phát",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-144-148-136-1",
    "title": "Streaming Talent",
    "division": "Online",
    "dept": "Livestream",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-148-075-1",
    "reportsToTitle": "Marketplace Leader",
    "holderName": "Lê Nguyễn Phúc Huy",
    "nickname": "Huy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-144-148-136-3",
    "title": "Streaming Talent",
    "division": "Online",
    "dept": "Livestream",
    "subDept": "Marketplace",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-121-148-075-1",
    "reportsToTitle": "Marketplace Leader",
    "holderName": "Trần Thạch Trí Công",
    "nickname": "Công",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-157-080-1",
    "title": "Omnichannel Operations and Production Leader",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Operations",
    "jobGrade": "13",
    "reportsToId": "SHO-ONL-148-154-053-1",
    "reportsToTitle": "Head of Online - Supersports",
    "holderName": "Nguyễn Hồ Tố Quyên",
    "nickname": "Quyên",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-157-039-4",
    "title": "Ecommerce Operator",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Operations",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Nguyễn Thị Ẩn",
    "nickname": "Ẩn",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-157-039-3",
    "title": "Ecommerce Operator",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Operations",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Lưu Khánh Vy",
    "nickname": "Vy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-157-039-1",
    "title": "Ecommerce Operator",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Operations",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Phan Ngọc Huyền",
    "nickname": "Huyền",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-157-039-2",
    "title": "Ecommerce Operator",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Operations",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Lê Nguyễn Hoà Phúc",
    "nickname": "Phúc",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-161-086-1",
    "title": "Photo Editor",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Product Content",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Huỳnh Tấn Phong",
    "nickname": "Phong",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-161-090-2",
    "title": "Product Content",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Product Content",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Nguyễn Hà Bảo Thy",
    "nickname": "Thy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-161-090-1",
    "title": "Product Content",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Product Content",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Mai Thục Ngân",
    "nickname": "Ngân",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-147-161-090-3",
    "title": "Product Content",
    "division": "Online",
    "dept": "Omnichannel",
    "subDept": "Product Content",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-147-157-080-1",
    "reportsToTitle": "Omnichannel Operations and Production Leader",
    "holderName": "Nguyễn Hoàng Hải Châu",
    "nickname": "Châu",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-148-154-053-1",
    "title": "Head of Online - Supersports",
    "division": "Online",
    "dept": "Online",
    "subDept": "Online",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-ONL-148-154-171-1",
    "title": "Senior Ecommerce Manager",
    "division": "Online",
    "dept": "Online",
    "subDept": "Online",
    "jobGrade": "16",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Đặng Hoài Hương",
    "nickname": "Emma",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-ONL-150-158-040-1",
    "title": "Ecommerce Performance Analyst",
    "division": "Online",
    "dept": "Performance Analyst",
    "subDept": "Performance Analyst",
    "jobGrade": "11",
    "reportsToId": "SHO-ONL-148-154-053-1",
    "reportsToTitle": "Head of Online - Supersports",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-OPE-001-002-097-1",
    "title": "Retail Operations Excellence Manager",
    "division": "Operations",
    "dept": "Admin",
    "subDept": "Admin - Shared",
    "jobGrade": "15",
    "reportsToId": "SHO-OPE-149-157-054-1",
    "reportsToTitle": "Head of Operations",
    "holderName": "Võ Thị Tú Trinh",
    "nickname": "Bee",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-OPE-001-002-083-1",
    "title": "Operations Admin Supervisor",
    "division": "Operations",
    "dept": "Admin",
    "subDept": "Admin - Shared",
    "jobGrade": "13",
    "reportsToId": "SHO-OPE-001-002-097-1",
    "reportsToTitle": "Retail Operations Excellence Manager",
    "holderName": "Nguyễn Thị Thủy Ngân",
    "nickname": "Maya",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-OPE-001-150-103-1",
    "title": "Senior Admin Executive",
    "division": "Operations",
    "dept": "Admin",
    "subDept": "North",
    "jobGrade": "11",
    "reportsToId": "SHO-OPE-001-002-083-1",
    "reportsToTitle": "Operations Admin Supervisor",
    "holderName": "Vũ Thị Hoan",
    "nickname": "Hoan",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-OPE-001-164-005-1",
    "title": "Admin Executive",
    "division": "Operations",
    "dept": "Admin",
    "subDept": "South",
    "jobGrade": "11",
    "reportsToId": "SHO-OPE-001-002-083-1",
    "reportsToTitle": "Operations Admin Supervisor",
    "holderName": "Trương Thị Phương Nguyên",
    "nickname": "Nguyên",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-OPE-001-164-082-1",
    "title": "Operations Admin Executive",
    "division": "Operations",
    "dept": "Admin",
    "subDept": "South",
    "jobGrade": "11",
    "reportsToId": "SHO-OPE-001-002-083-1",
    "reportsToTitle": "Operations Admin Supervisor",
    "holderName": "Nguyễn Thị Hoàng Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-OPE-122-125-041-1",
    "title": "Event Manager",
    "division": "Operations",
    "dept": "Event & Clearance",
    "subDept": "Event & Clearance",
    "jobGrade": "15",
    "reportsToId": "SHO-OPE-149-157-054-1",
    "reportsToTitle": "Head of Operations",
    "holderName": "Nguyễn Trung Nhơn",
    "nickname": "Nhơn",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-OPE-149-157-054-1",
    "title": "Head of Operations",
    "division": "Operations",
    "dept": "Operations",
    "subDept": "Operations",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Đỗ Thi",
    "nickname": "Thi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-OPE-158-167-035-1",
    "title": "District Manager",
    "division": "Operations",
    "dept": "Operations",
    "subDept": "Sports Brands",
    "jobGrade": "14",
    "reportsToId": "SHO-OPE-149-157-098-1",
    "reportsToTitle": "Retail Operations & Academy Manager",
    "holderName": "Trần Xuân Việt",
    "nickname": "Việt",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-OPE-161-170-107-1",
    "title": "Senior District Manager",
    "division": "Operations",
    "dept": "Operations",
    "subDept": "Supersports",
    "jobGrade": "14",
    "reportsToId": "SHO-OPE-149-157-098-1",
    "reportsToTitle": "Retail Operations & Academy Manager",
    "holderName": "Nguyễn Văn Nam",
    "nickname": "Nam Hi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-OPE-149-157-098-1",
    "title": "Retail Operations & Academy Manager",
    "division": "Operations",
    "dept": "Operations",
    "subDept": "Supersports, Sports Brands, Training",
    "jobGrade": "15",
    "reportsToId": "SHO-OPE-149-157-054-1",
    "reportsToTitle": "Head of Operations",
    "holderName": "Võ Quốc Trung",
    "nickname": "Ivan",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-OPE-149-188-139-1",
    "title": "Training Specialist",
    "division": "Operations",
    "dept": "Operations",
    "subDept": "Training",
    "jobGrade": "13",
    "reportsToId": "SHO-OPE-149-188-140-1",
    "reportsToTitle": "Training Supervisor",
    "holderName": "Nguyễn Chí Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-OPE-149-188-140-1",
    "title": "Training Supervisor",
    "division": "Operations",
    "dept": "Operations",
    "subDept": "Training",
    "jobGrade": "13",
    "reportsToId": "SHO-OPE-149-157-098-1",
    "reportsToTitle": "Retail Operations & Academy Manager",
    "holderName": "Nguyễn Thành Trung",
    "nickname": "Kevin",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PLA-004-183-076-1",
    "title": "Merchandise Admin",
    "division": "Planning",
    "dept": "BU Shared",
    "subDept": "System & Support",
    "jobGrade": "12",
    "reportsToId": "SHO-PLA-151-159-055-1",
    "reportsToTitle": "Head of Planning",
    "holderName": "Trịnh Ngọc Mai",
    "nickname": "Mai",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PLA-004-183-095-1",
    "title": "Replenishment Analyst",
    "division": "Planning",
    "dept": "BU Shared",
    "subDept": "System & Support",
    "jobGrade": "12",
    "reportsToId": "SHO-PLA-151-159-055-1",
    "reportsToTitle": "Head of Planning",
    "holderName": "Bùi Trần Anh Thy",
    "nickname": "Thy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PLA-004-183-028-1",
    "title": "Database Management Executive",
    "division": "Planning",
    "dept": "BU Shared",
    "subDept": "System & Support",
    "jobGrade": "12",
    "reportsToId": "SHO-PLA-151-159-055-1",
    "reportsToTitle": "Head of Planning",
    "holderName": "Vương Thùy Dung",
    "nickname": "Dung",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PLA-151-159-055-1",
    "title": "Head of Planning",
    "division": "Planning",
    "dept": "Planning",
    "subDept": "Planning",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-PLA-159-159-088-1",
    "title": "Planning Manager",
    "division": "Planning",
    "dept": "Sports Shared",
    "subDept": "Planning",
    "jobGrade": "15",
    "reportsToId": "SHO-PLA-151-159-055-1",
    "reportsToTitle": "Head of Planning",
    "holderName": "Trần Quốc Thiên Hương",
    "nickname": "May",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PLA-159-159-160-1",
    "title": "PMO Planning Executive",
    "division": "Planning",
    "dept": "Sports Shared",
    "subDept": "Planning",
    "jobGrade": "13",
    "reportsToId": "SHO-PLA-151-159-055-1",
    "reportsToTitle": "Head of Planning",
    "holderName": "Tiêu Khánh Sơn",
    "nickname": "Sơn",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PLA-159-159-087-1",
    "title": "Planning Executive",
    "division": "Planning",
    "dept": "Sports Shared",
    "subDept": "Planning",
    "jobGrade": "12",
    "reportsToId": "SHO-PLA-151-159-055-1",
    "reportsToTitle": "Head of Planning",
    "holderName": "Nguyễn Thị Uyển Nhi",
    "nickname": "Nhi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PRO-001-001-092-1",
    "title": "Project Admin",
    "division": "Project",
    "dept": "Admin",
    "subDept": "Admin",
    "jobGrade": "11",
    "reportsToId": "SHO-PRO-153-162-112-1",
    "reportsToTitle": "Senior Project Division Manager",
    "holderName": "Phạm Thị Minh Thùy",
    "nickname": "Thùy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PRO-153-162-112-1",
    "title": "Senior Project Division Manager",
    "division": "Project",
    "dept": "Project",
    "subDept": "Project",
    "jobGrade": "16",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Phan Vũ Anh Khoa",
    "nickname": "Khoa",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-PRO-153-162-093-1",
    "title": "Project Supervisor",
    "division": "Project",
    "dept": "Project",
    "subDept": "Project",
    "jobGrade": "13",
    "reportsToId": "SHO-PRO-153-162-112-1",
    "reportsToTitle": "Senior Project Division Manager",
    "holderName": "Nguyễn Danh Tuấn",
    "nickname": "Tuấn",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-PRO-153-162-093-2",
    "title": "Project Supervisor",
    "division": "Project",
    "dept": "Project",
    "subDept": "Project",
    "jobGrade": "13",
    "reportsToId": "SHO-PRO-153-162-112-1",
    "reportsToTitle": "Senior Project Division Manager",
    "holderName": "Lê Trọng Thiện",
    "nickname": "Thiện",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SPO-009-008-104-1",
    "title": "Senior Buyer",
    "division": "Sports Brands",
    "dept": "Columbia & Speedo",
    "subDept": "Columbia",
    "jobGrade": "14",
    "reportsToId": "SHO-SPO-158-167-057-1",
    "reportsToTitle": "Head of Sports Brands",
    "holderName": "Lý Quang Khánh",
    "nickname": "Khánh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SPO-009-008-077-1",
    "title": "Merchandise Assistant",
    "division": "Sports Brands",
    "dept": "Columbia & Speedo",
    "subDept": "Columbia",
    "jobGrade": "12",
    "reportsToId": "SHO-SPO-158-167-057-1",
    "reportsToTitle": "Head of Sports Brands",
    "holderName": "Tống Bá Hoàng Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MSD-191-206-073-1",
    "title": "Marketing Manager",
    "division": "Sports Brands",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "14",
    "reportsToId": "",
    "reportsToTitle": "",
    "holderName": "Nguyễn Bá Phương Thi",
    "nickname": "Thi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MSD-009-205-072-1",
    "title": "Marketing Executive",
    "division": "Sports Brands",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "11",
    "reportsToId": "SHO-MSD-191-206-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Nguyễn Ngọc Thiên Nhi",
    "nickname": "Nhi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-MSD-179-192-072-1",
    "title": "Marketing Executive",
    "division": "Sports Brands",
    "dept": "Marketing",
    "subDept": "Marketing",
    "jobGrade": "11",
    "reportsToId": "SHO-MSD-191-206-073-1",
    "reportsToTitle": "Marketing Manager",
    "holderName": "Nguyễn Huỳnh Hồng Diễm",
    "nickname": "Diễm",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SPO-158-167-057-1",
    "title": "Head of Sports Brands",
    "division": "Sports Brands",
    "dept": "Sports Brands",
    "subDept": "Sports Brands",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Nguyễn Thủy Hương",
    "nickname": "April",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SPO-190-204-014-1",
    "title": "Buyer",
    "division": "Sports Brands",
    "dept": "The North Face",
    "subDept": "The North Face",
    "jobGrade": "13",
    "reportsToId": "SHO-SPO-158-167-057-1",
    "reportsToTitle": "Head of Sports Brands",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-SPO-179-192-104-1",
    "title": "Senior Buyer",
    "division": "Sports Brands",
    "dept": "Under Armour",
    "subDept": "Under Armour",
    "jobGrade": "14",
    "reportsToId": "SHO-SPO-158-167-057-1",
    "reportsToTitle": "Head of Sports Brands",
    "holderName": "Hà Thị Linh",
    "nickname": "Linh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SPO-179-192-077-1",
    "title": "Merchandise Assistant",
    "division": "Sports Brands",
    "dept": "Under Armour",
    "subDept": "Under Armour",
    "jobGrade": "12",
    "reportsToId": "SHO-SPO-158-167-057-1",
    "reportsToTitle": "Head of Sports Brands",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-SPO-184-197-145-1",
    "title": "Visual Merchandise Manager",
    "division": "Sports Brands",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "14",
    "reportsToId": "SHO-SPO-158-167-057-1",
    "reportsToTitle": "Head of Sports Brands",
    "holderName": "Lê Thành Ngọc Thy",
    "nickname": "Blue",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SPO-184-197-144-1",
    "title": "Visual Merchandise Executive",
    "division": "Sports Brands",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "11",
    "reportsToId": "SHO-SPO-184-197-145-1",
    "reportsToTitle": "Visual Merchandise Manager",
    "holderName": "Huỳnh Thanh Thanh",
    "nickname": "Thanh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-154-163-021-1",
    "title": "Category Manager",
    "division": "Supersports",
    "dept": "Running",
    "subDept": "Running",
    "jobGrade": "15",
    "reportsToId": "SHO-SUP-161-170-058-1",
    "reportsToTitle": "Head of Supersports",
    "holderName": "Châu Thị Lan Hương",
    "nickname": "Hương",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-154-163-104-1",
    "title": "Senior Buyer",
    "division": "Supersports",
    "dept": "Running",
    "subDept": "Running",
    "jobGrade": "14",
    "reportsToId": "SHO-SUP-154-163-021-1",
    "reportsToTitle": "Category Manager",
    "holderName": "Trần Hà Anh",
    "nickname": "Anh",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-154-163-077-1",
    "title": "Merchandise Assistant",
    "division": "Supersports",
    "dept": "Running",
    "subDept": "Running",
    "jobGrade": "12",
    "reportsToId": "SHO-SUP-154-163-021-1",
    "reportsToTitle": "Category Manager",
    "holderName": "Bùi Lý Ngọc Như",
    "nickname": "Như",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-161-170-058-1",
    "title": "Head of Supersports",
    "division": "Supersports",
    "dept": "Supersports",
    "subDept": "Supersports",
    "jobGrade": "17",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Huỳnh Ngọc Dạ Thảo",
    "nickname": "Thảo",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-176-189-021-1",
    "title": "Category Manager",
    "division": "Supersports",
    "dept": "Training & Lifestyle",
    "subDept": "Training & Lifestyle",
    "jobGrade": "15",
    "reportsToId": "SHO-SUP-161-170-058-1",
    "reportsToTitle": "Head of Supersports",
    "holderName": "Phạm Mai Ni",
    "nickname": "Kat",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-176-189-014-3",
    "title": "Buyer",
    "division": "Supersports",
    "dept": "Training & Lifestyle",
    "subDept": "Training & Lifestyle",
    "jobGrade": "13",
    "reportsToId": "SHO-SUP-176-189-021-1",
    "reportsToTitle": "Category Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-SUP-176-189-014-1",
    "title": "Buyer",
    "division": "Supersports",
    "dept": "Training & Lifestyle",
    "subDept": "Training & Lifestyle",
    "jobGrade": "13",
    "reportsToId": "SHO-SUP-176-189-021-1",
    "reportsToTitle": "Category Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  },
  {
    "id": "SHO-SUP-176-189-077-2",
    "title": "Merchandise Assistant",
    "division": "Supersports",
    "dept": "Training & Lifestyle",
    "subDept": "Training & Lifestyle",
    "jobGrade": "12",
    "reportsToId": "SHO-SUP-176-189-021-1",
    "reportsToTitle": "Category Manager",
    "holderName": "Nguyễn Lê Uyên Trang",
    "nickname": "Trang",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-183-192-014-1",
    "title": "Buyer",
    "division": "Supersports",
    "dept": "Vertical Sports",
    "subDept": "Under Armour",
    "jobGrade": "13",
    "reportsToId": "SHO-SUP-161-170-058-1",
    "reportsToTitle": "Head of Supersports",
    "holderName": "Võ Minh Luân",
    "nickname": "Ziggy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-183-196-077-1",
    "title": "Merchandise Assistant",
    "division": "Supersports",
    "dept": "Vertical Sports",
    "subDept": "Vertical Sports",
    "jobGrade": "12",
    "reportsToId": "SHO-SUP-183-192-014-1",
    "reportsToTitle": "Buyer",
    "holderName": "Hồ Thị Thủy Trúc",
    "nickname": "Trúc",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-184-197-096-1",
    "title": "Retail Brand Marketing Manager",
    "division": "Supersports",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "15",
    "reportsToId": "SHO-SUP-161-170-058-1",
    "reportsToTitle": "Head of Supersports",
    "holderName": "Vũ Thị Phương Dung",
    "nickname": "Sophie",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-184-197-142-1",
    "title": "Visual Merchandise Assistant Manager",
    "division": "Supersports",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "13",
    "reportsToId": "SHO-SPO-158-167-057-1",
    "reportsToTitle": "Head of Sports Brands",
    "holderName": "Thái Nguyễn Ngọc Anh Thơ",
    "nickname": "Thơ",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "NHO-SUP-184-197-121-1",
    "title": "Senior Visual Merchandise Executive",
    "division": "Supersports",
    "dept": "Visual Merchandise",
    "subDept": "Visual Merchandise",
    "jobGrade": "11",
    "reportsToId": "SHO-SUP-184-197-096-1",
    "reportsToTitle": "Retail Brand Marketing Manager",
    "holderName": "Nguyễn Thị Diệu",
    "nickname": "Diệu",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-185-198-021-1",
    "title": "Category Manager",
    "division": "Supersports",
    "dept": "Water & Outdoor",
    "subDept": "Water & Outdoor",
    "jobGrade": "15",
    "reportsToId": "SHO-SUP-161-170-058-1",
    "reportsToTitle": "Head of Supersports",
    "holderName": "Trần Nguyễn Vân Khanh",
    "nickname": "Katie",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-185-198-014-1",
    "title": "Buyer",
    "division": "Supersports",
    "dept": "Water & Outdoor",
    "subDept": "Water & Outdoor",
    "jobGrade": "13",
    "reportsToId": "SHO-SUP-185-198-021-1",
    "reportsToTitle": "Category Manager",
    "holderName": "Ung Ý My",
    "nickname": "My",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-SUP-185-198-077-1",
    "title": "Merchandise Assistant",
    "division": "Supersports",
    "dept": "Water & Outdoor",
    "subDept": "Water & Outdoor",
    "jobGrade": "12",
    "reportsToId": "SHO-SUP-185-198-021-1",
    "reportsToTitle": "Category Manager",
    "holderName": "Nguyễn Thị Thu Nhi",
    "nickname": "Nhi",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-WHO-186-201-148-1",
    "title": "Wholesale Manager",
    "division": "Wholesale",
    "dept": "Wholesales",
    "subDept": "Wholesales",
    "jobGrade": "15",
    "reportsToId": "SHO-EXE-125-128-089-1",
    "reportsToTitle": "President, CRC Sports VN",
    "holderName": "Nguyễn Thị Hương",
    "nickname": "Amy",
    "flags": [
      "VN"
    ],
    "status": "active"
  },
  {
    "id": "SHO-WHO-186-201-111-1",
    "title": "Senior Wholesale Executive",
    "division": "Wholesale",
    "dept": "Wholesales",
    "subDept": "Wholesales",
    "jobGrade": "12",
    "reportsToId": "SHO-WHO-186-201-148-1",
    "reportsToTitle": "Wholesale Manager",
    "holderName": "Vacant",
    "nickname": "Vacant",
    "flags": [
      "VN"
    ],
    "status": "vacant"
  }
];

export const DEFAULT_OFFICE_DIVISIONS: string[] = [
  "Crocs",
  "Dyson Viet Nam",
  "Executive Team",
  "Finance",
  "HOKA",
  "Human Resources",
  "Leasing",
  "Marketing",
  "Matin Kim",
  "Online",
  "Operations",
  "Planning",
  "Project",
  "Sports Brands",
  "Supersports",
  "Wholesale"
];
