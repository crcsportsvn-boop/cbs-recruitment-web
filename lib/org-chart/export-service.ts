import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { OrgProposalState, OrgNode, HeadcountSummary, ProposalChange, ProposalJustificationRow } from '@/types/org-chart';

/**
 * Helper: trigger a Blob download reliably across browsers and production environments
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  // Delay revoke so the browser has time to start the download
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1500);
}

/**
 * Shared html2canvas clone handler — strips transforms, resets overflow/clamp
 */
function applyCloneCleanup(clonedElement: HTMLElement, exportW: number, exportH: number): void {
  clonedElement.style.transform = 'none';
  clonedElement.style.transition = 'none';
  clonedElement.style.margin = '0';
  clonedElement.style.overflow = 'visible';
  clonedElement.style.width = `${exportW}px`;
  clonedElement.style.height = `${exportH}px`;

  const allElements = clonedElement.querySelectorAll<HTMLElement>('*');
  allElements.forEach(el => {
    el.style.overflow = 'visible';
    el.style.textOverflow = 'clip';

    const classNameStr =
      typeof el.className === 'string'
        ? el.className
        : typeof (el.className as any)?.baseVal === 'string'
        ? (el.className as any).baseVal
        : '';

    if (
      classNameStr.includes('-webkit-box') ||
      classNameStr.includes('line-clamp') ||
      (el.style as any).webkitLineClamp
    ) {
      el.style.display = 'block';
      (el.style as any).webkitLineClamp = 'unset';
      (el.style as any).webkitBoxOrient = 'unset';
      el.style.maxHeight = 'none';
      el.style.height = 'auto';
    }

    if (['DIV', 'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'STRONG', 'B'].includes(el.tagName)) {
      el.style.lineHeight = '1.35';
      el.style.textRendering = 'geometricPrecision';
      (el.style as any).webkitFontSmoothing = 'antialiased';
    }
  });

  const cards = clonedElement.querySelectorAll<HTMLElement>('[style*="min-height"], [style*="minHeight"], .group');
  cards.forEach(card => {
    card.style.overflow = 'visible';
    card.style.height = 'auto';
  });
}

/**
 * Exports the HTML Canvas element to high-resolution PNG image
 */
export async function exportToImage(element: HTMLElement, filename: string = 'CBS_Org_Chart.png'): Promise<void> {
  // Wait for all web fonts to load completely
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      // ignore
    }
  }

  const rawStyleW = parseInt(element.style.width, 10);
  const rawStyleH = parseInt(element.style.height, 10);
  const exportW = Math.max(rawStyleW || element.scrollWidth || element.offsetWidth, 1440);
  const exportH = Math.max(rawStyleH || element.scrollHeight || element.offsetHeight, 810);

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: exportW,
    height: exportH,
    windowWidth: exportW,
    windowHeight: exportH,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    onclone: (_clonedDoc, clonedElement) => {
      applyCloneCleanup(clonedElement, exportW, exportH);
    }
  });

  // Wrap toBlob in a Promise so we properly await the download trigger
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob returned null'));
          return;
        }
        triggerBlobDownload(blob, filename);
        resolve();
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Exports the HTML Canvas element to vector-fitted PDF (supports A4 and A3 Landscape)
 */
export async function exportToPDF(
  element: HTMLElement,
  filename: string = 'CBS_Org_Chart.pdf',
  paperFormat: 'a4' | 'a3' = 'a4'
): Promise<void> {
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      // ignore
    }
  }

  const rawStyleW = parseInt(element.style.width, 10);
  const rawStyleH = parseInt(element.style.height, 10);
  const exportW = Math.max(rawStyleW || element.scrollWidth || element.offsetWidth, 1440);
  const exportH = Math.max(rawStyleH || element.scrollHeight || element.offsetHeight, 810);

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: exportW,
    height: exportH,
    windowWidth: exportW,
    windowHeight: exportH,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    onclone: (_clonedDoc, clonedElement) => {
      applyCloneCleanup(clonedElement, exportW, exportH);
    }
  });

  // Wrap toBlob in Promise, then embed in PDF
  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Canvas toBlob returned null')); return; }
        resolve(blob);
      },
      'image/png',
      1.0
    );
  });

  const imgData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(pngBlob);
  });

  // Dimensions in mm (Landscape)
  const isA3 = paperFormat === 'a3';
  const pdfWidth = isA3 ? 420 : 297;
  const pdfHeight = isA3 ? 297 : 210;
  const margin = 8;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: paperFormat
  });

  const contentWidth = pdfWidth - margin * 2;
  const contentHeight = pdfHeight - margin * 2;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);

  const finalWidth = imgWidth * ratio;
  const finalHeight = imgHeight * ratio;

  const posX = (pdfWidth - finalWidth) / 2;
  const posY = (pdfHeight - finalHeight) / 2;

  pdf.addImage(imgData, 'PNG', posX, posY, finalWidth, finalHeight);
  pdf.save(filename);
}

