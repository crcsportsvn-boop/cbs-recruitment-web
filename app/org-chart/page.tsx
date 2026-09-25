"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OrgChartStudio from '@/components/org-chart/OrgChartStudio';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Laptop,
  CheckCircle2,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';

export default function OrgChartReviewPage() {
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(false);

  return (
    <main className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Executive Header */}
      <header className="bg-[#B91C1C] text-white px-6 py-1.5 shadow-xs shrink-0 z-50">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-white p-1 rounded h-7 flex items-center justify-center hover:opacity-90 transition-opacity">
              <Image
                src="/cbs-logo.png"
                alt="CBS Logo"
                width={80}
                height={24}
                className="object-contain h-full w-auto"
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>CBS Org Chart Studio</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickGuide(prev => !prev)}
              className="text-white hover:bg-white/20 text-xs gap-1.5 font-medium cursor-pointer h-7"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showQuickGuide ? 'Ẩn Hướng Dẫn' : 'Hướng Dẫn Nhanh'}</span>
            </Button>

            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5 font-semibold cursor-pointer h-7"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về Cổng Tuyển Dụng</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Quick Guide Banner for Reviewers */}
      {showQuickGuide && (
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 transition-all animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-[1720px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 text-sm">1.</span>
              <div>
                <span className="font-bold text-slate-900 block">Cơ Cấu Hiện Tại (As-Is)</span>
                <span className="text-slate-600 text-[11px]">
                  Nạp file <strong>CBS_Org_Chart.xlsm</strong>. Dữ liệu gốc 201 ghế Head Office luôn được bảo toàn tại nút <strong>Hiện Tại</strong>.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
              <span className="font-bold text-emerald-800 text-sm">2.</span>
              <div>
                <span className="font-bold text-emerald-950 block">Lập Đề Xuất (Proposal)</span>
                <span className="text-emerald-800 text-[11px]">
                  Bấm <strong>Tuyển mới (BP)</strong> hoặc <strong>Thay thế</strong> để thêm ghế. Nhấp chuột vào thẻ để đổi chức danh hoặc sếp trực tiếp.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-blue-50/70 p-2 rounded-lg border border-blue-200">
              <span className="font-bold text-blue-800 text-sm">3.</span>
              <div>
                <span className="font-bold text-blue-950 block">Bảng Thuyết Minh Nhu Cầu</span>
                <span className="text-blue-800 text-[11px]">
                  Mở <strong>Bảng Thuyết Minh</strong> để nhập lý do tuyển dụng, thời gian dự kiến và ngân sách để đưa vào slide báo cáo.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-purple-50/70 p-2.5 rounded-lg border border-purple-200">
              <span className="font-bold text-purple-800 text-sm">4.</span>
              <div>
                <span className="font-bold text-purple-950 block">Xuất File Báo Cáo</span>
                <span className="text-purple-800 text-[11px]">
                  Xuất file <strong>Excel (.xlsx)</strong> đầy đủ format chuẩn kèm sheet Diff, hoặc xuất ảnh <strong>PNG 300 DPI / PDF A4 & A3</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        <OrgChartStudio lang="vi" />
      </div>
    </main>
  );
}
