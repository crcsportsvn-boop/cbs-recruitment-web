"use client";

import { useState } from "react";
import Image from "next/image";
import CandidateInputForm from "@/components/CandidateInputForm";
import KanbanBoard from "@/components/KanbanBoard";
import ScrollTopButton from "@/components/ScrollTopButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function Home() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

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
      <header className="bg-[#EE2E24] text-white p-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             {/* Logo Placeholder - White Box for Contrast */}
            <div className="bg-white p-1 rounded h-10 w-10 flex items-center justify-center">
               <span className="font-bold text-[#EE2E24] text-xl">CBS</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t[lang].title}</h1>
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

            <div className="text-sm hidden sm:block">
              <a href="/dashboard" className="bg-white text-[#EE2E24] px-4 py-2 rounded font-bold hover:bg-gray-100 transition-colors">
                {t[lang].adminDash}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-10 px-4 flex-1">
        <Tabs defaultValue="input" className="w-full">
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
            <CandidateInputForm />
          </TabsContent>

          <TabsContent value="kanban" className="w-full h-full min-h-[600px] animate-in fade-in slide-in-from-right-10 duration-300">
            <div className="bg-white p-4 rounded-lg shadow min-h-[700px]">
               <KanbanBoard />
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
