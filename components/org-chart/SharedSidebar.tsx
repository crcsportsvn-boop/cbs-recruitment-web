import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, Move, GripHorizontal } from 'lucide-react';

interface SharedSidebarProps {
  x: number;
  y: number;
  width?: number;
  title?: string;
  items?: string[];
  onItemsChange?: (newItems: string[]) => void;
  onMove?: (newX: number, newY: number) => void;
}

export const SharedSidebar: React.FC<SharedSidebarProps> = ({
  x,
  y,
  width = 240,
  title = 'CBS VN Shared',
  items: initialItems = [
    'Brand Operations',
    'Planning',
    'Commercial',
    'Marketing',
    'SCM',
    'Finance',
    'Human Resources',
    'IT'
  ],
  onItemsChange,
  onMove
}) => {
  const [items, setItems] = useState<string[]>(initialItems);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newText, setNewText] = useState<string>('');

  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({ clientX: 0, clientY: 0, startX: 0, startY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: x,
      startY: y
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragStartRef.current.clientX;
      const dy = ev.clientY - dragStartRef.current.clientY;
      const nextX = Math.max(10, Math.round((dragStartRef.current.startX + dx) / 10) * 10);
      const nextY = Math.max(10, Math.round((dragStartRef.current.startY + dy) / 10) * 10);
      if (onMove) onMove(nextX, nextY);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const updateItems = (updated: string[]) => {
    setItems(updated);
    if (onItemsChange) onItemsChange(updated);
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditingText(items[idx] || '');
  };

  const handleSaveEdit = (idx: number) => {
    if (!editingText.trim()) return;
    const updated = [...items];
    updated[idx] = editingText.trim();
    updateItems(updated);
    setEditingIdx(null);
  };

  const handleDelete = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    updateItems(updated);
  };

  const handleAddItem = () => {
    if (!newText.trim()) return;
    const updated = [...items, newText.trim()];
    updateItems(updated);
    setNewText('');
    setIsAdding(false);
  };

  const half = Math.ceil(items.length / 2);
  const col1 = items.slice(0, half);
  const col2 = items.slice(half);

  return (
    <div
      style={{ left: x, top: y, width }}
      className="absolute border-2 border-slate-900 bg-white rounded-lg p-2.5 text-center select-none shadow-xl z-20 group"
    >
      {/* Header & Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2 cursor-move hover:bg-slate-50 p-1 -m-1 rounded transition-colors"
        title="Click and drag header to move sidebar anywhere"
      >
        <div className="flex items-center gap-1.5">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-900">{title}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="text-slate-500 hover:text-emerald-600 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
          title="Add Supporting Function"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add New Item Input */}
      {isAdding && (
        <div className="flex items-center gap-1 mb-2 bg-emerald-50 p-1 rounded border border-emerald-300">
          <input
            type="text"
            placeholder="Function name..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="text-xs p-1 border rounded w-full bg-white focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-emerald-600 text-white p-1 rounded text-xs hover:bg-emerald-700 cursor-pointer"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="text-slate-400 p-1 text-xs hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex flex-col gap-1.5">
          {col1.map((item, idx) => (
            <div
              key={idx}
              className="relative group/item bg-slate-50 border border-slate-300 hover:border-slate-800 rounded p-1 text-[10.5px] font-medium text-slate-800 flex items-center justify-between"
            >
              {editingIdx === idx ? (
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="text-[10.5px] p-0.5 border rounded w-full bg-white"
                    autoFocus
                  />
                  <button onClick={() => handleSaveEdit(idx)} className="text-emerald-600 hover:text-emerald-800">
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate">{item}</span>
                  <div className="hidden group-hover/item:flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="p-0.5 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="p-0.5 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          {col2.map((item, idx) => {
            const actualIdx = idx + half;
            return (
              <div
                key={actualIdx}
                className="relative group/item bg-slate-50 border border-slate-300 hover:border-slate-800 rounded p-1 text-[10.5px] font-medium text-slate-800 flex items-center justify-between"
              >
                {editingIdx === actualIdx ? (
                  <div className="flex items-center gap-1 w-full">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="text-[10.5px] p-0.5 border rounded w-full bg-white"
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(actualIdx)} className="text-emerald-600 hover:text-emerald-800">
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="truncate">{item}</span>
                    <div className="hidden group-hover/item:flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => handleEdit(actualIdx)}
                        className="p-0.5 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(actualIdx)}
                        className="p-0.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
