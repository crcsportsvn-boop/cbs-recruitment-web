import React from 'react';
import { NodeFlag } from '@/types/org-chart';

/**
 * Pure Vector SVG Country Flags
 * 100% vector, crisp on all resolutions, Windows browsers, PDF & PNG export
 */

export const VietnamFlagSVG: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <span
    className="inline-flex items-center justify-center shrink-0 shadow-xs rounded-[2px] overflow-hidden border border-black/20 bg-[#DA251D]"
    style={{ width: Math.round(size * 1.5), height: size }}
    title="Vietnam (VN)"
  >
    <svg viewBox="0 0 900 600" width="100%" height="100%" className="block">
      <rect width="900" height="600" fill="#DA251D" />
      {/* 5-pointed Yellow Star */}
      <polygon
        points="450,140 488,258 612,258 512,330 550,448 450,376 350,448 388,330 288,258 412,258"
        fill="#FFEB00"
      />
    </svg>
  </span>
);

export const ThailandFlagSVG: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <span
    className="inline-flex items-center justify-center shrink-0 shadow-xs rounded-[2px] overflow-hidden border border-black/20"
    style={{ width: Math.round(size * 1.5), height: size }}
    title="Thailand (TH)"
  >
    <svg viewBox="0 0 900 600" width="100%" height="100%" className="block">
      <rect width="900" height="600" fill="#A51931" />
      <rect y="100" width="900" height="400" fill="#F4F5F8" />
      <rect y="200" width="900" height="200" fill="#2D2A4A" />
    </svg>
  </span>
);

export const MalaysiaFlagSVG: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <span
    className="inline-flex items-center justify-center shrink-0 shadow-xs rounded-[2px] overflow-hidden border border-black/20"
    style={{ width: Math.round(size * 1.5), height: size }}
    title="Malaysia (MY)"
  >
    <svg viewBox="0 0 1400 700" width="100%" height="100%" className="block">
      {/* 14 Stripes */}
      {Array.from({ length: 14 }).map((_, idx) => (
        <rect
          key={idx}
          y={idx * 50}
          width="1400"
          height="50"
          fill={idx % 2 === 0 ? '#CC0000' : '#FFFFFF'}
        />
      ))}
      {/* Canton Blue */}
      <rect width="700" height="400" fill="#000066" />
      {/* Crescent Moon */}
      <circle cx="280" cy="200" r="140" fill="#FFCC00" />
      <circle cx="320" cy="200" r="120" fill="#000066" />
      {/* 14-pointed Star */}
      <circle cx="480" cy="200" r="100" fill="#FFCC00" />
    </svg>
  </span>
);

/**
 * Universal Flag Renderer (Clean flags only, no extra text/star icons)
 */
export const FlagBadgeGroup: React.FC<{
  flags?: NodeFlag[];
  size?: number;
}> = ({ flags, size = 14 }) => {
  if (!flags || flags.length === 0 || flags.includes('NONE')) return null;

  return (
    <div className="flex items-center gap-1 shrink-0 select-none ml-1">
      {flags.map((f, idx) => {
        if (f === 'VN' || f === 'VN_STAR') {
          return <VietnamFlagSVG key={idx} size={size} />;
        }
        if (f === 'TH') return <ThailandFlagSVG key={idx} size={size} />;
        if (f === 'MY') return <MalaysiaFlagSVG key={idx} size={size} />;
        return null;
      })}
    </div>
  );
};
