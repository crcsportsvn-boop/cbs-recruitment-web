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
      <header className="bg-[#B91C1C] text-white px-4 py-1.5 shadow-xs shrink-0 z-50 w-full">
        <div className="w-full flex items-center justify-between">
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
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 transition-all animate-in slide-in-from-top-2 duration-200 w-full">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
            <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 text-sm">1.</span>
              <div>
                <span className="font-bold text-slate-900 block">Nạp Dữ Liệu & Xem Cơ Cấu</span>
                <span className="text-slate-600 text-[11px] leading-relaxed block mt-0.5">
                  Nạp file Excel định biên nhân sự. Hệ thống tự động phân tích và lưu trữ bản mới nhất. Xem cơ cấu N-1 hoặc lọc theo từng Phòng Ban.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-800 text-sm">2.</span>
              <div>
                <span className="font-bold text-amber-950 block">Tạo Đề Xuất & Đồng Bộ</span>
                <span className="text-amber-800 text-[11px] leading-relaxed block mt-0.5">
                  Chọn <strong>Đề Xuất</strong> (tối đa 5 bản thảo, đổi tên tùy ý). Bấm <strong>Đồng bộ từ Hiện Tại</strong> để sao chép nguyên trạng sang bản thảo an toàn.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
              <span className="font-bold text-emerald-800 text-sm">3.</span>
              <div>
                <span className="font-bold text-emerald-950 block">Hiệu Chỉnh Ghế & Báo Cáo</span>
                <span className="text-emerald-800 text-[11px] leading-relaxed block mt-0.5">
                  Thêm ghế <strong>Tuyển mới</strong>, <strong>Thay thế</strong> hoặc <strong>Ghế chuẩn</strong>. Bấm nút <strong>(+) trên ghế sếp</strong> để tự điền quản lý trực tiếp. Nối ma trận và highlight màu.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-purple-50/70 p-2.5 rounded-lg border border-purple-200">
              <span className="font-bold text-purple-800 text-sm">4.</span>
              <div>
                <span className="font-bold text-purple-950 block">Khối Box & Phòng Ban Mới</span>
                <span className="text-purple-800 text-[11px] leading-relaxed block mt-0.5">
                  Thêm <strong>Box Group</strong> trên N-1 với 5 màu sắc; rê chuột vào ô dùng <strong>nút 3 gạch để di chuyển</strong> và <strong>góc mũi tên để co giãn</strong>. Thêm nhanh Phòng ban mới.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200">
              <span className="font-bold text-blue-800 text-sm">5.</span>
              <div>
                <span className="font-bold text-blue-950 block">So Sánh & Lưu / Xuất File</span>
                <span className="text-blue-800 text-[11px] leading-relaxed block mt-0.5">
                  Bật <strong>So Sánh Biến Động</strong> để tự đối chiếu Hiện Tại. Bấm <strong>Lưu Phương Án</strong> lên hệ thống. Xuất <strong>Excel kèm biến động</strong>, <strong>PDF A4/A3</strong> hoặc <strong>PNG</strong>.
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
