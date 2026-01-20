import Image from "next/image";
import CandidateInputForm from "@/components/CandidateInputForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header / Nav */}
      <header className="bg-cbs-black text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             {/* Logo Placeholder */}
            <div className="bg-white p-1 rounded">
               <span className="font-bold text-black text-xl px-2">CBS</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Recruitment Portal</h1>
          </div>
          <div className="text-sm">
            <a href="/dashboard" className="bg-white text-cbs-black px-4 py-2 rounded font-bold hover:bg-gray-100 transition-colors">
              Truy cập Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-10 px-4">
        <Tabs defaultValue="input" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white shadow p-1">
              <TabsTrigger value="input" className="px-8">Phễu Đầu Vào (Input)</TabsTrigger>
              <TabsTrigger value="kanban" className="px-8">Quy Trình Tuyển Dụng</TabsTrigger>
              <TabsTrigger value="reports" className="px-8">Báo Cáo</TabsTrigger>
              <TabsTrigger value="settings" className="px-8">Cấu Hình</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="input" className="flex justify-center">
            <CandidateInputForm />
          </TabsContent>

          <TabsContent value="kanban">
            <div className="text-center p-10 text-muted-foreground">
              <h2 className="text-lg font-medium">Kanban Board Coming Soon</h2>
              <p>Tính năng đang được phát triển...</p>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center p-10 text-muted-foreground">
               <h2 className="text-lg font-medium">Reporting Dashboard Coming Soon</h2>
            </div>
          </TabsContent>
          
           <TabsContent value="settings">
            <div className="text-center p-10 text-muted-foreground">
               <h2 className="text-lg font-medium">System Settings</h2>
               <p>Quản lý Job Code & Drive API</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
