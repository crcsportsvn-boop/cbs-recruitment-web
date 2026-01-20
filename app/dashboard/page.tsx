"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Star, FileText, CheckCircle2 } from "lucide-react";

interface Candidate {
  matchScore: string;
  timestamp: string;
  positionRaw: string;
  source: string;
  fullName: string;
  yob: string;
  gender: string;
  phone: string;
  email: string;
  location: string;
  summary: string;
  matchReason: string;
  cvLink: string;
  isPotential: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      if (res.status === 401) {
        // Redirect to login if unauthorized
        const data = await res.json();
        if (data.redirect) router.push(data.redirect);
        return;
      }
      
      const data = await res.json();
      if (data.candidates) {
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error("Failed to load candidates", error);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalCVs = candidates.length;
  const potentialCVs = candidates.filter(c => c.isPotential).length;
  const avgScore = totalCVs > 0 
    ? Math.round(candidates.reduce((acc, c) => acc + (parseInt(c.matchScore) || 0), 0) / totalCVs) 
    : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Talent Acquisition Dashboard</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          Quay lại Upload
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng CV Đã Scan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCVs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CV Tiềm Năng</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{potentialCVs}</div>
            <p className="text-xs text-muted-foreground">
              {totalCVs > 0 ? ((potentialCVs / totalCVs) * 100).toFixed(1) : 0}% tỷ lệ chuyển đổi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm Phù Hợp TB</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}/10</div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates Table */}
      <Card>
         <CardHeader>
            <CardTitle>Danh Sách Ứng Viên Mới Nhất</CardTitle>
         </CardHeader>
         <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ Tên</TableHead>
                <TableHead>Vị Trí</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Tiềm Năng</TableHead>
                <TableHead>Kinh Nghiệm (Tóm tắt)</TableHead>
                <TableHead>Ngày Scan</TableHead>
                <TableHead>CV Gốc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div>{c.fullName}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </TableCell>
                  <TableCell>{c.positionRaw}</TableCell>
                  <TableCell>
                    <Badge variant={parseInt(c.matchScore) >= 7 ? "default" : "secondary"}>
                      {c.matchScore}/10
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.isPotential && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
                        High Potential
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md truncate" title={c.summary}>
                    {c.summary}
                  </TableCell>
                  <TableCell>{c.timestamp}</TableCell>
                  <TableCell>
                    <a 
                      href={c.cvLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Xem
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