/**
 * Exports the proposal dataset to structured Excel workbook (.xlsx)
 * Contains: Proposal_Master, Diff_Summary, Proposal_Justification, Headcount_Summary
 */
export function exportProposalExcel(
  proposalNodes: OrgNode[],
  summary: HeadcountSummary,
  diffList: ProposalChange[] = [],
  justificationRows: ProposalJustificationRow[] = [],
  filename: string = 'CBS_Org_Proposal.xlsx'
): void {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Proposal_Master (Format matches original input Excel)
  const masterData = proposalNodes
    .filter(n => !n.isVirtual && !n.isSupervisor)
    .map((n, idx) => ({
      'STT': idx + 1,
      'Position ID': n.id,
      'Position Name': n.title,
      'Division': n.division || '',
      'Department': n.dept || '',
      'Sub Dept': n.subDept || '',
      'Job Grade': n.jobGrade || '',
      'Reports To Position ID': n.reportsToId || '',
      'Reports To Position Name': n.reportsToTitle || '',
      'Master_Data.FullName': n.holderName || '',
      'Master_Data.NickName': n.nickname || '',
      'Group': n.groupType || 'Office',
      'Proposal Status': n.status === 'new_hire' ? 'New Hire BP' : n.status === 'replace' ? 'Replace' : n.status === 'vacant' ? 'Vacant' : 'Active',
      'Proposal Tag / Badge': n.customLabel || ''
    }));
  const wsMaster = XLSX.utils.json_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Proposal_Master');

  // 2. Sheet: Diff_Summary (Changes compared to Current)
  const diffData = diffList.map((d, idx) => ({
    'STT': idx + 1,
    'Mã Vị Trí': d.nodeId,
    'Chức Danh': d.nodeTitle,
    'Phòng Ban': d.division,
    'Bộ Phận': d.dept || '',
    'Loại Thay Đổi': d.type === 'new_hire' ? 'Tuyển Mới (New Hire BP)' : d.type === 'replace' ? 'Thay Thế (Replace)' : d.type === 'reassigned' ? 'Điều Chuyển Báo Cáo' : d.type === 'title_modified' ? 'Sửa Chức Danh' : 'Bãi Bỏ',
    'Giá Trị Trước': d.oldValue || '-',
    'Giá Trị Sau': d.newValue || '-',
    'Chi Tiết Biến Động': d.description
  }));
  const wsDiff = XLSX.utils.json_to_sheet(diffData.length > 0 ? diffData : [{ 'Thông Báo': 'Không có biến động so với sơ đồ hiện tại' }]);
  XLSX.utils.book_append_sheet(wb, wsDiff, 'Diff_Summary');

  // 3. Sheet: Proposal_Justification (Thuyết minh nhu cầu)
  const justData = justificationRows.map((j, idx) => ({
    'STT': idx + 1,
    'Mã Vị Trí': j.positionId,
    'Chức Danh': j.title,
    'Phòng Ban': j.division,
    'Loại Đề Xuất': j.changeType,
    'Lý Do & Thuyết Minh Nhu Cầu': j.justification,
    'Thời Gian Dự Kiến Tuyển': j.timeline,
    'Cấp Bậc (Grade)': j.jobGrade || '',
    'Ngân Sách / Chi Phí': j.budgetImpact || ''
  }));
  const wsJust = XLSX.utils.json_to_sheet(justData.length > 0 ? justData : [{ 'Thông Báo': 'Chưa có ghi chú thuyết minh' }]);
  XLSX.utils.book_append_sheet(wb, wsJust, 'Proposal_Justification');

  // 4. Sheet: Headcount_Summary
  const summaryData = [
    { 'Chỉ Số Định Biên': 'Tổng số ghế định biên hiện tại (Total Seats)', 'Số Lượng': summary.totalSeats },
    { 'Chỉ Số Định Biên': 'Đã có nhân sự (Occupied)', 'Số Lượng': summary.occupied },
    { 'Chỉ Số Định Biên': 'Ghế đang trống (Vacant)', 'Số Lượng': summary.vacant },
    { 'Chỉ Số Định Biên': 'Đề xuất tuyển mới kế hoạch (New Hire BP)', 'Số Lượng': summary.newHireBP },
    { 'Chỉ Số Định Biên': 'Đề xuất thay thế nhân sự (Replace)', 'Số Lượng': summary.replacement },
    { 'Chỉ Số Định Biên': 'TỔNG ĐỊNH BIÊN KẾ HOẠCH (Planned Total)', 'Số Lượng': summary.plannedTotal }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Headcount_Summary');

  // Generate ArrayBuffer and trigger download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerBlobDownload(blob, filename);
}

/**
 * Exports proposal state to a downloadable JSON file
 */
export function exportProposalJSON(state: OrgProposalState, filename: string = 'CBS_Org_Proposal.cbsorg'): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerBlobDownload(blob, filename);
}

/**
 * Imports proposal state from an uploaded JSON file
 */
export function importProposalJSON(file: File): Promise<OrgProposalState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as OrgProposalState;
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid CBS Org proposal JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
