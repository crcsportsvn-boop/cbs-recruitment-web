"use client";

import React, { useState } from 'react';
import { ProposalJustificationRow, ProposalChange, OrgNode } from '@/types/org-chart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  ClipboardList,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ProposalJustificationTableProps {
  rows: ProposalJustificationRow[];
  onChange: (rows: ProposalJustificationRow[]) => void;
  diffList: ProposalChange[];
  proposalNodes: OrgNode[];
  selectedDivision?: string;
}

export const ProposalJustificationTable: React.FC<ProposalJustificationTableProps> = ({
  rows,
  onChange,
  diffList,
  proposalNodes,
  selectedDivision
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-sync rows from Diff changes
  const handleAutoSync = () => {
    const existingPosIds = new Set(rows.map(r => r.positionId));
    const newRows: ProposalJustificationRow[] = [...rows];

    diffList.forEach(diff => {
      if (!existingPosIds.has(diff.nodeId)) {
        const matchingNode = proposalNodes.find(n => n.id === diff.nodeId);
        newRows.push({
          id: `just_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          positionId: diff.nodeId,
          title: diff.nodeTitle,
          division: diff.division || selectedDivision || 'Head Office',
          changeType: diff.type === 'new_hire' ? 'new_hire' : diff.type === 'replace' ? 'replace' : diff.type === 'reassigned' ? 'reassigned' : 'other',
          justification: diff.type === 'new_hire' 
            ? 'Mở rộng quy mô kinh doanh và phát triển kênh phân phối' 
            : diff.type === 'replace' 
            ? 'Thay thế nhân sự nghỉ việc / luân chuyển nội bộ' 
            : diff.description,
          timeline: 'Q4/2026',
          jobGrade: matchingNode?.jobGrade || 'JG 5 - 6',
          budgetImpact: 'Trong ngân sách BP đã phê duyệt'
        });
        existingPosIds.add(diff.nodeId);
      }
    });

    onChange(newRows);
  };

  // Add custom empty row
  const handleAddRow = () => {
    const newRow: ProposalJustificationRow = {
      id: `just_${Date.now()}`,
      positionId: `POS_PROP_${rows.length + 1}`,
      title: 'Vị trí đề xuất mới',
      division: selectedDivision || 'Head Office',
      changeType: 'new_hire',
      justification: 'Thuyết minh nhu cầu bổ sung nhân sự...',
      timeline: 'Q1/2027',
      jobGrade: 'JG 5',
      budgetImpact: 'Ngân sách đề xuất mới'
    };
    onChange([...rows, newRow]);
  };

  // Update specific field
  const handleUpdateRow = (id: string, field: keyof ProposalJustificationRow, value: string) => {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    onChange(rows.filter(r => r.id !== id));
  };

  // Copy table to clipboard (Tab-delimited for PowerPoint & Excel direct paste!)
  const handleCopyTable = () => {
    if (rows.length === 0) return;
    const headers = ['STT', 'Mã Vị Trí', 'Chức Danh', 'Phòng Ban', 'Loại Đề Xuất', 'Lý Do & Thuyết Minh', 'Thời Gian Dự Kiến', 'Cấp Bậc (Grade)', 'Ngân Sách / Tác Động'];
    const lines = [headers.join('\t')];

    rows.forEach((r, idx) => {
      lines.push([
        idx + 1,
        r.positionId,
        r.title,
        r.division,
        r.changeType === 'new_hire' ? 'Tuyển mới (BP)' : r.changeType === 'replace' ? 'Thay thế' : r.changeType === 'reassigned' ? 'Điều chuyển' : 'Khác',
        r.justification,
        r.timeline,
        r.jobGrade || '',
        r.budgetImpact || ''
      ].join('\t'));
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden my-3">
      {/* Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Bảng Thuyết Minh & Ghi Chú Đề Xuất (Proposal Justification Matrix)</span>
              <span className="bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-200">
                {rows.length} mục ghi chú
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Dùng để trình bày lý do điều chỉnh cơ cấu trong báo cáo PPT gửi HRBP Manager và HR Director
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoSync}
            className="text-xs h-7 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
            title="Tự động đồng bộ các vị trí thay đổi từ sơ đồ vào bảng"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Đồng bộ từ sơ đồ</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAddRow}
            className="text-xs h-7 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thêm dòng</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyTable}
            disabled={rows.length === 0}
            className="text-xs h-7 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
            title="Sao chép dạng bảng để dán trực tiếp vào slide PowerPoint hoặc Excel"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isCopied ? 'Đã sao chép!' : 'Dán vào PPT'}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(prev => !prev)}
            className="text-slate-500 hover:text-slate-900 h-7 w-7 p-0"
            title={isExpanded ? 'Thu gọn bảng' : 'Mở rộng bảng'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Table Content */}
      {isExpanded && (
        <div className="overflow-x-auto max-h-[380px] p-0">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Chưa có dòng thuyết minh nào</p>
              <p className="text-[11px] mt-1">Bấm <strong>&quot;Đồng bộ từ sơ đồ&quot;</strong> để tự động trích xuất các ghế thay đổi, hoặc bấm <strong>&quot;Thêm dòng&quot;</strong> để tự nhập ghi chú.</p>
            </div>
          ) : (
            <Table className="text-xs">
              <TableHeader className="bg-slate-100/80 sticky top-0 z-10">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="w-10 text-center font-bold text-slate-700">#</TableHead>
                  <TableHead className="w-32 font-bold text-slate-700">Mã Vị Trí</TableHead>
                  <TableHead className="w-48 font-bold text-slate-700">Chức Danh</TableHead>
                  <TableHead className="w-32 font-bold text-slate-700">Phòng Ban</TableHead>
                  <TableHead className="w-28 font-bold text-slate-700">Loại Đề Xuất</TableHead>
                  <TableHead className="min-w-[240px] font-bold text-slate-700">Lý Do & Thuyết Minh Nhu Cầu</TableHead>
                  <TableHead className="w-28 font-bold text-slate-700">Dự Kiến Tuyển</TableHead>
                  <TableHead className="w-24 font-bold text-slate-700">Cấp Bậc</TableHead>
                  <TableHead className="w-40 font-bold text-slate-700">Ngân Sách / Tác Động</TableHead>
                  <TableHead className="w-12 text-center font-bold text-slate-700"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/70 border-b border-slate-100">
                    <TableCell className="text-center font-mono text-slate-400 text-[11px]">{idx + 1}</TableCell>
                    <TableCell>
                      <Input
                        value={row.positionId}
                        onChange={e => handleUpdateRow(row.id, 'positionId', e.target.value)}
                        className="h-7 text-xs font-mono py-1 px-1.5 bg-transparent border-slate-200"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.title}
                        onChange={e => handleUpdateRow(row.id, 'title', e.target.value)}
                        className="h-7 text-xs font-semibold py-1 px-1.5 bg-transparent border-slate-200 text-slate-900"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.division}
                        onChange={e => handleUpdateRow(row.id, 'division', e.target.value)}
                        className="h-7 text-xs py-1 px-1.5 bg-transparent border-slate-200 text-slate-700"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={row.changeType}
                        onChange={e => handleUpdateRow(row.id, 'changeType', e.target.value as any)}
                        className={`h-7 text-[11px] rounded font-semibold border px-1.5 w-full ${
                          row.changeType === 'new_hire'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : row.changeType === 'replace'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="new_hire">Tuyển mới (BP)</option>
                        <option value="replace">Thay thế</option>
                        <option value="reassigned">Điều chuyển</option>
                        <option value="restructure">Tái cơ cấu</option>
                        <option value="other">Khác</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.justification}
                        onChange={e => handleUpdateRow(row.id, 'justification', e.target.value)}
                        placeholder="Nêu lý do kinh doanh hoặc khoảng trống nhân sự..."
                        className="h-7 text-xs py-1 px-2 bg-transparent border-slate-200"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.timeline}
                        onChange={e => handleUpdateRow(row.id, 'timeline', e.target.value)}
                        placeholder="Q4/2026"
                        className="h-7 text-xs py-1 px-1.5 bg-transparent border-slate-200"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.jobGrade || ''}
                        onChange={e => handleUpdateRow(row.id, 'jobGrade', e.target.value)}
                        placeholder="JG 5"
                        className="h-7 text-xs py-1 px-1.5 bg-transparent border-slate-200"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.budgetImpact || ''}
                        onChange={e => handleUpdateRow(row.id, 'budgetImpact', e.target.value)}
                        placeholder="Ngân sách BP / Ngoài BP"
                        className="h-7 text-xs py-1 px-1.5 bg-transparent border-slate-200"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRow(row.id)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
};
