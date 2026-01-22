"use client";

import { useState, useEffect } from "react";
import { dictionary, LangType } from "@/lib/dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportProps {
  lang: LangType;
  user?: any;
}

interface Candidate {
  id: string;
  status: string;
  source?: string;
  jobCode?: string;
  notes?: string;
  matchScore: number;
}

export default function Reports({ lang, user }: ReportProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Translation helper
  const t = {
    vi: {
        total: "Tổng Ứng Viên",
        active: "Đang Xử Lý",
        rejected: "Đã Loại",
        stock: "Kho Lưu Trữ",
        byJob: "Theo Mã Công Việc",
        bySource: "Theo Nguồn",
        jobCode: "Mã Job",
        count: "Số Lượng",
        activeCount: "Active",
        rejectedCount: "Rejected",
        stockCount: "Stock",
        loading: "Đang tải dữ liệu..."
    },
    en: {
        total: "Total Candidates",
        active: "Active Processing",
        rejected: "Rejected",
        stock: "Stock / Hold",
        byJob: "By Job Code",
        bySource: "By Source",
        jobCode: "Job Code",
        count: "Total",
        activeCount: "Active",
        rejectedCount: "Rejected",
        stockCount: "Stock",
        loading: "Loading data..."
    }
  }[lang];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      const mapped = data.candidates.map((c: any) => ({
        id: c.id,
        status: c.status,
        source: c.source,
        jobCode: c.jobCode,
        notes: c.notes || "",
        matchScore: parseInt(c.matchScore) || 0
      }));
      setCandidates(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregation Logic
  const total = candidates.length;
  const rejected = candidates.filter(c => c.status === "Rejected").length;
  const stock = candidates.filter(c => c.notes?.includes("Stock")).length;
  const active = total - rejected - stock;

  // By Job Code
  const jobStats = candidates.reduce((acc, curr) => {
    const job = curr.jobCode || "Unknown";
    if (!acc[job]) acc[job] = { total: 0, active: 0, rejected: 0, stock: 0 };
    
    acc[job].total++;
    const isRejected = curr.status === "Rejected";
    const isStock = curr.notes?.includes("Stock");
    
    if (isRejected) acc[job].rejected++;
    else if (isStock) acc[job].stock++;
    else acc[job].active++;
    
    return acc;
  }, {} as Record<string, { total: number, active: number, rejected: number, stock: number }>);

  // By Source
  const sourceStats = candidates.reduce((acc, curr) => {
    const src = curr.source || "Unknown";
    if (!acc[src]) acc[src] = { total: 0, active: 0, rejected: 0, stock: 0 };
    acc[src].total++;
     const isRejected = curr.status === "Rejected";
    const isStock = curr.notes?.includes("Stock");
    
    if (isRejected) acc[src].rejected++;
    else if (isStock) acc[src].stock++;
    else acc[src].active++;
    return acc;
  }, {} as Record<string, { total: number, active: number, rejected: number, stock: number }>);

  if (loading) return <div className="p-8 text-center text-gray-500">{t.loading}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">{t.total}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-800">{total}</div>
            </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">{t.active}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">{active}</div>
            </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-blue-300 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">{t.stock}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stock}</div>
            </CardContent>
        </Card>
         <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">{t.rejected}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-500">{rejected}</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Job Code */}
          <Card className="shadow-sm">
              <CardHeader>
                  <CardTitle className="text-lg">{t.byJob}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 sticky top-0">
                                <TableHead>{t.jobCode}</TableHead>
                                <TableHead className="text-right">{t.count}</TableHead>
                                <TableHead className="text-right text-green-600 font-medium">Active</TableHead>
                                <TableHead className="text-right text-blue-500 font-medium">Stock</TableHead>
                                <TableHead className="text-right text-red-500 font-medium">Rejected</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(jobStats).sort((a,b) => b[1].total - a[1].total).map(([job, stats]) => (
                                <TableRow key={job}>
                                    <TableCell className="font-medium">{job}</TableCell>
                                    <TableCell className="text-right font-bold">{stats.total}</TableCell>
                                    <TableCell className="text-right text-green-600">{stats.active}</TableCell>
                                    <TableCell className="text-right text-blue-500">{stats.stock}</TableCell>
                                    <TableCell className="text-right text-red-500">{stats.rejected}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
              </CardContent>
          </Card>

          {/* By Source */}
           <Card className="shadow-sm">
              <CardHeader>
                  <CardTitle className="text-lg">{t.bySource}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 sticky top-0">
                                <TableHead>Source</TableHead>
                                <TableHead className="text-right">{t.count}</TableHead>
                                <TableHead className="text-right text-green-600 font-medium">Active</TableHead>
                                <TableHead className="text-right text-blue-500 font-medium">Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {Object.entries(sourceStats).sort((a,b) => b[1].total - a[1].total).map(([src, stats]) => (
                                <TableRow key={src}>
                                    <TableCell className="font-medium">{src}</TableCell>
                                    <TableCell className="text-right font-bold">{stats.total}</TableCell>
                                    <TableCell className="text-right text-green-600">{stats.active}</TableCell>
                                    <TableCell className="text-right text-blue-500">{stats.stock}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
              </CardContent>
          </Card>
      </div>

    </div>
  );
}
