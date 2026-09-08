import React from 'react';
import { HeadcountSummary } from '@/types/org-chart';
import { Users, UserPlus, RefreshCw, Layers } from 'lucide-react';

interface SumUpWidgetProps {
  summary: HeadcountSummary;
  isVisible: boolean;
  onToggleVisible: () => void;
  brandTitle?: string;
}

export const SumUpWidget: React.FC<SumUpWidgetProps> = ({
  summary,
  isVisible,
  onToggleVisible,
  brandTitle
}) => {
  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisible}
        className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold shadow-sm hover:bg-gray-50 transition-all"
        title="Show Headcount Summary Table"
      >
        <Layers className="w-3.5 h-3.5 text-red-600" />
        <span>Headcount Summary ({summary.plannedTotal} HCs)</span>
      </button>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg p-3 shadow-md text-xs select-none max-w-sm">
      <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2">
        <div className="font-bold text-gray-900 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-red-600" />
          <span>Headcount Summary {brandTitle ? `- ${brandTitle}` : ''}</span>
        </div>
        <button
          onClick={onToggleVisible}
          className="text-gray-400 hover:text-gray-600 text-xs px-1 hover:bg-gray-100 rounded"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 p-1.5 rounded border border-gray-100">
          <div className="text-[10px] text-gray-500 font-medium">Total Seats</div>
          <div className="text-sm font-bold text-gray-900">{summary.totalSeats}</div>
        </div>
        <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100">
          <div className="text-[10px] text-emerald-700 font-medium">Occupied</div>
          <div className="text-sm font-bold text-emerald-800">{summary.occupied}</div>
        </div>
        <div className="bg-amber-50 p-1.5 rounded border border-amber-100">
          <div className="text-[10px] text-amber-700 font-medium">Vacant</div>
          <div className="text-sm font-bold text-amber-800">{summary.vacant}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 text-center">
        <div className="bg-emerald-50/70 p-1.5 rounded border border-emerald-200">
          <div className="text-[10px] text-emerald-800 flex items-center justify-center gap-1 font-medium">
            <UserPlus className="w-3 h-3 text-emerald-600" />
            <span>New Hire BP</span>
          </div>
          <div className="text-sm font-bold text-emerald-700">+{summary.newHireBP}</div>
        </div>
        <div className="bg-rose-50 p-1.5 rounded border border-rose-200">
          <div className="text-[10px] text-rose-800 flex items-center justify-center gap-1 font-medium">
            <RefreshCw className="w-3 h-3 text-rose-600" />
            <span>Replace</span>
          </div>
          <div className="text-sm font-bold text-rose-700">{summary.replacement}</div>
        </div>
      </div>

      <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-gray-700 font-semibold">
        <span>Planned Total:</span>
        <span className="text-base text-red-600 font-bold">{summary.plannedTotal} HCs</span>
      </div>
    </div>
  );
};
