import React, { useRef, useState } from 'react';
import { ViewTemplate, DensityMode, OrgChartMode } from '@/types/org-chart';
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
  FileSpreadsheet,
  Image as ImageIcon,
  Save,
  FolderOpen,
  Plus,
  SplitSquareVertical,
  StickyNote,
  RotateCcw,
  Filter,
  Sparkles,
  Layers,
  ChevronDown,
  Eye,
  CheckCircle2,
  FileText,
  ChevronUp,
  Settings
} from 'lucide-react';

interface ProposalToolbarProps {
  mode: OrgChartMode;
  onModeChange: (mode: OrgChartMode) => void;
  onCreateProposal: () => void;
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
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportPDFA3: () => void;
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
  mode,
  onModeChange,
  onCreateProposal,
  template,
  onTemplateChange,
  divisions,
  selectedDivision,
  onDivisionChange,
  densityMode,
  onDensityModeChange,
  showNicknames,
  onToggleNicknames,
  showSumUpTable,
  onToggleSumUpTable,
  onFileUpload,
  onExportExcel,
  onExportPDF,
  onExportPDFA3,
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
    <div className="w-full shrink-0 z-30 select-none flex flex-col">
      {/* Hidden File Inputs */}
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

      {/* Collapsible Main Toolbar Area */}
      <div
        className={`w-full bg-white border-b border-slate-200 px-4 transition-all duration-300 ease-in-out flex flex-col gap-1.5 shadow-xs overflow-hidden ${
          isCollapsed
            ? 'max-h-0 py-0 border-b-0 opacity-0 pointer-events-none'
            : 'max-h-[160px] py-1.5 opacity-100 pointer-events-auto'
        }`}
      >
        {/* TIER 1: Main Ergonomic Command Bar */}
        <div className="flex items-center justify-between gap-3">
        {/* Left: Collapse Button & Mode Switcher (Current / Proposal) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCollapsed(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Thu gọn thanh công cụ"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Thu gọn</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => onModeChange('current')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'current'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="Xem sơ đồ tổ chức hiện hành"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Hiện Tại</span>
            </button>

            <button
              onClick={() => onModeChange('proposal')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'proposal'
                  ? 'bg-[#B91C1C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="Chỉnh sửa mô phỏng cơ cấu tổ chức đề xuất"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Đề Xuất</span>
            </button>
          </div>
        </div>

        {/* Center: Scope Selector (N-1 vs Division) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => onTemplateChange('company_n1')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                template === 'company_n1'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cơ Cấu N-1
            </button>
            <button
              onClick={() => {
                if (template === 'company_n1') {
                  onTemplateChange('custom_division');
                }
              }}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                isDivisionView
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phòng Ban
            </button>
          </div>

          {/* Division Selector if Division mode */}
          {isDivisionView && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-red-600" />
              <select
                value={selectedDivision || 'Crocs'}
                onChange={(e) => onDivisionChange(e.target.value)}
                className="border border-slate-300 rounded-md text-xs py-1 px-2.5 bg-white text-slate-900 font-bold focus:ring-1 focus:ring-red-500 shadow-xs min-w-[200px]"
              >
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Excel Import & Export Hub */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Upload Master Excel */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs h-8 gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold shadow-xs"
            title="Nạp file Excel thực tế để cập nhật cơ cấu Hiện tại"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Nạp Excel</span>
          </Button>

          {/* EXPORT HUB DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="text-xs h-8 gap-1.5 bg-[#B91C1C] hover:bg-red-800 text-white font-bold shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Xuất Dữ Liệu</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white shadow-xl border border-slate-200">
              <DropdownMenuLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Xuất Kế Hoạch
              </DropdownMenuLabel>
              
              <DropdownMenuItem
                onClick={onExportExcel}
                className="text-xs font-semibold text-emerald-800 focus:bg-emerald-50 cursor-pointer gap-2 py-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold">Xuất File Excel Đề Xuất</div>
                  <div className="text-[10px] text-slate-500 font-normal">Kèm danh sách nhân sự và biến động</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onExportPNG}
                className="text-xs font-semibold text-slate-800 focus:bg-slate-100 cursor-pointer gap-2 py-2"
              >
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-bold">Xuất Ảnh PNG Sắc Nét</div>
                  <div className="text-[10px] text-slate-500 font-normal">Độ phân giải cao tối ưu cho bài trình bày</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onExportPDF}
                className="text-xs font-semibold text-slate-800 focus:bg-slate-100 cursor-pointer gap-2 py-2"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <div>
                  <div className="font-bold">Xuất File PDF A4 Khổ Ngang</div>
                  <div className="text-[10px] text-slate-500 font-normal">Tài liệu ký duyệt tiêu chuẩn ban lãnh đạo</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onExportPDFA3}
                className="text-xs font-semibold text-slate-800 focus:bg-slate-100 cursor-pointer gap-2 py-2"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-bold">Xuất File PDF A3 Khổ Rộng</div>
                  <div className="text-[10px] text-slate-500 font-normal">Cho sơ đồ N-1 hoặc phòng ban đông nhân sự</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Lưu Trữ Bản Nháp
              </DropdownMenuLabel>

              <DropdownMenuItem onClick={onSaveDraft} className="text-xs cursor-pointer gap-2 py-1.5">
                <Save className="w-4 h-4 text-slate-600" />
                <span>Lưu File Bản Nháp</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => draftInputRef.current?.click()} className="text-xs cursor-pointer gap-2 py-1.5">
                <FolderOpen className="w-4 h-4 text-slate-600" />
                <span>Mở File Bản Nháp</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onReset} className="text-red-600 text-xs font-semibold cursor-pointer gap-2 py-1.5">
                <RotateCcw className="w-4 h-4 text-red-600" />
                <span>Đặt Lại Bố Cục Mặc Định</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* TIER 2: Context Sub-bar (Adapts to Active Mode) */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between gap-3 text-xs">
        {/* Left Side of Sub-bar: Actions for current Mode */}
        {mode === 'current' && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chế độ Xem Hiện Tại</span>
            </span>
            <Button
              size="sm"
              onClick={onCreateProposal}
              className="text-xs h-6.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 shadow-xs ml-2 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Tạo Đề Xuất Mới</span>
            </Button>
          </div>
        )}

        {mode === 'proposal' && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold mr-1 text-[11px]">Công cụ đề xuất:</span>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddNode('new_hire')}
              className="text-xs h-7 gap-1 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-bold bg-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tuyển mới</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddNode('replace')}
              className="text-xs h-7 gap-1 border-rose-400 text-rose-700 hover:bg-rose-50 font-bold bg-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>Thay thế</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddNode('standard')}
              className="text-xs h-7 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 bg-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>Ghế chuẩn</span>
            </Button>

            <div className="w-[1px] h-4 bg-slate-300 mx-1" />

            <Button
              size="sm"
              variant="outline"
              onClick={onAddDivider}
              className="text-xs h-7 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 bg-white cursor-pointer"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-slate-600" />
              <span>Vạch ngăn</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onAddNote}
              className="text-xs h-7 gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 bg-white cursor-pointer"
            >
              <StickyNote className="w-3.5 h-3.5 text-slate-600" />
              <span>Ghi chú</span>
            </Button>
          </div>
        )}

        {/* Right Side of Sub-bar: Display toggles (Đầy đủ / Gọn & Định Biên) */}
        <div className="flex items-center gap-2">
          {/* Density Switcher: Only 2 options (Đầy đủ & Gọn) */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-md text-[11px]">
            <button
              onClick={() => onDensityModeChange('full')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                densityMode === 'full' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hiển thị đầy đủ chức danh, nhân sự và phòng ban"
            >
              Đầy đủ
            </button>
            <button
              onClick={() => onDensityModeChange('compact')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                densityMode === 'compact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Bố cục siêu tinh gọn, tối ưu không gian hiển thị"
            >
              Gọn
            </button>
          </div>

          {/* Headcount table toggle */}
          <button
            onClick={onToggleSumUpTable}
            className={`px-2 py-1 rounded text-[11px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
              showSumUpTable
                ? 'bg-red-50 text-red-700 border-red-200 shadow-xs'
                : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'
            }`}
            title="Bật/Tắt bảng thống kê tổng số lượng nhân sự"
          >
            <Layers className="w-3 h-3 text-red-600" />
            <span>Định Biên</span>
          </button>
        </div>
      </div>
    </div>

      {/* Slim Collapsed Bar */}
      {isCollapsed && (
        <div className="w-full bg-white/95 border-b border-slate-200 px-4 py-1 flex items-center justify-between shadow-2xs gap-3">
          {/* Left: Open Toolbar + Scope Switcher + Division Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded border border-slate-200 text-xs font-bold text-slate-700 hover:text-red-700 hover:bg-slate-100 transition-all cursor-pointer h-6 shadow-2xs"
              title="Mở thanh công cụ"
            >
              <Settings className="w-3 h-3 text-red-600" />
              <span>Mở công cụ</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Scope Switcher: Cơ cấu N-1 | Phòng ban */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded text-xs h-6">
              <button
                onClick={() => onTemplateChange('company_n1')}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer leading-none text-xs ${
                  template === 'company_n1'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cơ Cấu N-1
              </button>
              <button
                onClick={() => {
                  if (template === 'company_n1') {
                    onTemplateChange('custom_division');
                  }
                }}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer leading-none text-xs ${
                  isDivisionView
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Phòng Ban
              </button>
            </div>

            {/* Division Filter if Division mode */}
            {isDivisionView && (
              <div className="flex items-center gap-1">
                <select
                  value={selectedDivision || 'Crocs'}
                  onChange={(e) => onDivisionChange(e.target.value)}
                  className="border border-slate-300 rounded text-xs py-0.5 px-2 bg-white text-slate-900 font-bold focus:ring-1 focus:ring-red-500 shadow-2xs h-6"
                >
                  {divisions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Nạp Excel & Xuất Dữ Liệu buttons in collapsed bar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer h-6 shadow-2xs"
              title="Nạp file Excel thực tế để cập nhật cơ cấu Hiện tại"
            >
              <UploadCloud className="w-3 h-3 text-blue-600" />
              <span>Nạp Excel</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold text-white bg-[#B91C1C] hover:bg-red-800 transition-all cursor-pointer h-6 shadow-2xs"
                  title="Xuất dữ liệu sơ đồ"
                >
                  <FileDown className="w-3 h-3" />
                  <span>Xuất Dữ Liệu</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white shadow-xl border border-slate-200">
                <DropdownMenuLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Xuất Kế Hoạch
                </DropdownMenuLabel>
                
                <DropdownMenuItem
                  onClick={onExportExcel}
                  className="text-xs font-semibold text-emerald-800 focus:bg-emerald-50 cursor-pointer gap-2 py-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">Xuất File Excel Đề Xuất</div>
                    <div className="text-[10px] text-slate-500 font-normal">Kèm danh sách nhân sự và biến động</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onExportPNG}
                  className="text-xs font-semibold text-slate-800 focus:bg-slate-100 cursor-pointer gap-2 py-2"
                >
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold">Xuất Ảnh PNG Sắc Nét</div>
                    <div className="text-[10px] text-slate-500 font-normal">Độ phân giải cao tối ưu cho bài trình bày</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onExportPDF}
                  className="text-xs font-semibold text-slate-800 focus:bg-slate-100 cursor-pointer gap-2 py-2"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-bold">Xuất File PDF A4 Khổ Ngang</div>
                    <div className="text-[10px] text-slate-500 font-normal">Tài liệu ký duyệt tiêu chuẩn ban lãnh đạo</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onExportPDFA3}
                  className="text-xs font-semibold text-slate-800 focus:bg-slate-100 cursor-pointer gap-2 py-2"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-bold">Xuất File PDF A3 Khổ Rộng</div>
                    <div className="text-[10px] text-slate-500 font-normal">Cho sơ đồ N-1 hoặc phòng ban đông nhân sự</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Lưu Trữ Bản Nháp
                </DropdownMenuLabel>

                <DropdownMenuItem onClick={onSaveDraft} className="text-xs cursor-pointer gap-2 py-1.5">
                  <Save className="w-4 h-4 text-slate-600" />
                  <span>Lưu File Bản Nháp</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => draftInputRef.current?.click()} className="text-xs cursor-pointer gap-2 py-1.5">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Nạp File Bản Nháp (.cbsorg)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};
