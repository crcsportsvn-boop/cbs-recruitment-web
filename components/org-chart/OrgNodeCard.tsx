import React from 'react';
import { OrgNode, DensityMode } from '@/types/org-chart';
import { Sparkles, Edit2, Trash2, Link2, Pencil, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { FlagBadgeGroup } from './CountryFlagSVG';

export type AnchorPosition = 'top' | 'bottom' | 'left' | 'right';

interface OrgNodeCardProps {
  node: OrgNode;
  densityMode: DensityMode;
  showNicknames: boolean;
  isN1View?: boolean;
  isSelected?: boolean;
  isConnectSource?: boolean;
  isConnectTargetCandidate?: boolean;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  collapsedCount?: number;
  onToggleCollapse?: (nodeId: string) => void;
  onSelect?: (node: OrgNode) => void;
  onEdit?: (node: OrgNode) => void;
  onDelete?: (nodeId: string) => void;
  onToggleStatus?: (node: OrgNode) => void;
  onAnchorClick?: (node: OrgNode, anchor: AnchorPosition) => void;
  isDragging?: boolean;
}

export const OrgNodeCard: React.FC<OrgNodeCardProps> = ({
  node,
  densityMode,
  showNicknames,
  isN1View = false,
  isSelected,
  isConnectSource,
  isConnectTargetCandidate,
  hasChildren = false,
  isCollapsed = false,
  collapsedCount = 0,
  onToggleCollapse,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  onAnchorClick,
  isDragging
}) => {
  // Determine if flags should be displayed on this node
  const shouldShowFlags = () => {
    if (isN1View) return true;

    if (node.isVirtual || node.id.includes('PRES') || node.id.includes('THL') || node.id.includes('CRV')) {
      return true;
    }

    if (node.flags?.some(f => f === 'MY' || f === 'TH')) {
      return true;
    }

    const titleLower = (node.title || '').toLowerCase();
    const isHeadOrLeader =
      titleLower.includes('president') ||
      titleLower.includes('director') ||
      titleLower.includes('head') ||
      titleLower.includes('gm') ||
      titleLower.includes('general manager') ||
      titleLower.includes('controller') ||
      titleLower.includes('brand manager');

    return isHeadOrLeader;
  };

  // Clean raw title from legacy flag strings
  const cleanTitle = (node.title || '')
    .replace(/\b(MY|TH|VN|THL)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Status Styling
  const isNewHire = node.status === 'new_hire' || (node.customLabel && node.customLabel.includes('New Hire'));
  const isReplace = node.status === 'replace' || (node.customLabel && node.customLabel.includes('Replace')) || node.title?.toLowerCase().includes('(replace)');
  const isVacant = node.status === 'vacant' || node.nickname?.toLowerCase() === 'vacant';
  const isHighlight = node.status === 'highlight' || !!node.highlightColor;

  let containerBg = 'bg-white';
  let borderStyle = 'border-slate-800';
  let textColor = 'text-slate-900';

  if (isNewHire) {
    containerBg = 'bg-emerald-50/90';
    borderStyle = 'border-emerald-600 border-2';
    textColor = 'text-emerald-950';
  } else if (isReplace) {
    containerBg = 'bg-rose-50/90';
    borderStyle = 'border-rose-500 border-2';
    textColor = 'text-rose-950';
  } else if (isVacant) {
    containerBg = 'bg-slate-50/80';
    borderStyle = 'border-dashed border-slate-400';
    textColor = 'text-slate-500';
  } else if (isHighlight) {
    containerBg = node.highlightColor || 'bg-amber-100';
    borderStyle = 'border-amber-500 border-2';
  }

  const displayName = showNicknames ? (node.nickname || node.holderName || '') : '';

  const handleAnchor = (e: React.MouseEvent, anchor: AnchorPosition) => {
    e.stopPropagation();
    if (onAnchorClick) {
      onAnchorClick(node, anchor);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(node);
    }
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse(node.id);
    }
  };

  return (
    <div
      style={{
        width: node.width || 185,
        minHeight: node.height || 72,
        height: node.height || 72,
        backgroundColor: node.highlightColor ? node.highlightColor : undefined
      }}
      className={`relative group rounded p-1.5 flex flex-col justify-between text-center select-none shadow-xs transition-all border ${borderStyle} ${containerBg} ${
        isConnectSource
          ? 'ring-4 ring-blue-500 shadow-xl scale-105'
          : isConnectTargetCandidate
          ? 'ring-2 ring-emerald-500 hover:ring-4 hover:ring-emerald-600 cursor-pointer animate-pulse'
          : isSelected
          ? 'ring-2 ring-red-600 shadow-md'
          : 'hover:shadow-md'
      } ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* 4 Midpoint Connection Anchors */}
      <button
        type="button"
        title="Connect Reports-To Line (Top)"
        onClick={(e) => handleAnchor(e, 'top')}
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-600 hover:bg-blue-700 border-2 border-white rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-125 transition-all z-40 cursor-crosshair"
      />
      <button
        type="button"
        title="Connect Reporting Line Downward (Bottom)"
        onClick={(e) => handleAnchor(e, 'bottom')}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-600 hover:bg-blue-700 border-2 border-white rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-125 transition-all z-40 cursor-crosshair"
      />
      <button
        type="button"
        title="Connect Matrix Indirect Line (Left)"
        onClick={(e) => handleAnchor(e, 'left')}
        className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-3.5 bg-purple-600 hover:bg-purple-700 border-2 border-white rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-125 transition-all z-40 cursor-crosshair"
      />
      <button
        type="button"
        title="Connect Matrix Indirect Line (Right)"
        onClick={(e) => handleAnchor(e, 'right')}
        className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-3.5 bg-purple-600 hover:bg-purple-700 border-2 border-white rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-125 transition-all z-40 cursor-crosshair"
      />

      {/* Direct Edit Pen Button (Always available on hover) */}
      <button
        type="button"
        title="Edit Position & Reports-To Hierarchy"
        onClick={handleEditClick}
        className="absolute -top-2 -left-2 w-5 h-5 bg-white border border-slate-300 hover:border-blue-600 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-full flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-all z-30 cursor-pointer"
      >
        <Pencil className="w-2.5 h-2.5" />
      </button>

      {/* 2-Line Fixed Height Title Section with perfectly aligned baseline */}
      <div className="flex items-center justify-between gap-1 w-full min-h-[30px] pointer-events-none">
        <div className={`text-[11px] font-bold tracking-tight leading-[1.25] flex-1 text-center line-clamp-2 ${textColor}`}>
          {cleanTitle}
        </div>
        {shouldShowFlags() && <FlagBadgeGroup flags={node.flags} size={13} />}
      </div>

      {/* Person Name / Nickname */}
      {densityMode !== 'position_only' && displayName ? (
        <div className="flex items-center justify-center gap-1 text-[11px] font-medium leading-tight pointer-events-none">
          {isReplace ? (
            <span className="text-red-700 font-bold">({displayName})</span>
          ) : isNewHire ? (
            <span className="text-emerald-800 font-bold">({displayName})</span>
          ) : (
            <span className="text-slate-800">({displayName})</span>
          )}
        </div>
      ) : (
        <div className="h-[14px]" />
      )}

      {/* Department Line */}
      {densityMode === 'full' && node.dept && (
        <div className="flex items-center justify-center text-[9px] text-slate-400 border-t border-slate-100 pt-0.5 pointer-events-none">
          <span className="truncate max-w-[150px] text-slate-500">{node.dept}</span>
        </div>
      )}

      {/* Proposal Custom Badge */}
      {node.customLabel && (
        <div className="absolute -top-2.5 -right-1 text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold shadow-xs pointer-events-none">
          {node.customLabel}
        </div>
      )}

      {/* Interactive Expand / Collapse Pill Button */}
      {hasChildren && (
        <button
          type="button"
          onClick={handleCollapseClick}
          title={isCollapsed ? `Expand ${collapsedCount} subordinate seats` : "Collapse subordinate seats"}
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-40 cursor-pointer transition-all hover:scale-105 ${
            isCollapsed
              ? 'bg-blue-600 text-white border-2 border-white'
              : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          {isCollapsed ? (
            <>
              <Users className="w-2.5 h-2.5" />
              <span>+{collapsedCount}</span>
            </>
          ) : (
            <ChevronUp className="w-3 h-3 text-slate-600" />
          )}
        </button>
      )}

      {/* Floating Action Menu on Hover */}
      <div className="absolute -bottom-3.5 right-1 hidden group-hover:flex items-center gap-0.5 bg-white border border-slate-300 rounded-full px-1 py-0.5 shadow-md z-30">
        {onAnchorClick && (
          <button
            title="Connect reporting line to another seat"
            onClick={(e) => handleAnchor(e, 'bottom')}
            className="p-1 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <Link2 className="w-3 h-3" />
          </button>
        )}
        {onToggleStatus && (
          <button
            title="Toggle Status (Active / New Hire / Replace)"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(node);
            }}
            className="p-1 text-slate-500 hover:text-emerald-600 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
          </button>
        )}
        {onEdit && (
          <button
            title="Edit Position & Hierarchy"
            onClick={handleEditClick}
            className="p-1 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
        {onDelete && (
          <button
            title="Remove Position from Chart"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
