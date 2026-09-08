import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OrgProposalState } from '@/types/org-chart';

/**
 * Exports the HTML Canvas element to high-resolution PNG image
 */
export async function exportToImage(element: HTMLElement, filename: string = 'CBS_Org_Chart.png'): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2.5, // High DPI for crisp executive presentations
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });

  const image = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.href = image;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the HTML Canvas element to vector-fitted A4 Landscape PDF
 */
export async function exportToPDF(element: HTMLElement, filename: string = 'CBS_Org_Chart.pdf'): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // A4 Landscape: 297mm x 210mm
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 297;
  const pdfHeight = 210;
  const margin = 8;

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
 * Exports proposal state to a downloadable JSON file
 */
export function exportProposalJSON(state: OrgProposalState, filename: string = 'CBS_Org_Proposal.cbsorg'): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
