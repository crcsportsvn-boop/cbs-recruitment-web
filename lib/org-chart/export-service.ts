import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { OrgProposalState, OrgNode, HeadcountSummary, ProposalChange, ProposalJustificationRow } from '@/types/org-chart';

/**
 * Reliable cross-browser blob download.
 *
 * Key design decisions:
 * 1. Force `application/octet-stream` MIME type → prevents Chrome/Firefox from opening
 *    PDFs in the built-in viewer or images inline — forcing a true file download.
 * 2. Long revoke timeout (60 s) → Chrome needs time to register the download and
 *    resolve the filename from the `download` attribute before the blob URL is gone.
 * 3. `setAttribute` + `dispatchEvent(MouseEvent)` → more reliable than `.click()`
 *    across async contexts where the original user-gesture stack has unwound.
 */
function downloadBlob(originalBlob: Blob, filename: string): void {
  // Re-wrap as octet-stream so browsers never try to open the content inline
  const blob = new Blob([originalBlob], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename); // setAttribute is more reliable than .download = 
  a.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(a);

  // dispatchEvent with explicit window view is more reliable than a.click() in async
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: false, view: window }));

  // Long timeout: give Chrome 60 s to register the download before revoking the URL.
  // Revoking too early causes Chrome to fall back to the blob UUID as filename.
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}

/**
 * Shared html2canvas clone handler – strips transforms, resets overflow/clamp
 */
function applyCloneCleanup(clonedElement: HTMLElement, exportW: number, exportH: number): void {
  clonedElement.style.transform = 'none';
  clonedElement.style.transition = 'none';
  clonedElement.style.margin = '0';
  clonedElement.style.overflow = 'visible';
  clonedElement.style.width = `${exportW}px`;
  clonedElement.style.height = `${exportH}px`;

  clonedElement.querySelectorAll<HTMLElement>('*').forEach(el => {
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

  clonedElement.querySelectorAll<HTMLElement>('[style*="min-height"], [style*="minHeight"], .group').forEach(card => {
    card.style.overflow = 'visible';
    card.style.height = 'auto';
  });
}

/**
 * Renders element to canvas and returns the blob.
 */
async function renderToBlob(element: HTMLElement): Promise<{ blob: Blob; canvas: HTMLCanvasElement }> {
  if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
    try { await (document as any).fonts.ready; } catch { /* ignore */ }
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
    onclone: (_clonedDoc, clonedElement) => applyCloneCleanup(clonedElement, exportW, exportH)
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => { if (b) resolve(b); else reject(new Error('toBlob failed')); },
      'image/png',
      1.0
    );
  });

  return { blob, canvas };
}

/**
 * Exports the canvas element to high-resolution PNG.
 */
export async function exportToImage(element: HTMLElement, filename: string = 'CBS_Org_Chart.png'): Promise<void> {
  const { blob } = await renderToBlob(element);
  downloadBlob(blob, filename);
}

/**
 * Exports the canvas element to PDF (A4 or A3 Landscape).
 * Uses pdf.output('arraybuffer') instead of pdf.save() to control the download
 * ourselves — this prevents Chrome's PDF viewer from intercepting the blob.
 */
export async function exportToPDF(
  element: HTMLElement,
  filename: string = 'CBS_Org_Chart.pdf',
  paperFormat: 'a4' | 'a3' = 'a4'
): Promise<void> {
  const { blob: imgBlob, canvas } = await renderToBlob(element);

  // Convert PNG blob → data URI for jsPDF embedding
  const imgData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(imgBlob);
  });

  const isA3 = paperFormat === 'a3';
  const pdfW = isA3 ? 420 : 297;
  const pdfH = isA3 ? 297 : 210;
  const margin = 8;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: paperFormat });

  const cw = pdfW - margin * 2;
  const ch = pdfH - margin * 2;
  const ratio = Math.min(cw / canvas.width, ch / canvas.height);
  const fw = canvas.width * ratio;
  const fh = canvas.height * ratio;
  const px = (pdfW - fw) / 2;
  const py = (pdfH - fh) / 2;

  pdf.addImage(imgData, 'PNG', px, py, fw, fh);

  // Use arraybuffer output → wrap as Blob → downloadBlob (avoids Chrome PDF viewer interception)
  const pdfArrayBuffer = pdf.output('arraybuffer');
  const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  downloadBlob(pdfBlob, filename);
}

/**
 * Exports the proposal dataset to structured Excel workbook (.xlsx)
 */
export function exportProposalExcel(
  proposalNodes: OrgNode[],
  summary: HeadcountSummary,
  diffList: ProposalChange[] = [],
  justificationRows: ProposalJustificationRow[] = [],
  filename: string = 'CBS_Org_Proposal.xlsx'
): void {
  const wb = XLSX.utils.book_new();

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
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(masterData), 'Proposal_Master');

  const diffData = diffList.map((d, idx) => ({
    'STT': idx + 1,
    'Mã Vị Trí': d.nodeId,
    'Chức Danh': d.nodeTitle,
    'Phòng Ban': d.division,
    'Bộ Phận': d.dept || '',
    'Loại Thay Đổi':
      d.type === 'new_hire' ? 'Tuyển Mới (New Hire BP)' :
      d.type === 'replace' ? 'Thay Thế (Replace)' :
      d.type === 'reassigned' ? 'Điều Chuyển Báo Cáo' :
      d.type === 'title_modified' ? 'Sửa Chức Danh' : 'Bãi Bỏ',
    'Giá Trị Trước': d.oldValue || '-',
    'Giá Trị Sau': d.newValue || '-',
    'Chi Tiết Biến Động': d.description
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(diffData.length > 0 ? diffData : [{ 'Thông Báo': 'Không có biến động so với sơ đồ hiện tại' }]),
    'Diff_Summary'
  );

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
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(justData.length > 0 ? justData : [{ 'Thông Báo': 'Chưa có ghi chú thuyết minh' }]),
    'Proposal_Justification'
  );

  const summaryData = [
    { 'Chỉ Số Định Biên': 'Tổng số ghế định biên hiện tại (Total Seats)', 'Số Lượng': summary.totalSeats },
    { 'Chỉ Số Định Biên': 'Đã có nhân sự (Occupied)', 'Số Lượng': summary.occupied },
    { 'Chỉ Số Định Biên': 'Ghế đang trống (Vacant)', 'Số Lượng': summary.vacant },
    { 'Chỉ Số Định Biên': 'Đề xuất tuyển mới kế hoạch (New Hire BP)', 'Số Lượng': summary.newHireBP },
    { 'Chỉ Số Định Biên': 'Đề xuất thay thế nhân sự (Replace)', 'Số Lượng': summary.replacement },
    { 'Chỉ Số Định Biên': 'TỔNG ĐỊNH BIÊN KẾ HOẠCH (Planned Total)', 'Số Lượng': summary.plannedTotal }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Headcount_Summary');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([wbout]), filename);
}

/**
 * Exports proposal state to a downloadable JSON file (.cbsorg)
 */
export function exportProposalJSON(state: OrgProposalState, filename: string = 'CBS_Org_Proposal.cbsorg'): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * Imports proposal state from an uploaded JSON file
 */
export function importProposalJSON(file: File): Promise<OrgProposalState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { resolve(JSON.parse(e.target?.result as string) as OrgProposalState); }
      catch { reject(new Error('Invalid CBS Org proposal JSON file')); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
