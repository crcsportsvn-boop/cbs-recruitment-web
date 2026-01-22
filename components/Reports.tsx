"use client";

import { useState, useEffect, useMemo } from "react";
import { dictionary, LangType } from "@/lib/dictionary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell, CartesianGrid } from "recharts";
import { ACTIVE_JOBS } from "@/lib/constants";
import { Loader2, Filter, AlertCircle } from "lucide-react";
import { parse, isAfter, parseISO } from "date-fns";

interface ReportProps {
  lang: LangType;
  user?: any; // Expects { role: string, ... }
}

interface Candidate {
  id: string; 
  status: string;
  source?: string;
  jobCode?: string;
  notes?: string;
  matchScore: number;
  positionRaw?: string;
  timestamp?: string; // dd/MM/yyyy HH:mm:ss
  startDate?: string;
  officialDate?: string;
  rejectedRound?: string;
  applyDate?: string; // YYYY-MM-DD HH:mm:ss
}

interface JobData {
  jobCode: string;
  title: string;
  group: string;
  status: string; 
  stopDate: string;
}

const STAGES = ["New", "Screening", "HR Interview", "Interview Round 1", "Interview Round 2", "Offer", "Hired"];

const STAGE_KEYS: Record<string, string> = {
    "New": "stNew",
    "Screening": "stScreen",
    "HR Interview": "stHR",
    "Interview Round 1": "stL1",
    "Interview Round 2": "stL2",
    "Offer": "stOffer",
    "Hired": "stHired"
};

