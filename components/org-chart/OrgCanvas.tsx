import React, { useRef, useState, useEffect, useCallback } from 'react';
import { OrgNode, IndirectLink, CustomDivider, CustomNote, DensityMode, HeadcountSummary, ViewTemplate, OrgChartMode, ProposalChange } from '@/types/org-chart';
import { PillarPill, Headcount3YRow } from '@/lib/org-chart/department-blueprints';
import { OrgNodeCard, AnchorPosition } from './OrgNodeCard';
import { CustomNoteOverlay } from './CustomNoteOverlay';
import { SumUpWidget } from './SumUpWidget';
import { ZoomIn, ZoomOut, Maximize2, Move, Trash2, Edit2, XCircle, RotateCcw } from 'lucide-react';

interface OrgCanvasProps {
  nodes: OrgNode[];
  indirectLinks: IndirectLink[];
  dividers: CustomDivider[];
  notes: CustomNote[];
  template: ViewTemplate;
  selectedDivision?: string;
  pillarPills?: PillarPill[];
  headcount3Y?: Headcount3YRow[];
  slideTitle?: string;
  hasCRVShared?: boolean;
  densityMode: DensityMode;
  showNicknames: boolean;
  showSumUpTable: boolean;
  onToggleSumUpTable: () => void;
  summary: HeadcountSummary;
  mode?: OrgChartMode;
  diffMap?: Map<string, ProposalChange>;
  connectingSource?: { node: OrgNode; anchor: AnchorPosition } | null;
  onStartConnect?: (node: OrgNode, anchor: AnchorPosition) => void;
  onCompleteConnect?: (targetNode: OrgNode) => void;
  onCancelConnect?: () => void;
  onToggleCollapse?: (nodeId: string) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeSelect: (node: OrgNode) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeToggleStatus: (node: OrgNode) => void;
  onNoteMove: (noteId: string, x: number, y: number) => void;
  onNoteChange: (noteId: string, text: string) => void;
  onNoteDelete: (nodeId: string) => void;
  onDividerMove: (dividerId: string, position: number) => void;
  onDividerEdit: (divider: CustomDivider) => void;
  onDividerDelete: (dividerId: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  selectedNodeId?: string;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export interface SmartGuideLine {
  id: string;
  type: 'vertical' | 'horizontal';
  pos: number;
  start: number;
  end: number;
  label?: string;
}

const getNodeW = (n?: OrgNode | null) => Math.max(n?.width || 185, 185);
const getNodeH = (n?: OrgNode | null) => Math.max(n?.height || 76, 76);

export const OrgCanvas: React.FC<OrgCanvasProps> = ({
  nodes,
  indirectLinks,
  dividers,
  notes,
  template,
  selectedDivision,
  pillarPills = [],
  headcount3Y = [],
  slideTitle,
  hasCRVShared = false,
  densityMode,
  showNicknames,
  showSumUpTable,
  onToggleSumUpTable,
  summary,
  mode = 'proposal',
  diffMap,
  connectingSource,
  onStartConnect,
  onCompleteConnect,
  onCancelConnect,
  onToggleCollapse,
  onNodeMove,
  onNodeSelect,
  onNodeDelete,
  onNodeToggleStatus,
  onNoteMove,
  onNoteChange,
  onNoteDelete,
  onDividerMove,
  onDividerEdit,
  onDividerDelete,
  canvasWidth,
  canvasHeight,
  selectedNodeId,
  canvasRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.9); // Default 90% view as requested
  const [isFitMode, setIsFitMode] = useState<boolean>(false);

  // Dynamic bounds calculation with strictly preserved 4:3 (3x4) presentation slide aspect ratio
  const allNodesMaxX = nodes.reduce((max, n) => Math.max(max, (n.x || 0) + getNodeW(n)), 0);
  const allNodesMaxY = nodes.reduce((max, n) => Math.max(max, (n.y || 0) + getNodeH(n)), 0);
  const reqBaseW = Math.max(canvasWidth, allNodesMaxX + 80, 880);
  const reqBaseH = Math.max(canvasHeight, allNodesMaxY + 80, 660);

  const isDyson = selectedDivision?.trim().toLowerCase().includes('dyson');
  const isN1 = template === 'company_n1';
  let effectiveCanvasWidth = reqBaseW;
  let effectiveCanvasHeight = (isDyson || isN1) ? reqBaseH : Math.round(effectiveCanvasWidth * 0.75);

  if (!isDyson && !isN1 && effectiveCanvasHeight < reqBaseH) {
    effectiveCanvasHeight = reqBaseH;
    effectiveCanvasWidth = Math.round(effectiveCanvasHeight * (4 / 3));
  }

  // Active Dynamic Smart Guides during drag (PowerPoint-style alignment rulers)
  const [activeGuides, setActiveGuides] = useState<SmartGuideLine[]>([]);

  // Pan offset state for Space+Drag panning
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isSpaceDown, setIsSpaceDown] = useState<boolean>(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; offsetX: number; offsetY: number } | null>(null);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [draggingDividerId, setDraggingDividerId] = useState<string | null>(null);

  const dragStartPos = useRef<{ x: number; y: number; originX: number; originY: number }>({
    x: 0,
    y: 0,
    originX: 0,
    originY: 0
  });

  // Track subtree positions for hierarchical drag
  const dragSubtreeRef = useRef<{
    descendantIds: string[];
    initialPositions: Map<string, { x: number; y: number }>;
  } | null>(null);

  // Compute fit zoom to guarantee 100% chart fits within container in 1 single frame
  const calculateFitZoom = useCallback(() => {
    if (!containerRef.current) return 0.8;
    const availableWidth = containerRef.current.clientWidth - 40;
    const availableHeight = containerRef.current.clientHeight - 60;
    if (availableWidth <= 0 || effectiveCanvasWidth <= 0 || availableHeight <= 0 || effectiveCanvasHeight <= 0) return 0.8;
    const scaleX = availableWidth / effectiveCanvasWidth;
    const scaleY = availableHeight / effectiveCanvasHeight;
    const scale = Math.min(scaleX, scaleY);
    return Math.max(0.2, Math.min(1.15, Math.round(scale * 100) / 100));
  }, [effectiveCanvasWidth, effectiveCanvasHeight]);

  // Space key listeners for panning mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        // Only if not focused on input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setIsSpaceDown(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
        setIsPanning(false);
        panStartRef.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Always scroll to top when template or division changes so Head card is instantly visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
    if (selectedDivision?.trim().toLowerCase().includes('dyson')) {
      const fit = calculateFitZoom();
      setZoom(fit);
      setIsFitMode(true);
    }
  }, [template, selectedDivision, calculateFitZoom]);


  // Helper to get all descendant IDs of a node
  const getDescendantIds = (nodeId: string): string[] => {
    const descendants: string[] = [];
    const directChildren = nodes.filter(n => n.reportsToId === nodeId);
    directChildren.forEach(c => {
      descendants.push(c.id);
      descendants.push(...getDescendantIds(c.id));
    });
    return descendants;
  };

  // Handle Drag of Nodes (Hierarchical Subtree Drag)
  const handleNodeMouseDown = (e: React.MouseEvent, node: OrgNode) => {
    // If space is held, don't drag nodes - let container handle panning
    if (isSpaceDown) return;

    if (connectingSource) {
      e.stopPropagation();
      if (onCompleteConnect && node.id !== connectingSource.node.id) {
        onCompleteConnect(node);
      }
      return;
    }

    e.stopPropagation();
    setDraggingNodeId(node.id);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      originX: node.x || 0,
      originY: node.y || 0
    };

    const descIds = getDescendantIds(node.id);
    const initialPositions = new Map<string, { x: number; y: number }>();
    initialPositions.set(node.id, { x: node.x || 0, y: node.y || 0 });
    descIds.forEach(id => {
      const n = nodes.find(item => item.id === id);
      if (n) initialPositions.set(id, { x: n.x || 0, y: n.y || 0 });
    });
    dragSubtreeRef.current = { descendantIds: descIds, initialPositions };
  };

  // Handle Drag of Notes
  const handleNoteMouseDown = (e: React.MouseEvent, note: CustomNote) => {
    e.stopPropagation();
    setDraggingNoteId(note.id);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      originX: note.x || 0,
      originY: note.y || 0
    };
  };

  // Handle Drag of Divider
  const handleDividerMouseDown = (e: React.MouseEvent, divider: CustomDivider) => {
    e.stopPropagation();
    setDraggingDividerId(divider.id);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      originX: divider.position,
      originY: 0
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning mode (Space+Drag)
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.mouseX;
      const dy = e.clientY - panStartRef.current.mouseY;
      setPanOffset({
        x: panStartRef.current.offsetX + dx,
        y: panStartRef.current.offsetY + dy
      });
      return;
    }

    if (draggingNodeId) {
      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const dy = (e.clientY - dragStartPos.current.y) / zoom;
      const rawX = dragStartPos.current.originX + dx;
      const rawY = dragStartPos.current.originY + dy;

      const draggingNode = nodes.find(n => n.id === draggingNodeId);
      const dw = getNodeW(draggingNode);
      const dh = getNodeH(draggingNode);

      let snappedX = rawX;
      let snappedY = rawY;
      const newGuides: SmartGuideLine[] = [];
      const SNAP_THRESHOLD = 8; // Snap sensitivity in pixels

      const descendantSet = new Set(dragSubtreeRef.current?.descendantIds || []);
      const candidateNodes = nodes.filter(n => n.id !== draggingNodeId && !descendantSet.has(n.id));

      // 1. Dynamic Vertical Alignment (Centers, Left edges, Right edges)
      const curCenterX = rawX + dw / 2;
      let xSnapped = false;

      for (const other of candidateNodes) {
        const ow = getNodeW(other);
        const oh = getNodeH(other);
        const otherCenterX = (other.x || 0) + ow / 2;
        const otherLeft = other.x || 0;
        const otherRight = (other.x || 0) + ow;

        if (!xSnapped && Math.abs(curCenterX - otherCenterX) <= SNAP_THRESHOLD) {
          snappedX = otherCenterX - dw / 2;
          xSnapped = true;
          newGuides.push({
            id: `v_center_${other.id}`,
            type: 'vertical',
            pos: otherCenterX,
            start: Math.min(snappedY, other.y || 0) - 20,
            end: Math.max(snappedY + dh, (other.y || 0) + oh) + 20,
            label: 'Căn giữa'
          });
        } else if (!xSnapped && Math.abs(rawX - otherLeft) <= SNAP_THRESHOLD) {
          snappedX = otherLeft;
          xSnapped = true;
          newGuides.push({
            id: `v_left_${other.id}`,
            type: 'vertical',
            pos: otherLeft,
            start: Math.min(snappedY, other.y || 0) - 20,
            end: Math.max(snappedY + dh, (other.y || 0) + oh) + 20,
            label: 'Căn trái'
          });
        } else if (!xSnapped && Math.abs(rawX + dw - otherRight) <= SNAP_THRESHOLD) {
          snappedX = otherRight - dw;
          xSnapped = true;
          newGuides.push({
            id: `v_right_${other.id}`,
            type: 'vertical',
            pos: otherRight,
            start: Math.min(snappedY, other.y || 0) - 20,
            end: Math.max(snappedY + dh, (other.y || 0) + oh) + 20,
            label: 'Căn phải'
          });
        }
      }

      // 2. Dynamic Horizontal Alignment (Centers, Top edges, Bottom edges)
      const curCenterY = rawY + dh / 2;
      let ySnapped = false;

      for (const other of candidateNodes) {
        const ow = getNodeW(other);
        const oh = getNodeH(other);
        const otherCenterY = (other.y || 0) + oh / 2;
        const otherTop = other.y || 0;
        const otherBottom = (other.y || 0) + oh;

        if (!ySnapped && Math.abs(curCenterY - otherCenterY) <= SNAP_THRESHOLD) {
          snappedY = otherCenterY - dh / 2;
          ySnapped = true;
          newGuides.push({
            id: `h_center_${other.id}`,
            type: 'horizontal',
            pos: otherCenterY,
            start: Math.min(snappedX, other.x || 0) - 20,
            end: Math.max(snappedX + dw, (other.x || 0) + ow) + 20,
            label: 'Căn hàng'
          });
        } else if (!ySnapped && Math.abs(rawY - otherTop) <= SNAP_THRESHOLD) {
          snappedY = otherTop;
          ySnapped = true;
          newGuides.push({
            id: `h_top_${other.id}`,
            type: 'horizontal',
            pos: otherTop,
            start: Math.min(snappedX, other.x || 0) - 20,
            end: Math.max(snappedX + dw, (other.x || 0) + ow) + 20,
            label: 'Căn đỉnh'
          });
        } else if (!ySnapped && Math.abs(rawY + dh - otherBottom) <= SNAP_THRESHOLD) {
          snappedY = otherBottom - dh;
          ySnapped = true;
          newGuides.push({
            id: `h_bottom_${other.id}`,
            type: 'horizontal',
            pos: otherBottom,
            start: Math.min(snappedX, other.x || 0) - 20,
            end: Math.max(snappedX + dw, (other.x || 0) + ow) + 20,
            label: 'Căn đáy'
          });
        }
      }

      setActiveGuides(newGuides);

      const newX = Math.max(10, Math.round(snappedX));
      const newY = Math.max(10, Math.round(snappedY));
      onNodeMove(draggingNodeId, newX, newY);

      // Move children together so subtree never breaks!
      if (dragSubtreeRef.current) {
        const deltaX = newX - dragStartPos.current.originX;
        const deltaY = newY - dragStartPos.current.originY;
        dragSubtreeRef.current.descendantIds.forEach(cId => {
          const initPos = dragSubtreeRef.current?.initialPositions.get(cId);
          if (initPos) {
            onNodeMove(cId, Math.max(10, initPos.x + deltaX), Math.max(10, initPos.y + deltaY));
          }
        });
      }
    } else if (draggingNoteId) {
      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const dy = (e.clientY - dragStartPos.current.y) / zoom;
      const newX = Math.max(10, Math.round((dragStartPos.current.originX + dx) / 10) * 10);
      const newY = Math.max(10, Math.round((dragStartPos.current.originY + dy) / 10) * 10);
      onNoteMove(draggingNoteId, newX, newY);
    } else if (draggingDividerId) {
      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const newPos = Math.max(100, Math.round((dragStartPos.current.originX + dx) / 10) * 10);
      onDividerMove(draggingDividerId, newPos);
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setDraggingNoteId(null);
    setDraggingDividerId(null);
    dragSubtreeRef.current = null;
    setIsPanning(false);
    panStartRef.current = null;
    setActiveGuides([]);
  };

  // Container-level mousedown for panning
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (isSpaceDown) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        offsetX: panOffset.x,
        offsetY: panOffset.y
      };
    }
  };

  const nodeMap = new Map<string, OrgNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Compute connecting source coordinate if in connect mode
  let connectStartCoord: { x: number; y: number } | null = null;
  if (connectingSource) {
    const sNode = connectingSource.node;
    const w = sNode.width || 165;
    const h = sNode.height || 68;
    const nx = sNode.x || 0;
    const ny = sNode.y || 0;

    if (connectingSource.anchor === 'top') {
      connectStartCoord = { x: nx + w / 2, y: ny };
    } else if (connectingSource.anchor === 'bottom') {
      connectStartCoord = { x: nx + w / 2, y: ny + h };
    } else if (connectingSource.anchor === 'left') {
      connectStartCoord = { x: nx, y: ny + h / 2 };
    } else {
      connectStartCoord = { x: nx + w, y: ny + h / 2 };
    }
  }

  // Group direct children by Parent ID for Grouped Bus Rendering
  const childrenByParent = new Map<string, OrgNode[]>();
  nodes.forEach(node => {
    if (node.reportsToId && nodeMap.has(node.reportsToId)) {
      if (!childrenByParent.has(node.reportsToId)) {
        childrenByParent.set(node.reportsToId, []);
      }
      childrenByParent.get(node.reportsToId)!.push(node);
    }
  });

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full flex-1 rounded-xl border p-2 shadow-inner flex flex-col items-center justify-start transition-all duration-300 bg-slate-100 border-slate-300 overflow-auto"
      style={{ cursor: isSpaceDown ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Floating Active Connection Mode Banner */}
      {connectingSource && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl animate-bounce">
          <span className="text-xs font-bold">
            🔗 Đang nối từ [{connectingSource.node.title}]: Nhấp vào vị trí đích để tạo liên kết
          </span>
          <button
            onClick={onCancelConnect}
            className="bg-white/20 hover:bg-white/40 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" /> Hủy
          </button>
        </div>
      )}

      {/* Floating Zoom Controls: Co vừa, 100%, Zoom Out, Zoom In */}
      <div className="absolute top-3 right-4 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg p-1 shadow-md">
        <button
          onClick={() => {
            setIsFitMode(true);
            setPanOffset({ x: 0, y: 0 });
            setZoom(calculateFitZoom());
          }}
          className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
            isFitMode
              ? 'bg-[#B91C1C] text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 bg-slate-50'
          }`}
          title="Tự động co giãn vừa khung nhìn màn hình"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Co vừa</span>
        </button>

        <button
          onClick={() => {
            setIsFitMode(false);
            setZoom(1);
          }}
          className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
            !isFitMode && Math.round(zoom * 100) === 100
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 bg-slate-50'
          }`}
          title="Kích thước gốc 100%"
        >
          100%
        </button>

        <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

        <button
          onClick={() => {
            setIsFitMode(false);
            setZoom(prev => Math.max(0.2, Math.round((prev - 0.1) * 10) / 10));
          }}
          className="p-1 text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-mono font-bold px-1 text-slate-800 min-w-[34px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => {
            setIsFitMode(false);
            setZoom(prev => Math.min(1.8, Math.round((prev + 0.1) * 10) / 10));
          }}
          className="p-1 text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
          title="Phóng to"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Headcount Summary Widget */}
      {showSumUpTable && (
        <div className="absolute bottom-4 left-6 z-40">
          <SumUpWidget
            summary={summary}
            isVisible={showSumUpTable}
            onToggleVisible={onToggleSumUpTable}
          />
        </div>
      )}

      {/* Printable / Exportable Canvas Area wrapped in visual centering container */}
      <div
        style={{
          width: Math.round(effectiveCanvasWidth * zoom),
          height: Math.round(effectiveCanvasHeight * zoom)
        }}
        className="relative shrink-0 my-8 mx-auto transition-all duration-100"
      >
        <div
          ref={canvasRef}
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: 'top left',
            width: effectiveCanvasWidth,
            height: effectiveCanvasHeight
          }}
          className="relative bg-white shadow-2xl transition-all duration-100 select-none rounded-sm border border-slate-200 shrink-0"
        >
          {/* Top-Left Division Banner (Omitted for N-1) */}
          {template !== 'company_n1' && selectedDivision && (
            <div className="absolute left-8 top-6 z-20 pointer-events-none select-none">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-6 bg-slate-900 rounded-full" />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans uppercase">
                  {selectedDivision.trim().toLowerCase().endsWith('division')
                    ? selectedDivision.trim()
                    : `${selectedDivision.trim()} Division`}
                </h1>
              </div>
            </div>
          )}

          {/* Inner Diagram Canvas */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: effectiveCanvasWidth,
              height: effectiveCanvasHeight
            }}
          >

          {/* SVG Canvas for Connectors, Orthogonal Dotted Lines & Dividers */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
            <marker
              id="arrow-solid"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a" />
            </marker>

            <marker
              id="arrow-dashed"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
            </marker>
          </defs>

          {/* 1. Direct Reporting Lines (Column-Aware Bus Tree & Column Stacks) */}
          {Array.from(childrenByParent.entries()).map(([parentId, children]) => {
            const parent = nodeMap.get(parentId);
            if (!parent || parent.x === undefined || parent.y === undefined) return null;
            if (parent.isCollapsed) return null;

            const pw = getNodeW(parent);
            const ph = getNodeH(parent);
            const parentCenterX = Math.round(parent.x + pw / 2);
            const parentBottomY = parent.y + ph;

            // Group children into columns based on X coordinate (tolerance 35px)
            const columns: OrgNode[][] = [];
            const sortedChildren = [...children].sort((a, b) => (a.x || 0) - (b.x || 0));

            sortedChildren.forEach(child => {
              const cx = child.x || 0;
              const existingCol = columns.find(col => col[0] && Math.abs((col[0].x || 0) - cx) <= 35);
              if (existingCol) {
                existingCol.push(child);
              } else {
                columns.push([child]);
              }
            });

            // Sort children within each column top-to-bottom by Y coordinate
            columns.forEach(col => col.sort((a, b) => (a.y || 0) - (b.y || 0)));

            // Case A: Single vertical column directly below parent
            if (columns.length === 1 && columns[0] && columns[0][0]) {
              const col = columns[0];
              const firstChild = col[0]!;
              const firstChildCenterX = Math.round((firstChild.x || 0) + getNodeW(firstChild) / 2);
              const firstChildTopY = firstChild.y || 0;

              return (
                <g key={`bus_col_${parentId}`}>
                  {/* Stem from parent to first child */}
                  {Math.abs(parentCenterX - firstChildCenterX) < 5 ? (
                    <path
                      d={`M ${parentCenterX} ${parentBottomY} V ${firstChildTopY}`}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow-solid)"
                    />
                  ) : (
                    <path
                      d={`M ${parentCenterX} ${parentBottomY} V ${Math.round(parentBottomY + (firstChildTopY - parentBottomY) / 2)} H ${firstChildCenterX} V ${firstChildTopY}`}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow-solid)"
                    />
                  )}

                  {/* Sequential chain between children in the same column (never crosses a node) */}
                  {col.map((c, idx) => {
                    if (idx === 0) return null;
                    const prev = col[idx - 1];
                    if (!prev) return null;
                    const prevCenterX = Math.round((prev.x || 0) + getNodeW(prev) / 2);
                    const prevBottomY = (prev.y || 0) + getNodeH(prev);
                    const currTopY = c.y || 0;

                    return (
                      <path
                        key={`chain_${prev.id}_${c.id}`}
                        d={`M ${prevCenterX} ${prevBottomY} V ${currTopY}`}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.5"
                        markerEnd="url(#arrow-solid)"
                      />
                    );
                  })}
                </g>
              );
            }

            // Case B: Multi-column branching
            const minTopY = Math.min(...children.map(c => c.y || 0));
            const busY = Math.round(parentBottomY + Math.max(15, (minTopY - parentBottomY) / 2));

            let minColCenterX = Infinity;
            let maxColCenterX = -Infinity;

            const colData: { col: OrgNode[]; colCenterX: number; firstChildTopY: number }[] = [];
            columns.forEach(col => {
              const firstChild = col[0];
              if (!firstChild) return;
              const colCenterX = Math.round((firstChild.x || 0) + getNodeW(firstChild) / 2);
              if (colCenterX < minColCenterX) minColCenterX = colCenterX;
              if (colCenterX > maxColCenterX) maxColCenterX = colCenterX;
              colData.push({ col, colCenterX, firstChildTopY: firstChild.y || 0 });
            });

            return (
              <g key={`bus_multi_${parentId}`}>
                {/* Stem from parent down to bus */}
                <path
                  d={`M ${parentCenterX} ${parentBottomY} V ${busY}`}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />

                {/* Horizontal Bus */}
                <path
                  d={`M ${Math.min(minColCenterX, parentCenterX)} ${busY} H ${Math.max(maxColCenterX, parentCenterX)}`}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />

                {/* Drops to each column */}
                {colData.map(({ col, colCenterX, firstChildTopY }) => {
                  const leadChild = col[0];
                  if (!leadChild) return null;
                  return (
                    <g key={`col_branch_${leadChild.id}`}>
                      {/* Drop from bus to top child of column */}
                      <path
                        d={`M ${colCenterX} ${busY} V ${firstChildTopY}`}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.5"
                        markerEnd="url(#arrow-solid)"
                      />

                      {/* Sequential chain between children in the same column */}
                      {col.map((c, idx) => {
                        if (idx === 0) return null;
                        const prev = col[idx - 1];
                        if (!prev) return null;
                        const prevCenterX = Math.round((prev.x || 0) + getNodeW(prev) / 2);
                        const prevBottomY = (prev.y || 0) + getNodeH(prev);
                        const currTopY = c.y || 0;

                        return (
                          <path
                            key={`chain_sub_${prev.id}_${c.id}`}
                            d={`M ${prevCenterX} ${prevBottomY} V ${currTopY}`}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="1.5"
                            markerEnd="url(#arrow-solid)"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* 2. Indirect Matrix Lines (Dashed, Orthogonal Right-Angle Path) */}
          {indirectLinks.map(link => {
            const fromNode = nodeMap.get(link.fromId);
            const toNode = nodeMap.get(link.toId);
            if (!fromNode || !toNode || fromNode.x === undefined || toNode.x === undefined) return null;

            const fromCenterX = (fromNode.x || 0) + getNodeW(fromNode) / 2;
            const fromCenterY = (fromNode.y || 0) + getNodeH(fromNode) / 2;
            const toCenterX = (toNode.x || 0) + getNodeW(toNode) / 2;
            const toCenterY = (toNode.y || 0) + getNodeH(toNode) / 2;

            const isLeftToRight = fromCenterX < toCenterX;
            const startX = isLeftToRight ? (fromNode.x || 0) + getNodeW(fromNode) : (fromNode.x || 0);
            const endX = isLeftToRight ? (toNode.x || 0) : (toNode.x || 0) + getNodeW(toNode);

            const midX = Math.round(startX + (endX - startX) / 2);

            return (
              <g key={`ind_${link.id}`}>
                <path
                  d={`M ${startX} ${fromCenterY} H ${midX} V ${toCenterY} H ${endX}`}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="5,4"
                  markerEnd="url(#arrow-dashed)"
                />
              </g>
            );
          })}

          {/* 3. Real-time Connection preview when connecting */}
          {connectingSource && connectStartCoord && (
            <line
              x1={connectStartCoord.x}
              y1={connectStartCoord.y}
              x2={connectingSource.node.x || 0}
              y2={connectingSource.node.y || 0}
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}

          {/* 4. Dynamic Smart Guides (PowerPoint-style alignment rulers during drag) */}
          {activeGuides.map(guide => {
            if (guide.type === 'vertical') {
              return (
                <g key={guide.id} className="pointer-events-none z-50">
                  <line
                    x1={guide.pos}
                    y1={Math.max(0, guide.start)}
                    x2={guide.pos}
                    y2={guide.end}
                    stroke="#ec4899"
                    strokeWidth="1.5"
                    strokeDasharray="5,3"
                  />
                  <circle cx={guide.pos} cy={Math.max(0, guide.start)} r="3.5" fill="#ec4899" />
                  <circle cx={guide.pos} cy={guide.end} r="3.5" fill="#ec4899" />
                  {guide.label && (
                    <text
                      x={guide.pos + 5}
                      y={Math.max(20, guide.start + 14)}
                      fill="#be185d"
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none"
                    >
                      {guide.label}
                    </text>
                  )}
                </g>
              );
            } else {
              return (
                <g key={guide.id} className="pointer-events-none z-50">
                  <line
                    x1={Math.max(0, guide.start)}
                    y1={guide.pos}
                    x2={guide.end}
                    y2={guide.pos}
                    stroke="#ec4899"
                    strokeWidth="1.5"
                    strokeDasharray="5,3"
                  />
                  <circle cx={Math.max(0, guide.start)} cy={guide.pos} r="3.5" fill="#ec4899" />
                  <circle cx={guide.end} cy={guide.pos} r="3.5" fill="#ec4899" />
                  {guide.label && (
                    <text
                      x={Math.max(20, guide.start + 10)}
                      y={guide.pos - 5}
                      fill="#be185d"
                      fontSize="9"
                      fontWeight="bold"
                      className="select-none"
                    >
                      {guide.label}
                    </text>
                  )}
                </g>
              );
            }
          })}
        </svg>

        {/* 4. Render Custom Dividers */}
        {dividers.map(div => {
          if (div.type === 'vertical') {
            return (
              <div
                key={div.id}
                style={{
                  position: 'absolute',
                  left: div.position,
                  top: 20,
                  bottom: 20,
                  width: 2,
                  zIndex: 5
                }}
                className="bg-slate-900 flex flex-col justify-between"
              >
                {/* Drag handle */}
                <div
                  onMouseDown={e => handleDividerMouseDown(e, div)}
                  className="absolute -top-3.5 -left-3.5 w-7 h-7 bg-white border-2 border-slate-900 rounded-full shadow-md cursor-ew-resize flex items-center justify-center hover:scale-110 transition-transform"
                  title="Kéo để thay đổi phân vùng"
                >
                  <Move className="w-3.5 h-3.5 text-slate-800" />
                </div>

                {/* Left Label */}
                {div.labelLeft && (
                  <div
                    style={{ position: 'absolute', right: 15, top: 0 }}
                    className="text-[11px] font-bold text-slate-900 text-right whitespace-nowrap"
                  >
                    {div.labelLeft}
                  </div>
                )}

                {/* Right Label */}
                {div.labelRight && (
                  <div
                    style={{ position: 'absolute', left: 15, top: 0 }}
                    className="text-[11px] font-bold text-slate-900 text-left whitespace-nowrap"
                  >
                    {div.labelRight}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}



                {/* 5. Render HTML Node Cards */}
        {nodes.map(node => (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: node.x || 0,
              top: node.y || 0,
              zIndex: selectedNodeId === node.id ? 30 : 10
            }}
            onMouseDown={e => handleNodeMouseDown(e, node)}
          >
            <OrgNodeCard
              node={node}
              densityMode={densityMode}
              showNicknames={showNicknames}
              isN1View={template === 'company_n1'}
              isSelected={selectedNodeId === node.id}
              isConnectSource={connectingSource?.node.id === node.id}
              isConnectTargetCandidate={!!connectingSource && connectingSource.node.id !== node.id}
              hasChildren={node.hasChildren}
              isCollapsed={node.isCollapsed}
              collapsedCount={node.collapsedCount}
              isDiffView={false}
              diffType="none"
              onToggleCollapse={onToggleCollapse}
              onSelect={mode === 'current' ? undefined : onNodeSelect}
              onEdit={mode === 'current' ? undefined : onNodeSelect}
              onAnchorClick={mode === 'current' ? undefined : onStartConnect}
              onDelete={mode === 'current' ? undefined : onNodeDelete}
              onToggleStatus={mode === 'current' ? undefined : onNodeToggleStatus}
              isDragging={draggingNodeId === node.id}
            />
          </div>
        ))}

        {/* 6. Render Interactive Custom Notes */}
        {notes.map(note => (
          <div
            key={note.id}
            onMouseDown={e => handleNoteMouseDown(e, note)}
            className="cursor-move"
          >
            <CustomNoteOverlay
              note={note}
              onTextChange={onNoteChange}
              onDelete={onNoteDelete}
            />
          </div>
        ))}
        </div>
      </div>
    </div>
  </div>
  );
};
