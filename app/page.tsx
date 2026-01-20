"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import CandidateInputForm from "@/components/CandidateInputForm";
import KanbanBoard from "@/components/KanbanBoard";
import ScrollTopButton from "@/components/ScrollTopButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [lang, setLang] = useState<'vi' | 'en'>('en');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const activeTab = searchParams.get("tab") || "input";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // ... logic fetch user giữ nguyên ...
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(err => console.error("Auth check failed", err));
  }, []);

  const t = {
    vi: {
      title: "Cổng Thông Tin Tuyển Dụng",
      tabInput: "Phễu Đầu Vào (Input)",
      tabProcess: "Quy Trình Tuyển Dụng",
      tabReport: "Báo Cáo",
      tabConfig: "Cấu Hình",
      footer: "© 2026 CBS Vietnam - Recruitment Portal"
    },
    en: {
      title: "Recruitment Portal",
      tabInput: "Candidate Input",
      tabProcess: "Recruitment Process",
      tabReport: "Reports",
      tabConfig: "Settings",
      footer: "© 2026 CBS Vietnam - All rights reserved"
    }
  };

  // 1. Unauthorized View (Login Prompt)
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans relative">
        {/* Language Toggle for Login Screen */}
        <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:bg-gray-200"
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            >
              <Globe className="h-4 w-4 mr-2" />
              {lang === 'vi' ? 'EN' : 'VN'}
            </Button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 text-center">
            <div className="mb-6 flex justify-center">
                <Image src="/cbs-logo.png" alt="CBS Logo" width={180} height={60} className="object-contain" priority />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-[#B91C1C]">{t[lang].title}</h1>
            <p className="text-gray-500 mb-8">{lang === 'vi' ? 'Vui lòng đăng nhập bằng tài khoản nội bộ.' : 'Please sign in with your internal account.'}</p>
            
            <Button 
            onClick={() => window.location.href = "/api/auth/login"}
            className="w-full h-12 text-lg bg-[#EE2E24] hover:bg-[#D5261C] text-white flex items-center justify-center gap-3 relative shadow-md transition-all"
            > 
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
            </Button>
        </div>
        <footer className="mt-8 text-sm text-gray-400">
            {t[lang].footer}
        </footer>
      </main>
    );
  }

  const isHO = user.role === 'HO_Recruiter';
  const isAdmin = user.role === 'Admin' || user.role === 'Manager';
  const isGuest = user.role === 'Guest' || !user.role;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Nav */}
      <header className="bg-[#B91C1C] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             {/* Logo */}
            <div className="bg-white p-1 rounded h-12 flex items-center justify-center">
               <Image 
                 src="/cbs-logo.png" 
                 alt="CBS Logo" 
                 width={120} 
                 height={40} 
                 className="object-contain h-full w-auto"
                 priority
               />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t[lang].title}</h1>
              <div className="text-xs text-red-100 flex gap-2 items-center mt-1">
                  <span>{user.email}</span>
                  <span className="bg-white/20 px-1 rounded font-mono" title="Role">{user.role}</span>
                  {user.id && <span className="bg-black/20 px-1 rounded text-[10px] opacity-70" title="User ID">ID: {user.id}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 hover:text-white"
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            >
              <Globe className="h-4 w-4 mr-2" />
              {lang === 'vi' ? 'EN' : 'VN'}
            </Button>
          </div>
        </div>
      </header>

      {/* Guest Warning */}
      {isGuest && (
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 container mx-auto mt-10 mb-4 rounded shadow-sm max-w-2xl" role="alert">
            <p className="font-bold text-lg mb-2">Chưa phân quyền (Access Denied)</p>
            <p className="">Tài khoản <b>{user.email}</b> chưa được cấp quyền truy cập hệ thống.</p>
            <div className="my-4 bg-white/50 p-3 rounded border border-yellow-200">
               <p className="text-sm font-semibold">User ID của bạn:</p>
               <code className="block bg-white p-2 mt-1 rounded text-sm font-mono select-all border border-gray-200">
                  {user.id}
               </code>
            </div>
            <p className="text-sm">Vui lòng liên hệ Admin và cung cấp ID trên để được kích hoạt.</p>
         </div>
      )}

      {/* Authorized Content */}
      {(isHO || isAdmin) && (
        <div className="container mx-auto py-10 px-4 flex-1">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-8 sticky top-20 z-30 bg-gray-50 pb-4">
                <TabsList className="bg-white shadow-md p-1 h-auto">
                <TabsTrigger value="input" className="px-6 py-3 data-[state=active]:bg-[#EE2E24] data-[state=active]:text-white transition-all">
                    {t[lang].tabInput}
                </TabsTrigger>
                <TabsTrigger value="kanban" className="px-6 py-3 data-[state=active]:bg-[#EE2E24] data-[state=active]:text-white transition-all">
                    {t[lang].tabProcess}
                </TabsTrigger>
                {/* Reports & Config: HO might need reports? Assuming Yes for now. Admin sees Config. */}
                <TabsTrigger value="reports" className="px-6 py-3 data-[state=active]:bg-[#EE2E24] data-[state=active]:text-white transition-all">
                    {t[lang].tabReport}
                </TabsTrigger>
                {isAdmin && (
                    <TabsTrigger value="settings" className="px-6 py-3 data-[state=active]:bg-[#EE2E24] data-[state=active]:text-white transition-all">
                        {t[lang].tabConfig}
                    </TabsTrigger>
                )}
                </TabsList>
            </div>

            <TabsContent value="input" className="flex justify-center animate-in fade-in zoom-in duration-300">
                <CandidateInputForm lang={lang} />
            </TabsContent>

            <TabsContent value="kanban" className="w-full h-full min-h-[600px] animate-in fade-in slide-in-from-right-10 duration-300">
                <div className="bg-white p-4 rounded-lg shadow min-h-[700px]">
                <KanbanBoard lang={lang} />
                </div>
            </TabsContent>

            <TabsContent value="reports">
                <div className="text-center p-10 text-muted-foreground bg-white rounded-lg shadow">
                <h2 className="text-lg font-medium">Reporting Dashboard</h2>
                <p>Tính năng báo cáo đang được phát triển.</p>
                </div>
            </TabsContent>
            
            <TabsContent value="settings">
                <div className="text-center p-10 text-muted-foreground bg-white rounded-lg shadow">
                <h2 className="text-lg font-medium">System Settings</h2>
                <p>Quản lý cấu hình hệ thống (Admin Only)</p>
                </div>
            </TabsContent>
            </Tabs>
        </div>
      )}

      {/* Footer only if authorized (Unauthorized has its own footer above) */}
      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm mt-auto">
        {t[lang].footer}
      </footer>
      
      <ScrollTopButton />
    </main>
  );
}
