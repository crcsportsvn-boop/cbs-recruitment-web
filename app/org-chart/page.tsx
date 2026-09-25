"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import OrgChartStudio from '@/components/org-chart/OrgChartStudio';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  HelpCircle,
  Lock,
} from 'lucide-react';

/** Roles allowed to access Org Chart Studio */
const ALLOWED_ROLES = ['Admin', 'Manager', 'HO_Recruiter'];

export default function OrgChartReviewPage() {
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(false);
  const [authState, setAuthState] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Dev mode bypass on localhost
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      // In dev mode, allow full access (same mock user as main page)
      setUser({ role: 'Manager', displayName: 'Dev Mode', email: 'dev@localhost' });
      setAuthState('allowed');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch('/api/user', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          const allowed = ALLOWED_ROLES.includes(data.user.role);
          setAuthState(allowed ? 'allowed' : 'denied');
        } else {
          // Not authenticated at all → redirect to login
          window.location.href = '/';
        }
      })
      .catch(() => {
        // Network error or abort → redirect to main
        window.location.href = '/';
      })
      .finally(() => clearTimeout(timeout));
  }, []);

  // Loading skeleton
  if (authState === 'loading') {
    return (
      <main className="h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-[#B91C1C] rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Đang xác thực...</p>
        </div>
      </main>
    );
  }

  // Access denied screen
  if (authState === 'denied') {
    return (
      <main className="h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-7 h-7 text-[#B91C1C]" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-slate-500 text-sm mb-6">
            Tính năng <strong>Org Chart Studio</strong> chỉ dành cho <strong>Manager</strong> và <strong>HO Recruiter</strong>.
          </p>
          <Link href="/">
            <Button className="bg-[#B91C1C] hover:bg-[#991B1B] text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              Về Cổng Tuyển Dụng
            </Button>
          </Link>
        </div>
      </main>
    );
  }



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
