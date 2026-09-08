import React, { useRef, useState } from 'react';
import { OrgNode, IndirectLink, CustomDivider, CustomNote, DensityMode, HeadcountSummary, ViewTemplate } from '@/types/org-chart';
import { OrgNodeCard, AnchorPosition } from './OrgNodeCard';
import { CustomNoteOverlay } from './CustomNoteOverlay';
import { SharedSidebar } from './SharedSidebar';
import { SumUpWidget } from './SumUpWidget';
import { ZoomIn, ZoomOut, Maximize2, Move, Trash2, Edit2, XCircle } from 'lucide-react';

interface OrgCanvasProps {
  nodes: OrgNode[];
  indirectLinks: IndirectLink[];
  dividers: CustomDivider[];
  notes: CustomNote[];
  template: ViewTemplate;
  selectedDivision?: string;
  densityMode: DensityMode;
  showNicknames: boolean;
  showSumUpTable: boolean;
  onToggleSumUpTable: () => void;
  summary: HeadcountSummary;
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

export const OrgCanvas: React.FC<OrgCanvasProps> = ({
  nodes,
  indirectLinks,
  dividers,
  notes,
  template,
  selectedDivision,
  densityMode,
  showNicknames,
  showSumUpTable,
  onToggleSumUpTable,
  summary,
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
  const [zoom, setZoom] = useState<number>(1);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [draggingDividerId, setDraggingDividerId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sidebarPos, setSidebarPos] = useState<{ x: number; y: number }>({
    x: Math.max(1050, canvasWidth - 280),
    y: 60
  });

  const dragStartPos = useRef<{ x: number; y: number; originX: number; originY: number }>({ x: 0, y: 0, originX: 0, originY: 0 });

  // Handle Drag of Nodes
  const handleNodeMouseDown = (e: React.MouseEvent, node: OrgNode) => {
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
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left) / zoom;
      const canvasY = (e.clientY - rect.top) / zoom;
      setMousePos({ x: canvasX, y: canvasY });
    }

    if (draggingNodeId) {
      const dx = (e.clientX - dragStartPos.current.x) / zoom;
      const dy = (e.clientY - dragStartPos.current.y) / zoom;
      const newX = Math.max(10, Math.round((dragStartPos.current.originX + dx) / 10) * 10);
      const newY = Math.max(10, Math.round((dragStartPos.current.originY + dy) / 10) * 10);
      onNodeMove(draggingNodeId, newX, newY);
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
  };

  const nodeMap = new Map<string, OrgNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Compute connecting source coordinate if in connect mode
  let connectStartCoord: { x: number; y: number } | null = null;
  if (connectingSource) {
    const sNode = connectingSource.node;
    const w = sNode.width || 175;
    const h = sNode.height || 65;
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

  const renderedLabelKeys = new Set<string>();

  return (
    <div className="relative w-full overflow-auto bg-slate-100 rounded-xl border border-slate-300 p-4 shadow-inner min-h-[700px]">
      {/* Floating Active Connection Mode Banner */}
      {connectingSource && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl animate-bounce">
          <span className="text-xs font-bold">
            🔗 Connecting from <u>{connectingSource.node.title}</u>: Click on target position to link line
          </span>
          <button
            onClick={onCancelConnect}
            className="bg-white/20 hover:bg-white/40 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel (ESC)
          </button>
        </div>
      )}

      {/* Floating Zoom Controls */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg p-1 shadow-md">
        <button
          onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono font-bold px-1.5 text-slate-800">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(prev => Math.min(1.8, prev + 0.1))}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
          title="Reset Zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Headcount Summary Widget */}
      <div className="absolute bottom-6 left-6 z-40">
        <SumUpWidget
          summary={summary}
          isVisible={showSumUpTable}
          onToggleVisible={onToggleSumUpTable}
        />
      </div>

      {/* Printable / Exportable Canvas Area */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: Math.max(1300, canvasWidth),
          height: Math.max(760, canvasHeight)
        }}
        className="relative bg-white shadow-2xl rounded-sm border border-slate-200 transition-transform duration-75 overflow-visible select-none"
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

          {/* 1. Grouped Direct Reporting Lines (Isolated Horizontal Bus per Parent) */}
          {Array.from(childrenByParent.entries()).map(([parentId, children]) => {
            const parent = nodeMap.get(parentId);
            if (!parent || parent.x === undefined || parent.y === undefined) return null;

            const parentCenterX = (parent.x || 0) + (parent.width || 180) / 2;
            const parentBottomY = (parent.y || 0) + (parent.height || 65);

            // Group children by their Y level (sub-row)
            const rowMap = new Map<number, OrgNode[]>();
            children.forEach(c => {
              const cy = c.y || 0;
              if (!rowMap.has(cy)) rowMap.set(cy, []);
              rowMap.get(cy)!.push(c);
            });

            return (
              <g key={`group_bus_${parentId}`}>
                {Array.from(rowMap.entries()).map(([rowY, rowChildren], rIdx) => {
                  const minChildX = Math.min(...rowChildren.map(c => (c.x || 0) + (c.width || 180) / 2));
                  const maxChildX = Math.max(...rowChildren.map(c => (c.x || 0) + (c.width || 180) / 2));
                  const busY = parentBottomY + (rowY - parentBottomY) * 0.45;

                  return (
                    <g key={`subrow_${parentId}_${rIdx}`}>
                      {/* Vertical stem from parent down to bus */}
                      <path
                        d={`M ${parentCenterX} ${parentBottomY} V ${busY}`}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />

                      {/* Isolated Horizontal Bus (Only spans between this parent's children) */}
                      {rowChildren.length > 1 && (
                        <path
                          d={`M ${Math.min(minChildX, parentCenterX)} ${busY} H ${Math.max(maxChildX, parentCenterX)}`}
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Vertical drop lines with arrow for each child in this row */}
                      {rowChildren.map(child => {
                        const childCenterX = (child.x || 0) + (child.width || 180) / 2;
                        const childTopY = child.y || 0;

                        return (
                          <path
                            key={`drop_${child.id}`}
                            d={`M ${childCenterX} ${busY} V ${childTopY}`}
                            fill="none"
                            stroke="#0f172a"
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

          {/* 2. Indirect Matrix Lines (Orthogonal Right-Angle Path, Dashed) */}
          {indirectLinks.map(link => {
            const fromNode = nodeMap.get(link.fromId);
            const toNode = nodeMap.get(link.toId);
            if (!fromNode || !toNode || fromNode.x === undefined || toNode.x === undefined) return null;

            const fromCenterX = (fromNode.x || 0) + (fromNode.width || 175) / 2;
            const fromCenterY = (fromNode.y || 0) + (fromNode.height || 65) / 2;
            const toCenterX = (toNode.x || 0) + (toNode.width || 175) / 2;
            const toCenterY = (toNode.y || 0) + (toNode.height || 65) / 2;

            let pathD = '';
            let labelX = 0;
            let labelY = 0;

            if (Math.abs(fromCenterY - toCenterY) < 30) {
              const startX = fromCenterX < toCenterX ? (fromNode.x || 0) + (fromNode.width || 175) : (fromNode.x || 0);
              const endX = fromCenterX < toCenterX ? (toNode.x || 0) : (toNode.x || 0) + (toNode.width || 175);
              pathD = `M ${startX} ${fromCenterY} H ${endX}`;
              labelX = (startX + endX) / 2;
              labelY = fromCenterY - 6;
            } else {
              const startX = fromCenterX;
              const startY = (fromNode.y || 0) + (fromNode.height || 65);
              const endX = toCenterX;
              const endY = toNode.y || 0;
              const midY = startY + (endY - startY) * 0.45;

              pathD = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;
              labelX = (startX + endX) / 2;
              labelY = midY - 5;
            }

            let shouldRenderLabel = false;
            if (link.label) {
              const locKey = `${Math.round(labelX / 80)}_${Math.round(labelY / 30)}_${link.label}`;
              if (!renderedLabelKeys.has(locKey)) {
                renderedLabelKeys.add(locKey);
                shouldRenderLabel = true;
              }
            }

            return (
              <g key={link.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="5,4"
                  markerEnd="url(#arrow-dashed)"
                />
                {shouldRenderLabel && (
                  <text
                    x={labelX}
                    y={labelY}
                    fill="#334155"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* 3. Live Interactive Rubberband Connecting Line in Connect Mode */}
          {connectStartCoord && (
            <path
              d={`M ${connectStartCoord.x} ${connectStartCoord.y} L ${mousePos.x} ${mousePos.y}`}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* 4. Interactive Custom Dividers with Drag Handle & Actions */}
        {dividers.map(div => {
          if (div.type === 'vertical') {
            return (
              <div
                key={div.id}
                style={{
                  position: 'absolute',
                  left: div.position,
                  top: 20,
                  height: canvasHeight - 40,
                  zIndex: 15
                }}
                className="group select-none"
              >
                <div className="w-[3px] h-full bg-slate-900 shadow-xs relative" />

                <div
                  onMouseDown={(e) => handleDividerMouseDown(e, div)}
                  className="absolute -top-3 -left-3.5 w-8 h-8 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center cursor-ew-resize shadow-md hover:bg-slate-100 z-30"
                  title="Drag to reposition divider"
                >
                  <Move className="w-3.5 h-3.5 text-slate-800" />
                </div>

                <div className="absolute top-7 -left-12 hidden group-hover:flex items-center gap-1 bg-white border border-slate-300 rounded-md p-1 shadow-md z-30">
                  <button
                    onClick={() => onDividerEdit(div)}
                    className="p-1 hover:bg-blue-50 text-blue-600 rounded text-xs cursor-pointer"
                    title="Edit Divider Labels"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDividerDelete(div.id)}
                    className="p-1 hover:bg-red-50 text-red-600 rounded text-xs cursor-pointer"
                    title="Delete Divider"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {div.labelLeft && (
                  <div
                    onClick={() => onDividerEdit(div)}
                    style={{ position: 'absolute', right: 15, bottom: 0 }}
                    className="text-[11px] font-bold text-slate-900 text-right whitespace-nowrap cursor-pointer hover:text-blue-600"
                  >
                    {div.labelLeft}
                  </div>
                )}

                {div.labelRight && (
                  <div
                    onClick={() => onDividerEdit(div)}
                    style={{ position: 'absolute', left: 15, bottom: 0 }}
                    className="text-[11px] font-bold text-slate-900 text-left whitespace-nowrap cursor-pointer hover:text-blue-600"
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
              onToggleCollapse={onToggleCollapse}
              onSelect={onNodeSelect}
              onEdit={onNodeSelect}
              onAnchorClick={onStartConnect}
              onDelete={onNodeDelete}
              onToggleStatus={onNodeToggleStatus}
              isDragging={draggingNodeId === node.id}
            />
          </div>
        ))}

        {/* 6. Render Interactive Custom Notes with Drag & Edit */}
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

        {/* 7. Render Draggable Sidebar ONLY in Division Views (Hidden in N-1 view) */}
        {template !== 'company_n1' && (
          <SharedSidebar
            x={sidebarPos.x}
            y={sidebarPos.y}
            width={230}
            title="CBS VN Shared"
            onMove={(nx, ny) => setSidebarPos({ x: nx, y: ny })}
          />
        )}
      </div>
    </div>
  );
};
