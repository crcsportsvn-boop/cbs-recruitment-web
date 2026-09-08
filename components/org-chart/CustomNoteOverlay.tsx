import React, { useState } from 'react';
import { CustomNote } from '@/types/org-chart';
import { Trash2, Edit2, Check } from 'lucide-react';

interface CustomNoteOverlayProps {
  note: CustomNote;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: (id: string) => void;
  onTextChange?: (id: string, newText: string) => void;
  onMove?: (id: string, x: number, y: number) => void;
}

export const CustomNoteOverlay: React.FC<CustomNoteOverlayProps> = ({
  note,
  isSelected,
  onSelect,
  onDelete,
  onTextChange,
  onMove
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [text, setText] = useState<string>(note.text);

  const handleSave = () => {
    if (onTextChange) {
      onTextChange(note.id, text);
    }
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      style={{
        left: note.x,
        top: note.y,
        color: note.color || '#1e293b'
      }}
      className={`absolute group select-none transition-shadow z-20 ${
        note.isBox
          ? 'border-2 border-dashed border-blue-500 bg-white/95 backdrop-blur-xs rounded-md p-2.5 shadow-sm min-w-[140px]'
          : 'text-xs font-semibold p-1'
      } ${isSelected ? 'ring-2 ring-blue-600 shadow-md' : 'hover:shadow-md'}`}
    >
      {isEditing ? (
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full border border-blue-400 rounded p-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 text-xs flex items-center gap-1 font-semibold px-2"
            >
              <Check className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      ) : (
        <div onDoubleClick={() => setIsEditing(true)}>
          <div className="whitespace-pre-line text-xs font-medium leading-relaxed">
            {note.text}
          </div>

          {/* Floating Action Controls on Hover */}
          <div className="absolute -top-3 right-0 hidden group-hover:flex items-center gap-1 bg-white border border-gray-300 rounded-full px-1.5 py-0.5 shadow-md">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-gray-500 hover:text-blue-600 p-0.5 rounded-full"
              title="Edit Note text"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="text-gray-500 hover:text-red-600 p-0.5 rounded-full"
                title="Delete Note"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
