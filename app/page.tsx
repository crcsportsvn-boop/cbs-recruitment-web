"use client";

import { useState } from "react";
import Image from "next/image";
import CandidateInputForm from "@/components/CandidateInputForm";
import KanbanBoard from "@/components/KanbanBoard";
import ScrollTopButton from "@/components/ScrollTopButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const activeTab = searchParams.get("tab") || "input";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const t = {
    vi: {
      title: "Cổng Thông Tin Tuyển Dụng",
      tabInput: "Phễu Đầu Vào (Input)",
      tabProcess: "Quy Trình Tuyển Dụng",
      tabReport: "Báo Cáo",
      tabConfig: "Cấu Hình",
      adminDash: "Dashboard Quản Trị",
      footer: "© 2026 CBS Vietnam - Recruitment Portal"
    },
    en: {
      title: "Recruitment Portal",
      tabInput: "Candidate Input",
      tabProcess: "Recruitment Process",
      tabReport: "Reports",
      tabConfig: "Settings",
      adminDash: "Admin Dashboard",
      footer: "© 2026 CBS Vietnam - All rights reserved"
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Nav */}
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
              {user && (
                <div className="text-xs text-red-100 flex gap-2 items-center mt-1">
                   <span>{user.email}</span>
                   <span className="bg-white/20 px-1 rounded font-mono" title="Role">{user.role}</span>
                   {user.id && <span className="bg-black/20 px-1 rounded text-[10px] opacity-70" title="User ID (Record this)">ID: {user.id}</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
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

      {user?.role === 'Guest' && (
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 container mx-auto mt-4 mb-4" role="alert">
            <p className="font-bold">Chưa phân quyền (Guest Mode)</p>
            <p className="text-sm">Tài khoản này chưa được cấu hình trong hệ thống.</p>
            <p className="text-sm mt-1">Vui lòng quay lại sheet <b>User_view</b> và thêm dòng:</p>
            <code className="block bg-yellow-200 p-2 mt-1 rounded text-xs select-all">
              {user.email} | HO_Recruiter | | 
            </code>
            <p className="text-xs mt-1 text-yellow-600">ID hệ thống: {user.id}</p>
         </div>
      )}

      {/* Main Content */}
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
              <TabsTrigger value="reports" className="px-6 py-3 data-[state=active]:bg-[#EE2E24] data-[state=active]:text-white transition-all">
                {t[lang].tabReport}
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-6 py-3 data-[state=active]:bg-[#EE2E24] data-[state=active]:text-white transition-all">
                {t[lang].tabConfig}
              </TabsTrigger>
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
               <p>Please access the <a href="/dashboard" className="text-blue-600 underline">Full Dashboard</a> for detailed metrics.</p>
            </div>
          </TabsContent>
          
           <TabsContent value="settings">
            <div className="text-center p-10 text-muted-foreground bg-white rounded-lg shadow">
               <h2 className="text-lg font-medium">System Settings</h2>
               <p>Quản lý Job Code & Drive API</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="bg-gray-100 py-6 text-center text-gray-500 text-sm">
        {t[lang].footer}
      </footer>
      
      <ScrollTopButton />
    </main>
  );
}
