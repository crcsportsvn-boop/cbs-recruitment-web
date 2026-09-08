import React, { useRef } from 'react';
import { ViewTemplate, DensityMode } from '@/types/org-chart';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  UploadCloud,
  FileDown,
  Image as ImageIcon,
  Save,
  FolderOpen,
  Plus,
  SplitSquareVertical,
  StickyNote,
  RotateCcw,
  Filter
} from 'lucide-react';

interface ProposalToolbarProps {
  template: ViewTemplate;
  onTemplateChange: (template: ViewTemplate) => void;
  divisions: string[];
  selectedDivision?: string;
  onDivisionChange: (division: string) => void;
  densityMode: DensityMode;
  onDensityModeChange: (mode: DensityMode) => void;
  showNicknames: boolean;
  onToggleNicknames: () => void;
  showSumUpTable: boolean;
  onToggleSumUpTable: () => void;
  onFileUpload: (file: File) => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onSaveDraft: () => void;
  onLoadDraft: (file: File) => void;
  onAddNode: (type: 'standard' | 'new_hire' | 'replace') => void;
  onAddDivider: () => void;
  onAddNote: () => void;
  onReset: () => void;
  totalOfficeRecords: number;
}

export const ProposalToolbar: React.FC<ProposalToolbarProps> = ({
  template,
  onTemplateChange,
  divisions,
  selectedDivision,
  onDivisionChange,
  densityMode,
  onDensityModeChange,
  onFileUpload,
  onExportPDF,
  onExportPNG,
  onSaveDraft,
  onLoadDraft,
  onAddNode,
  onAddDivider,
  onAddNote,
  onReset,
  totalOfficeRecords
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLoadDraft(e.target.files[0]);
    }
  };

  const isDivisionView = template !== 'company_n1';

  return (
    <div className="flex flex-col gap-2 mb-4 sticky top-20 z-30">
      {/* Row 1: Fixed Global Bar (Never Shifts Layout) */}
      <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm flex items-center justify-between gap-3">
        {/* Left: 2 Primary Views */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => onTemplateChange('company_n1')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              template === 'company_n1'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            Organization N-1
          </button>
          <button
            onClick={() => {
              if (template === 'company_n1') {
                onTemplateChange('custom_division');
              }
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isDivisionView
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            Division
          </button>
        </div>

        {/* Center: Density Mode & Add Proposal */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-md text-xs">
            <button
              onClick={() => onDensityModeChange('full')}
              className={`px-2.5 py-1 rounded transition-all ${densityMode === 'full' ? 'bg-white font-bold text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              title="Full detailed information"
            >
              Full
            </button>
            <button
              onClick={() => onDensityModeChange('position_only')}
              className={`px-2.5 py-1 rounded transition-all ${densityMode === 'position_only' ? 'bg-white font-bold text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              title="Positions only without names"
            >
              Positions Only
            </button>
            <button
              onClick={() => onDensityModeChange('compact')}
              className={`px-2.5 py-1 rounded transition-all ${densityMode === 'compact' ? 'bg-white font-bold text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
              title="Compact view"
            >
              Compact
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold shadow-xs">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Proposal</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg border border-gray-200">
              <DropdownMenuLabel className="text-xs font-bold text-gray-500">Proposal Position</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onAddNode('new_hire')} className="text-emerald-700 text-xs font-medium cursor-pointer">
                + New Hire (BP)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNode('replace')} className="text-rose-700 text-xs font-medium cursor-pointer">
                + Replacement (Replace)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddNode('standard')} className="text-xs font-medium cursor-pointer">
                + Standard Active Position
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAddDivider} className="text-xs font-medium cursor-pointer">
                <SplitSquareVertical className="w-3.5 h-3.5 mr-1.5 text-gray-600" /> Add Divider
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddNote} className="text-xs font-medium cursor-pointer">
                <StickyNote className="w-3.5 h-3.5 mr-1.5 text-gray-600" /> Add Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Upload Excel, Draft, Export Buttons (Fixed Location) */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsm,.xlsx,.xls"
            className="hidden"
          />
          <input
            type="file"
            ref={draftInputRef}
            onChange={handleDraftChange}
            accept=".cbsorg,.json"
            className="hidden"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs h-8 gap-1.5 text-gray-700 border-gray-300 hover:bg-gray-100 shadow-xs"
            title="Upload Excel workbook (CBS_Org_Chart.xlsm)"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Excel ({totalOfficeRecords > 0 ? totalOfficeRecords : 201} HO)</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-xs h-8 px-2 text-gray-600 hover:bg-gray-100" title="Offline Draft Storage">
                <Save className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg border border-gray-200">
              <DropdownMenuItem onClick={onSaveDraft} className="text-xs cursor-pointer">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft (.cbsorg)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => draftInputRef.current?.click()} className="text-xs cursor-pointer">
                <FolderOpen className="w-3.5 h-3.5 mr-1.5" /> Open Draft File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onReset} className="text-red-600 text-xs cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="outline"
            onClick={onExportPNG}
            className="text-xs h-8 gap-1 border-gray-300 text-gray-800 hover:bg-gray-50 shadow-xs"
            title="Export Ultra-HD PNG (300 DPI) for PowerPoint"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>Export PNG</span>
          </Button>

          <Button
            size="sm"
            onClick={onExportPDF}
            className="text-xs h-8 gap-1.5 bg-[#EE2E24] hover:bg-[#D5261C] text-white shadow-xs font-semibold"
            title="Export Vector PDF A4 Landscape for BOD sign-off"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF (A4)</span>
          </Button>
        </div>
      </div>

      {/* Row 2: Sub-bar with Division Slicer (Displayed when in Division View) */}
      {isDivisionView && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-700 text-xs font-bold">
              <Filter className="w-3.5 h-3.5 text-red-600" />
              <span>Select Division:</span>
            </div>
            <select
              value={selectedDivision || 'Crocs'}
              onChange={(e) => onDivisionChange(e.target.value)}
              className="border border-slate-300 rounded-md text-xs py-1.5 px-3 bg-white text-slate-900 font-bold focus:ring-1 focus:ring-red-500 shadow-xs min-w-[280px]"
            >
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-500 font-medium italic">
            * Headcount Summary strictly counts positions in this Division.
          </div>
        </div>
      )}
    </div>
  );
};