export default function Reports({ lang, user }: ReportProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterJob, setFilterJob] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const canChangeGroup = user?.role && (user.role.toLowerCase().includes("admin") || user.role.toLowerCase().includes("manager"));

  // Default Group Filter
  useEffect(() => {
    if (!canChangeGroup && user?.role) {
        if (user.role.toLowerCase().includes("store")) setFilterGroup("Store");
        else setFilterGroup("HO");
    }
  }, [user, canChangeGroup]);

  const t = {
    vi: {
        total: "Tổng Ứng Viên",
        active: "Đang Xử Lý",
        rejected: "Đã Loại",
        stock: "Kho Lưu Trữ",
        byJob: "Tiến Độ Theo Job",
        bySource: "Hiệu Quả Nguồn",
        jobCode: "Mã Job",
        jobTitle: "Vị Trí",
        count: "Tổng",
        loading: "Đang tải dữ liệu...",
        funnelTitle: "Phễu Tuyển Dụng",
        filters: "Bộ Lọc",
        all: "Toàn Bộ",
        hiring: "Đang Tuyển",
        stopped: "Đã Dừng",
        groupHO: "Khối Văn Phòng (HO)",
        groupStore: "Khối Cửa Hàng (Store)",
        stNew: "Mới",
        stScreen: "Sàng Lọc",
        stHR: "PV HR",
        stL1: "PV Vòng 1",
        stL2: "PV Vòng 2",
        stOffer: "Offer",
        stHired: "Nhận Việc",
        status: "Trạng thái Job",
        hiringJobs: "Job Đang Tuyển",
        closedJobs: "Job Đã Đóng",
        dateFrom: "Từ Ngày",
        dateTo: "Đến Ngày"
    },
    en: {
        total: "Total Candidates",
        active: "Active Processing",
        rejected: "Rejected",
        stock: "Stock / Hold",
        byJob: "Progress By Job",
        bySource: "Source Efficiency",
        jobCode: "Job Code",
        jobTitle: "Position",
        count: "Total",
        loading: "Loading data...",
        funnelTitle: "Recruitment Funnel",
        filters: "Filters",
        all: "All",
        hiring: "Hiring",
        stopped: "Stopped",
        groupHO: "Head Office (HO)",
        groupStore: "Stores",
        stNew: "New",
        stScreen: "Screening",
        stHR: "HR Interview",
        stL1: "Round 1",
        stL2: "Round 2",
        stOffer: "Offer",
        stHired: "Hired",
        status: "Job Status",
        hiringJobs: "Hiring Jobs",
        closedJobs: "Closed Jobs",
        dateFrom: "From Date",
        dateTo: "To Date"
    }
  }[lang];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candRes, jobRes] = await Promise.all([
        fetch("/api/candidates"),
        fetch("/api/jobs")
      ]);

      const candData = await candRes.json();
      const jobData = await jobRes.json();

      setCandidates(candData.candidates || []);
      setJobs(jobData.jobs || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const jobMap = useMemo(() => {
    const map: Record<string, JobData> = {};
    jobs.forEach(j => {
        map[j.jobCode] = j;
    });
    return map;
  }, [jobs]);

  const getCandidateState = (c: Candidate) => {
    if (c.notes?.includes("Stock")) return "Stock";
    const job = jobMap[c.jobCode || ""];
    // Prefer applyDate (ISO), fallback to timestamp (dd/MM/yyyy)
    if (job && job.status === "Stopped" && job.stopDate) {
        try {
            let cDate;
            if (c.applyDate) {
                cDate = parseISO(c.applyDate);
            } else {
                 cDate = parse(c.timestamp || "", 'dd/MM/yyyy HH:mm:ss', new Date());
            }
            const sDate = parseISO(job.stopDate);
            if (isAfter(cDate, sDate)) return "Stock";
        } catch (e) {}
    }
    if (c.status === "Rejected") return "Rejected";
    return "Active";
  };

  const getStage = (c: Candidate) => {
      if (c.startDate || c.officialDate || c.status === "Hired") return "Hired";
      
      let status = c.status || "New";
      if (status === "Rejected" && c.rejectedRound) {
          status = c.rejectedRound;
      }

      if (status === "Interview") return "Interview Round 1";
      if (status === "Interview2") return "Interview Round 2";
      
      // Safety check: if rejectedRound is random text, default to New? 
      // User request implies we strictly trust the round.
      // But if it doesn't match a key, it won't be counted in columns anyway.
      return status;
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
        const jobCode = c.jobCode || "Unknown";
        const job = jobMap[jobCode];
        
        const group = job?.group || (jobCode.startsWith("ST") ? "Store" : "HO");
        if (filterGroup !== "all" && group !== filterGroup) return false;
        if (filterJob !== "all" && jobCode !== filterJob) return false;
        if (filterSource !== "all" && (c.source || "Unknown") !== filterSource) return false;
        
        const status = job?.status || "Hiring";
        if (filterStatus !== "all" && status !== filterStatus) return false;

        // Date Filter
        if (dateFrom || dateTo) {
            try {
                const cDate = parse(c.timestamp || "", 'dd/MM/yyyy HH:mm:ss', new Date());
                if (dateFrom) {
                    const from = new Date(dateFrom); from.setHours(0,0,0,0);
                    if (cDate < from) return false;
                }
                if (dateTo) {
                    const to = new Date(dateTo); to.setHours(23,59,59,999);
                    if (cDate > to) return false;
                }
            } catch (e) {}
        }

        return true;
    });
  }, [candidates, filterGroup, filterJob, filterSource, filterStatus, jobMap, dateFrom, dateTo]);

  const stats = useMemo(() => {
      let total = 0, active = 0, stock = 0, rejected = 0;
      const stageCounts: Record<string, number> = {};
      const jobStats: Record<string, any> = {};
      const sourceStats: Record<string, any> = {};

      STAGES.forEach(s => stageCounts[s] = 0);

      filteredCandidates.forEach(c => {
          total++;
          const state = getCandidateState(c);
          if (state === "Stock") stock++;
          else if (state === "Rejected") rejected++;
          else active++;

          const currentStage = getStage(c);
          if (state !== "Stock") {
              const stageIndex = STAGES.indexOf(currentStage);
              const rank = stageIndex >= 0 ? stageIndex : 0; 

              // Cumulative Funnel
              for (let i = 0; i <= rank; i++) {
                  stageCounts[STAGES[i]]++;
              }
          }

          const job = c.jobCode || "Unknown";
          const src = c.source || "Unknown";

          if (!jobStats[job]) {
              jobStats[job] = { total: 0, active: 0, stock: 0, rejected: 0, stages: {} as Record<string, number> };
              STAGES.forEach(s => jobStats[job].stages[s] = 0);
          }
          if (!sourceStats[src]) {
              sourceStats[src] = { total: 0, active: 0, stock: 0, rejected: 0, stages: {} as Record<string, number> };
              STAGES.forEach(s => sourceStats[src].stages[s] = 0);
          }

          jobStats[job].total++;
          sourceStats[src].total++;
          if (state === "Stock") { jobStats[job].stock++; sourceStats[src].stock++; }
          else if (state === "Rejected") { jobStats[job].rejected++; sourceStats[src].rejected++; }
          else { jobStats[job].active++; sourceStats[src].active++; }

          if (state !== "Stock") {
             const s = currentStage;
             if (STAGES.includes(s)) {
                 jobStats[job].stages[s]++;
                 sourceStats[src].stages[s]++;
             }
          }
      });

      return { total, active, stock, rejected, stageCounts, jobStats, sourceStats };
  }, [filteredCandidates, jobMap]);

  // Job Status Counts
  const jobCounts = useMemo(() => {
    const allCodes = new Set<string>();
    
    // Only count jobs from actual data (Sheet + Candidates), not hardcoded ACTIVE_JOBS
    // Add from jobs sheet (normalize empty to "Unknown")
    jobs.forEach(j => {
      const code = j.jobCode?.trim() || "Unknown";
      allCodes.add(code);
    });
    
    // Add from candidates (normalize empty to "Unknown")
    candidates?.forEach(c => {
      const code = c.jobCode?.trim() || "Unknown";
      allCodes.add(code);
    });

    const stopped = jobs.filter(j => j.status === "Stopped").length;
    const totalUnique = allCodes.size;
    const hiring = Math.max(0, totalUnique - stopped);
      
    return { hiring, stopped };
  }, [jobs, candidates]);

  const funnelData = STAGES.map((stage, index) => {
      const val = stats.stageCounts[stage] || 0;
      const prevVal = index > 0 ? stats.stageCounts[STAGES[index-1]] : val;
      const rate = prevVal > 0 ? Math.round((val / prevVal) * 100) : 0;
      const totalNew = stats.stageCounts["New"] || 1;
      const totalRate = Math.round((val / totalNew) * 100);
      const label = t[STAGE_KEYS[stage] as keyof typeof t] || stage;

      return { name: label, fullStage: stage, value: val, rate, totalRate };
  });

  const uniqueJobCodes = useMemo(() => {
      const allCodes = new Set<string>();
      // Only show jobs from actual data, not hardcoded templates
      jobs.forEach(j => {
        const code = j.jobCode?.trim() || "Unknown";
        allCodes.add(code);
      });
      candidates?.forEach(c => {
        const code = c.jobCode?.trim() || "Unknown";
        allCodes.add(code);
      });
      return Array.from(allCodes).sort();
  }, [jobs, candidates]);

  const uniqueSources = useMemo(() => Array.from(new Set(candidates.map(c => c.source || "Unknown"))).sort(), [candidates]);

  if (loading) {
      return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
        
        {/* Filters */}
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="h-4 w-4"/> {t.filters}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Group</label>
                        <Select value={filterGroup} onValueChange={setFilterGroup} disabled={!canChangeGroup}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.all}</SelectItem>
                                <SelectItem value="HO">{t.groupHO}</SelectItem>
                                <SelectItem value="Store">{t.groupStore}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">{t.status}</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.all}</SelectItem>
                                <SelectItem value="Hiring">Hiring</SelectItem>
                                <SelectItem value="Stopped">Stopped</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">{t.jobCode}</label>
                        <Select value={filterJob} onValueChange={setFilterJob}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.all}</SelectItem>
                                {uniqueJobCodes.map(code => {
                                    const jobMeta = jobs.find(j => j.jobCode === code);
                                    const rawName = ACTIVE_JOBS.find(j => j.id === code)?.name || jobMeta?.title || code;
                                    const isStopped = jobMeta?.status === "Stopped";
                                    // Truncate name
                                    const name = rawName.length > 25 ? rawName.substring(0,25)+"..." : rawName;
                                    return <SelectItem key={code} value={code} className={isStopped ? "text-red-500" : ""}>{code} - {name}</SelectItem>
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Source</label>
                        <Select value={filterSource} onValueChange={setFilterSource}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.all}</SelectItem>
                                {uniqueSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">{t.dateFrom}</label>
                        <input type="date" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">{t.dateTo}</label>
                        <input type="date" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                            value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                </div>
            </CardContent>
        </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-600 shadow-sm"><CardContent className="pt-6"><div className="text-sm font-medium text-gray-500 uppercase">{t.total}</div><div className="text-2xl font-bold text-gray-800">{stats.total}</div></CardContent></Card>
        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm"><CardContent className="pt-6"><div className="text-sm font-medium text-gray-500 uppercase">{t.active}</div><div className="text-2xl font-bold text-green-600">{stats.active}</div></CardContent></Card>
        <Card className="bg-white border-l-4 border-l-gray-400 shadow-sm"><CardContent className="pt-6"><div className="text-sm font-medium text-gray-500 uppercase">{t.stock}</div><div className="text-2xl font-bold text-gray-600">{stats.stock}</div></CardContent></Card>
        <Card className="bg-white border-l-4 border-l-red-500 shadow-sm"><CardContent className="pt-6"><div className="text-sm font-medium text-gray-500 uppercase">{t.rejected}</div><div className="text-2xl font-bold text-red-500">{stats.rejected}</div></CardContent></Card>
        
        {/* New Job Status Cards */}
        <Card className="bg-blue-50 border-l-4 border-l-blue-400 shadow-sm"><CardContent className="pt-6"><div className="text-sm font-medium text-blue-600 uppercase">{t.hiringJobs}</div><div className="text-2xl font-bold text-blue-800">{jobCounts.hiring}</div></CardContent></Card>
        <Card className="bg-gray-50 border-l-4 border-l-gray-500 shadow-sm"><CardContent className="pt-6"><div className="text-sm font-medium text-gray-500 uppercase">{t.closedJobs}</div><div className="text-2xl font-bold text-gray-700">{jobCounts.stopped}</div></CardContent></Card>
      </div>

      {/* Funnel Chart */}
      <Card>
          <CardHeader><CardTitle>{t.funnelTitle}</CardTitle></CardHeader>
          <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white p-2 border rounded shadow-md text-sm">
                                        <p className="font-bold">{d.fullStage}</p>
                                        <p>Count: {d.value}</p>
                                        <p>Yield: {d.rate}%</p>
                                        <p>Conversion: {d.totalRate}%</p>
                                    </div>
                                );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}><LabelList dataKey="value" position="top" /></Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </CardContent>
      </Card>

      {/* Detailed Tables */}
      <div className="space-y-6">
          <Card>
               <CardHeader><CardTitle>{t.byJob}</CardTitle></CardHeader>
               <CardContent>
                   <div className="overflow-x-auto">
                   <Table>
                       <TableHeader>
                           <TableRow className="bg-gray-50">
                               <TableHead className="w-[100px] min-w-[100px]">{t.jobCode}</TableHead>
                               <TableHead className="w-[250px] min-w-[200px]">{t.jobTitle}</TableHead>
                               <TableHead className="text-center font-bold w-24 min-w-[80px]">{t.count}</TableHead>
                               <TableHead className="text-center text-green-600 w-24 min-w-[80px]">Active</TableHead>
                               <TableHead className="text-center text-gray-500 w-24 min-w-[80px]">Stock</TableHead>
                               <TableHead className="text-center text-red-500 w-24 min-w-[80px]">Reject</TableHead>
                               {STAGES.map(s => (
                                   <TableHead key={s} className="text-center text-xs text-gray-400 whitespace-nowrap w-24 min-w-[80px]">
                                       {t[STAGE_KEYS[s] as keyof typeof t] || s}
                                   </TableHead>
                               ))}
                               <TableHead className="text-center font-bold text-blue-600 w-24 min-w-[80px]">% Conv</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {Object.entries(stats.jobStats).sort((a,b) => b[1].total - a[1].total).map(([jobCode, stat]: [string, any]) => {
                               const jobInfo = jobMap[jobCode];
                               let title = jobInfo?.title && jobInfo.title !== "Unknown" ? jobInfo.title : (ACTIVE_JOBS.find(j=>j.id===jobCode)?.name || "Unknown");
                               if (title === "Unknown") {
                                   // Fallback to finding position from candidates
                                   const cand = candidates.find(c => c.jobCode === jobCode);
                                   if (cand?.positionRaw) title = cand.positionRaw;
                               }
                               
                               return (
                                   <TableRow key={jobCode}>
                                       <TableCell className="font-medium">{jobCode}</TableCell>
                                       <TableCell className="text-xs text-gray-600 truncate max-w-[200px]" title={title}>{title}</TableCell>
                                        <TableCell className="text-center font-bold w-24">{stat.total}</TableCell>
                                       <TableCell className="text-center font-medium text-green-600 w-24">{stat.active}</TableCell>
                                       <TableCell className="text-center text-gray-500 w-24">{stat.stock}</TableCell>
                                       <TableCell className="text-center text-red-500 w-24">{stat.rejected}</TableCell>
                                       {STAGES.map(s => (<TableCell key={s} className="text-center text-xs border-l w-24">{stat.stages[s] || "-"}</TableCell>))}
                                       <TableCell className="text-center font-bold text-blue-600 border-l w-24">
                                            {stat.stages["New"] > 0 ? Math.round((stat.stages["Hired"] / stat.stages["New"]) * 100) + "%" : "0%"}
                                       </TableCell>
                                   </TableRow>
                               );
                           })}
                       </TableBody>
                   </Table>
                   </div>
               </CardContent>
          </Card>

          <Card>
               <CardHeader><CardTitle>{t.bySource}</CardTitle></CardHeader>
               <CardContent>
                   <div className="overflow-x-auto">
                   <Table>
                       <TableHeader>
                           <TableRow className="bg-gray-50">
                               <TableHead className="w-[350px] min-w-[300px]">Source</TableHead>
                               <TableHead className="text-center font-bold w-24 min-w-[80px]">{t.count}</TableHead>
                               <TableHead className="text-center text-green-600 w-24 min-w-[80px]">Active</TableHead>
                               <TableHead className="text-center text-gray-500 w-24 min-w-[80px]">Stock</TableHead>
                               <TableHead className="text-center text-red-500 w-24 min-w-[80px]">Reject</TableHead>
                               {STAGES.map(s => (
                                   <TableHead key={s} className="text-center text-xs text-gray-400 whitespace-nowrap w-24 min-w-[80px]">
                                        {t[STAGE_KEYS[s] as keyof typeof t] || s}
                                   </TableHead>
                               ))}
                               <TableHead className="text-center font-bold text-blue-600 w-24 min-w-[80px]">% Conv</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {Object.entries(stats.sourceStats).sort((a,b) => b[1].total - a[1].total).map(([src, stat]: [string, any]) => (
                               <TableRow key={src}>
                                   <TableCell className="font-medium">{src}</TableCell>
                                    <TableCell className="text-center font-bold w-24">{stat.total}</TableCell>
                                   <TableCell className="text-center font-medium text-green-600 w-24">{stat.active}</TableCell>
                                   <TableCell className="text-center text-gray-500 w-24">{stat.stock}</TableCell>
                                   <TableCell className="text-center text-red-500 w-24">{stat.rejected}</TableCell>
                                   {STAGES.map(s => (<TableCell key={s} className="text-center text-xs border-l w-24">{stat.stages[s] || "-"}</TableCell>))}
                                   <TableCell className="text-center font-bold text-blue-600 border-l w-24">
                                        {stat.stages["New"] > 0 ? Math.round((stat.stages["Hired"] / stat.stages["New"]) * 100) + "%" : "0%"}
                                   </TableCell>
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
