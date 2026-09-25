"use client";

import React, { useState } from 'react';
import { ProposalChange, HeadcountSummary } from '@/types/org-chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GitCompare,
  PlusCircle,
  RefreshCw,
  ArrowRightLeft,
  Edit3,
  Trash2,
  Copy,
  Check,
  Filter
} from 'lucide-react';

interface DiffSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diffList: ProposalChange[];
  summary: HeadcountSummary;
  currentCount: number;
}

export const DiffSummaryModal: React.FC<DiffSummaryModalProps> = ({
  isOpen,
  onClose,
  diffList,
  summary,
  currentCount
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const filteredChanges = diffList.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      searchTerm === '' ||
      item.nodeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const newHireCount = diffList.filter(d => d.type === 'new_hire').length;
  const replaceCount = diffList.filter(d => d.type === 'replace').length;
  const reassignCount = diffList.filter(d => d.type === 'reassigned').length;
  const titleModCount = diffList.filter(d => d.type === 'title_modified').length;

  const handleCopySummary = () => {
    const lines = [
      `=== BÁO CÁO BIẾN ĐỘNG CƠ CẤU TỔ CHỨC (ORG CHART DIFF) ===`,
      `• Định biên hiện tại: ${currentCount} ghế`,
      `• Định biên đề xuất kế hoạch: ${summary.plannedTotal} ghế (Biến động: +${summary.plannedTotal - currentCount} ghế)`,
      `  - Tuyển mới (BP): +${newHireCount} ghế`,
      `  - Thay thế (Replace): ${replaceCount} ghế`,
      `  - Điều chuyển tuyến báo cáo: ${reassignCount} vị trí`,
      `  - Điều chỉnh chức danh: ${titleModCount} vị trí`,
      ``,
      `CHI TIẾT THAY ĐỔI:`,
      ...diffList.map((d, i) => `${i + 1}. [${d.division}] ${d.description}`)
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl border-slate-300">
        <DialogHeader className="p-4 pb-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Báo Cáo So Sánh Biến Động (As-Is vs. Proposal Diff)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 pt-0.5">
                Tổng hợp tất cả các vị trí bổ sung, thay thế và điều chuyển cơ cấu so với sơ đồ hiện tại
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Metric Cards Banner */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50/50 border-b border-slate-200 text-center">
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex flex-col items-center">
            <span className="text-[10.5px] font-semibold text-emerald-800 flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Tuyển mới (BP)
            </span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5">+{newHireCount}</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex flex-col items-center">
            <span className="text-[10.5px] font-semibold text-rose-800 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-rose-600" /> Thay thế
            </span>
            <span className="text-xl font-bold text-rose-700 mt-0.5">{replaceCount}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex flex-col items-center">
            <span className="text-[10.5px] font-semibold text-amber-800 flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" /> Đổi tuyến báo cáo
            </span>
            <span className="text-xl font-bold text-amber-700 mt-0.5">{reassignCount}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg flex flex-col items-center">
            <span className="text-[10.5px] font-semibold text-blue-800 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Sửa chức danh
            </span>
            <span className="text-xl font-bold text-blue-700 mt-0.5">{titleModCount}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 py-2 flex items-center justify-between gap-2 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tất cả ({diffList.length})
            </button>
            <button
              onClick={() => setFilterType('new_hire')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${filterType === 'new_hire' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tuyển mới ({newHireCount})
            </button>
            <button
              onClick={() => setFilterType('replace')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${filterType === 'replace' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Thay thế ({replaceCount})
            </button>
            <button
              onClick={() => setFilterType('reassigned')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${filterType === 'reassigned' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Điều chuyển ({reassignCount})
            </button>
          </div>

          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo chức danh, phòng ban..."
            className="h-7 text-xs w-48"
          />
        </div>

        {/* Change List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[350px]">
          {filteredChanges.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700">Không có biến động nào phù hợp bộ lọc</p>
              <p className="text-[11px] text-slate-400 mt-1">Sơ đồ đề xuất hiện tại đang khớp hoàn toàn với bản gốc.</p>
            </div>
          ) : (
            filteredChanges.map((change, index) => (
              <div
                key={change.id}
                className={`p-3 rounded-lg border flex items-start justify-between gap-3 text-xs ${
                  change.type === 'new_hire'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : change.type === 'replace'
                    ? 'bg-rose-50/60 border-rose-200'
                    : change.type === 'reassigned'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-blue-50/60 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-slate-400 text-[11px] mt-0.5">#{index + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{change.nodeTitle}</span>
                      <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded font-medium text-slate-600">
                        {change.division}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        change.type === 'new_hire' ? 'bg-emerald-600 text-white' :
                        change.type === 'replace' ? 'bg-rose-600 text-white' :
                        change.type === 'reassigned' ? 'bg-amber-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {change.type === 'new_hire' && 'Tuyển mới (BP)'}
                        {change.type === 'replace' && 'Thay thế'}
                        {change.type === 'reassigned' && 'Điều chuyển'}
                        {change.type === 'title_modified' && 'Sửa chức danh'}
                        {change.type === 'removed' && 'Bãi bỏ'}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 mt-1">{change.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between sm:justify-between items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopySummary}
            className="text-xs h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isCopied ? 'Đã sao chép tóm tắt!' : 'Sao chép văn bản tóm tắt'}</span>
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
