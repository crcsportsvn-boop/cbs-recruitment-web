"use client";

import { useState, useEffect, useRef } from "react";
import { dictionary, LangType } from "@/lib/dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Eye,
  EyeOff,
  Settings,
  Check,
  MoreHorizontal,
  User,
  Calendar,
  MapPin,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
  Wrench,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import RehireModal from "@/components/RehireModal";
import { parse, isAfter, parseISO } from "date-fns";

interface JobData {
  jobCode: string;
  status: string;
  stopDate: string;
}

interface Candidate {
  id: string;
  name: string;
  position: string;
  status: string;
  matchScore: number;
  phone: string;
  email: string;
  cvLink: string;
  education?: string;
  degree?: string;
  matchReason?: string;
  source?: string;
  timestamp?: string;
  failureReason?: string;
  summary?: string;
  isPotential?: boolean;
  rejectedRound?: string;
  yob?: string;
  gender?: string;
  location?: string;
  notes?: string;
  // New Fields
  jobFunction?: string;
  workHistory?: string;
  skills?: string;
  certification?: string;
  jobCode?: string;
  applyDate?: string;
}

interface DatapoolTableProps {
  lang: LangType;
  user?: any;
}

const REASONS_EN = {
  screening: [
    "Not suitable for JD",
    "Insufficient Experience",
    "Duplicate CV",
    "Blacklist",
    "Other",
  ],
};

export default function DatapoolTable({ lang, user }: DatapoolTableProps) {
  const t = dictionary[lang].datapoolTable;
  const tKanban = dictionary[lang].kanban;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"active" | "rejected" | "stock">(
    "active",
  );
  const [isRehireModalOpen, setIsRehireModalOpen] = useState(false);
  const [rehireCandidate, setRehireCandidate] = useState<Candidate | null>(
    null,
  );

  const uniqueJobCodes = Array.from(
    new Set(candidates.map((c) => c.jobCode).filter(Boolean)),
  ) as string[];
  const uniqueSources = Array.from(
    new Set(candidates.map((c) => c.source).filter(Boolean)),
  ) as string[];
  const uniqueStatuses = Array.from(
    new Set(candidates.map((c) => c.status).filter(Boolean)),
  ) as string[];

  // Column Filters
  const [colFilters, setColFilters] = useState({
    dateFrom: "",
    dateTo: "",
    candidate: "",
    position: "",
    source: "",
    status: "",
    education: "",
    matchReason: "",
    rejectedRound: "",
    summary: "",
    jobCode: "",
  });

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    received: true,
    jobCode: true,
    candidate: true,
    position: true,
    score: true,
    source: true,
    status: true,
    education: false,
    matchReason: false,
    rejectedRound: true,
    potential: true,
    summary: false,
    actions: true,
  });

  // Actions / Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [jobs, setJobs] = useState<Record<string, JobData>>({});
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

  // Decline Logic
  const [declineReasonType, setDeclineReasonType] = useState<string>("");
  const [declineReasonText, setDeclineReasonText] = useState("");
  const [isPotentialDecline, setIsPotentialDecline] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(
    null,
  );

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const [candRes, jobRes] = await Promise.all([
        fetch("/api/candidates"),
        fetch("/api/jobs"),
      ]);

      if (!candRes.ok) throw new Error("Failed to fetch candidates");
      const data = await candRes.json();
      const jobData = await jobRes.json();

      // Process Jobs into Map
      const jobMap: Record<string, JobData> = {};
      if (jobData.jobs) {
        jobData.jobs.forEach((j: any) => {
          jobMap[j.jobCode] = {
            jobCode: j.jobCode,
            status: j.status,
            stopDate: j.stopDate,
          };
        });
      }
      setJobs(jobMap);

      const formatted = data.candidates.map((c: any) => ({
        id: c.id,
        name: c.fullName,
        position: c.positionId
          ? `${c.positionRaw} (${c.positionId})`
          : c.positionRaw,
        status: c.status || "New",
        matchScore: parseInt(c.matchScore) || 0,
        phone: c.phone,
        email: c.email,
        cvLink: c.cvLink,
        education: c.education,
        degree: c.degree,
        matchReason: c.matchReason,
        source: c.source,
        timestamp: c.timestamp,
        failureReason: c.failureReason,
        summary: c.summary,
        isPotential: c.isPotential,
        rejectedRound: c.rejectedRound,
        yob: c.yob,
        gender: c.gender,
        location: c.location,
        notes: c.notes,
        // Map new fields
        jobFunction: c.jobFunction,
        workHistory: c.workHistory,
        skills: c.skills,

        certification: c.certification,
        jobCode: c.jobCode,
        applyDate: c.applyDate,
      }));
      setCandidates(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateAPI = async (id: string, updates: any) => {
    try {
      const res = await fetch("/api/candidates/update", {
        method: "POST",
        body: JSON.stringify({ id, updates }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "API returned error");
      }

      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  // Handle Rehire (Stock → Active)
  const handleReactivate = (candidate: Candidate) => {
    setRehireCandidate(candidate);
    setIsRehireModalOpen(true);
  };

  // Confirm Rehire
  const confirmRehire = async (jobCode: string) => {
    if (!rehireCandidate) return;

    // Determine correct applyDate logic:
    // If the target job is STOPPED, we must backdate the candidate's applyDate
    // to the stopDate (or effectively before the stop rule) so they are not immediately re-stocked.
    // If the target job is ACTIVE, we can just clear applyDate (letting it fall back to timestamp),
    // or leave it blank.
    let newApplyDate = "";
    const targetJob = jobs[jobCode];
    if (targetJob && targetJob.status === "Stopped" && targetJob.stopDate) {
      newApplyDate = targetJob.stopDate;
    }

    // Optimistic Update
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === rehireCandidate.id
          ? {
              ...c,
              status: "Screening",
              jobCode,
              notes: "",
              applyDate: newApplyDate,
            }
          : c,
      ),
    );

    // API Update
    await updateCandidateAPI(rehireCandidate.id, {
      status: "Screening",
      jobCode,
      notes: "",
      applyDate: newApplyDate,
    });

    // Refresh data
    fetchCandidates();
    setIsRehireModalOpen(false);
    setRehireCandidate(null);
  };

  // Helper to parse DD/MM/YYYY
  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split(" ")[0].split("/"); // "21/01/2026"
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0]),
        );
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  // Filter Logic
  const filteredCandidates = candidates.filter((c) => {
    // Global Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(searchLower) ||
      c.position?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchLower);

    // Score Filter
    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "high" && c.matchScore >= 8) ||
      (scoreFilter === "medium" && c.matchScore >= 5 && c.matchScore < 8) ||
      (scoreFilter === "low" && c.matchScore < 5);

    // View Mode (Show/Hide Rejected)
    // Check Stops
    const isNoteStock = c.notes?.includes("Stock");
    let isStoppedRule = false;
    const job = jobs[c.jobCode || ""];
    if (job && job.status === "Stopped" && job.stopDate && c.timestamp) {
      try {
        // c.timestamp is "dd/MM/yyyy...", c.applyDate is ISO "YYYY-MM-DD..."
        let cDate;
        if (c.applyDate) {
          cDate = parseISO(c.applyDate);
        } else {
          cDate = parse(c.timestamp, "dd/MM/yyyy HH:mm:ss", new Date());
        }
        const sDate = parseISO(job.stopDate);
        if (isAfter(cDate, sDate)) isStoppedRule = true;
      } catch (e) {}
    }
    const isStock = isNoteStock || isStoppedRule;

    // View Mode Filter
    if (viewMode === "active") {
      if (isStock) return false;
      if (c.status === "Rejected") return false;
    }
    if (viewMode === "rejected") {
      if (c.status !== "Rejected") return false;
    }
    if (viewMode === "stock") {
      if (!isStock) return false;
    }

    // Date Range Filter
    let matchesDate = true;
    if (colFilters.dateFrom || colFilters.dateTo) {
      const cDate = parseDate(c.timestamp);
      if (cDate) {
        if (colFilters.dateFrom) {
          const fromDate = new Date(colFilters.dateFrom); // YYYY-MM-DD
          fromDate.setHours(0, 0, 0, 0);
          if (cDate < fromDate) matchesDate = false;
        }
        if (colFilters.dateTo) {
          const toDate = new Date(colFilters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (cDate > toDate) matchesDate = false;
        }
      }
    }

    // Column Filters
    const matchesColFilters =
      matchesDate &&
      (colFilters.candidate === "" ||
        c.name.toLowerCase().includes(colFilters.candidate.toLowerCase()) ||
        c.email.toLowerCase().includes(colFilters.candidate.toLowerCase())) &&
      (colFilters.position === "" ||
        c.position
          ?.toLowerCase()
          .includes(colFilters.position.toLowerCase())) &&
      (colFilters.position === "" ||
        c.position
          ?.toLowerCase()
          .includes(colFilters.position.toLowerCase())) &&
      (colFilters.source === "" || c.source === colFilters.source) &&
      (colFilters.status === "" || c.status === colFilters.status) &&
      (colFilters.education === "" ||
        c.education
          ?.toLowerCase()
          .includes(colFilters.education.toLowerCase()) ||
        c.degree?.toLowerCase().includes(colFilters.education.toLowerCase())) &&
      (colFilters.matchReason === "" ||
        c.matchReason
          ?.toLowerCase()
          .includes(colFilters.matchReason.toLowerCase())) &&
      (colFilters.rejectedRound === "" ||
        c.rejectedRound
          ?.toLowerCase()
          .includes(colFilters.rejectedRound.toLowerCase())) &&
      (colFilters.rejectedRound === "" ||
        c.rejectedRound
          ?.toLowerCase()
          .includes(colFilters.rejectedRound.toLowerCase())) &&
      (colFilters.summary === "" ||
        c.summary?.toLowerCase().includes(colFilters.summary.toLowerCase())) &&
      (colFilters.jobCode === "" || c.jobCode === colFilters.jobCode);

    return matchesSearch && matchesScore && matchesColFilters;
  });

  // Actions
  const handleProceedToScreen = async (c: Candidate) => {
    // Auto-next logic: Find next candidate locally BEFORE update changes filter results
    const currentIndex = filteredCandidates.findIndex(
      (cand) => cand.id === c.id,
    );
    const nextCandidate =
      currentIndex !== -1 && currentIndex < filteredCandidates.length - 1
        ? filteredCandidates[currentIndex + 1]
        : null;

    const todayStr = new Date().toLocaleDateString("en-GB");
    await updateCandidateAPI(c.id, {
      status: "Screening",
      testResult: todayStr,
    });

    if (isDeclineModalOpen) setIsDeclineModalOpen(false); // Should not be open here, but safe close

    // Auto-Next
    if (nextCandidate && selectedCandidate?.id === c.id) {
      setSelectedCandidate(nextCandidate);
    } else if (!nextCandidate && selectedCandidate?.id === c.id) {
      // No next candidate, maybe close? Or keep showing updated state.
      // User requested "jump to next", implies if no next, stay?
      // staying is fine.
    }
  };

  const handleWithdrawToScreen = async (c: Candidate) => {
    await updateCandidateAPI(c.id, {
      status: "Screening",
      failureReason: "",
      rejectedRound: "",
    });
  };

  const handleRejectClick = (c: Candidate) => {
    setCandidateToReject(c);
    setDeclineReasonType("");
    setDeclineReasonText("");
    setIsPotentialDecline(false);
    setIsDeclineModalOpen(true);
  };

  const confirmDecline = async () => {
    if (!candidateToReject) return;

    let finalReason = declineReasonType;
    if (declineReasonType === "Other" || !declineReasonType) {
      finalReason = declineReasonText;
    }

    const rejectedRound = "Screening";

    // Auto-next logic
    const currentIndex = filteredCandidates.findIndex(
      (cand) => cand.id === candidateToReject.id,
    );
    const nextCandidate =
      currentIndex !== -1 && currentIndex < filteredCandidates.length - 1
        ? filteredCandidates[currentIndex + 1]
        : null;

    await updateCandidateAPI(candidateToReject.id, {
      status: "Rejected",
      failureReason: finalReason,
      isPotential: isPotentialDecline,
      rejectedRound: rejectedRound,
    });

    setIsDeclineModalOpen(false);
    setCandidateToReject(null);

    // If we are currently viewing the candidate we just rejected, jump to next
    if (selectedCandidate?.id === candidateToReject.id && nextCandidate) {
      setSelectedCandidate(nextCandidate);
    }
    if (selectedCandidate?.id === candidateToReject.id && nextCandidate) {
      setSelectedCandidate(nextCandidate);
    }
  };

  // Navigation Logic for Modal
  const currentIndex = selectedCandidate
    ? filteredCandidates.findIndex((c) => c.id === selectedCandidate.id)
    : -1;
  const hasNext =
    currentIndex !== -1 && currentIndex < filteredCandidates.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) setSelectedCandidate(filteredCandidates[currentIndex + 1]);
  };
  const handlePrev = () => {
    if (hasPrev) setSelectedCandidate(filteredCandidates[currentIndex - 1]);
  };

  // Keyboard Navigation & Auto Scroll
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCandidate) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCandidate, currentIndex, filteredCandidates]); // Re-bind when index/list changes to ensure handleNext uses fresh state

  // Auto-scroll to top when selectedCandidate changes
  useEffect(() => {
      if (selectedCandidate && detailRef.current) {
          detailRef.current.scrollTop = 0;
      }
  }, [selectedCandidate]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow min-h-[500px]">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-3 rounded-lg border">
        {/* Search */}
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t.searchPlaceholder}
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto items-center">
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder={t.filterAll} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterAll}</SelectItem>
              <SelectItem value="high">High (&ge; 8)</SelectItem>
              <SelectItem value="medium">Medium (5-7)</SelectItem>
              <SelectItem value="low">Low (&lt; 5)</SelectItem>
            </SelectContent>
          </Select>

          {/* Toggle View Mode */}
          {/* View Toggles */}
          <div className="flex bg-gray-100 p-1 rounded-md gap-1 h-9 items-center">
            <Button
              variant={viewMode === "active" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 text-xs ${viewMode === "active" ? "bg-green-100 text-green-700 hover:bg-green-200 shadow-sm" : "text-gray-500"}`}
              onClick={() => setViewMode("active")}
            >
              Active
            </Button>
            <Button
              variant={viewMode === "rejected" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 text-xs ${viewMode === "rejected" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
              onClick={() => setViewMode("rejected")}
            >
              Rejected
            </Button>
            <Button
              variant={viewMode === "stock" ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 text-xs ${viewMode === "stock" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
              onClick={() => setViewMode("stock")}
            >
              Stock
            </Button>
          </div>

          {/* Column Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-2 gap-2"
                title={t.configureColumns}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={visibleColumns.potential}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, potential: !!c }))
                }
              >
                {t.colPotential}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.rejectedRound}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, rejectedRound: !!c }))
                }
              >
                {t.colRejectedRound}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.summary}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, summary: !!c }))
                }
              >
                {t.colSummary}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.education}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, education: !!c }))
                }
              >
                {t.colEducation}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.matchReason}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, matchReason: !!c }))
                }
              >
                {t.colMatchReason}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.score}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, score: !!c }))
                }
              >
                {t.colScore}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.source}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, source: !!c }))
                }
              >
                {t.colSource}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.jobCode}
                onCheckedChange={(c) =>
                  setVisibleColumns((p) => ({ ...p, jobCode: !!c }))
                }
              >
                Job Code
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/50">
              {visibleColumns.received && (
                <TableHead className="w-[100px]">{t.colReceived}</TableHead>
              )}
              {visibleColumns.jobCode && (
                <TableHead className="w-[100px]">Job Code</TableHead>
              )}
              {visibleColumns.candidate && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    {t.colCandidate}
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] bg-gray-100 text-gray-600"
                    >
                      {filteredCandidates.length}
                    </Badge>
                  </div>
                </TableHead>
              )}
              {visibleColumns.position && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    {t.colPosition}
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] bg-gray-100 text-gray-600"
                    >
                      {
                        new Set(
                          filteredCandidates
                            .map((c) => c.position)
                            .filter(Boolean),
                        ).size
                      }
                    </Badge>
                  </div>
                </TableHead>
              )}
              {visibleColumns.score && (
                <TableHead className="text-center">{t.colScore}</TableHead>
              )}
              {visibleColumns.source && (
                <TableHead>
                  <div className="flex items-center gap-2">
                    {t.colSource}
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 min-w-[20px] justify-center text-[10px] bg-gray-100 text-gray-600"
                    >
                      {
                        new Set(
                          filteredCandidates
                            .map((c) => c.source)
                            .filter(Boolean),
                        ).size
                      }
                    </Badge>
                  </div>
                </TableHead>
              )}
              {visibleColumns.status && <TableHead>{t.colStatus}</TableHead>}
              {visibleColumns.education && (
                <TableHead>{t.colEducation}</TableHead>
              )}
              {visibleColumns.matchReason && (
                <TableHead>{t.colMatchReason}</TableHead>
              )}
              {viewMode === "rejected" && visibleColumns.rejectedRound && (
                <TableHead>{t.colRejectedRound}</TableHead>
              )}
              {viewMode === "rejected" && visibleColumns.potential && (
                <TableHead className="text-center">{t.colPotential}</TableHead>
              )}
              {visibleColumns.summary && (
                <TableHead className="w-[200px]">{t.colSummary}</TableHead>
              )}
              {visibleColumns.actions && (
                <TableHead className="text-right">{t.colActions}</TableHead>
              )}
            </TableRow>

            <TableRow className="bg-gray-50 border-b">
              {visibleColumns.received && (
                <TableHead className="p-1 min-w-[150px]">
                  <div className="flex flex-row gap-1">
                    <div className="relative w-1/2">
                      <Calendar className="absolute left-1 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="From"
                        className="h-6 text-[10px] pl-5 pr-1 w-full bg-white"
                        onFocus={(e) => {
                          e.target.type = "date";
                          try {
                            e.target.showPicker();
                          } catch (err) {}
                        }}
                        onClick={(e) => {
                          if (e.currentTarget.type === "date") {
                            try {
                              e.currentTarget.showPicker();
                            } catch (err) {}
                          }
                        }}
                        onBlur={(e) => {
                          if (!e.target.value) e.target.type = "text";
                        }}
                        value={colFilters.dateFrom}
                        onChange={(e) =>
                          setColFilters({
                            ...colFilters,
                            dateFrom: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="relative w-1/2">
                      <Calendar className="absolute left-1 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="To"
                        className="h-6 text-[10px] pl-5 pr-1 w-full bg-white"
                        onFocus={(e) => {
                          e.target.type = "date";
                          try {
                            e.target.showPicker();
                          } catch (err) {}
                        }}
                        onClick={(e) => {
                          if (e.currentTarget.type === "date") {
                            try {
                              e.currentTarget.showPicker();
                            } catch (err) {}
                          }
                        }}
                        onBlur={(e) => {
                          if (!e.target.value) e.target.type = "text";
                        }}
                        value={colFilters.dateTo}
                        onChange={(e) =>
                          setColFilters({
                            ...colFilters,
                            dateTo: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </TableHead>
              )}

              {visibleColumns.jobCode && (
                <TableHead className="p-1">
                  <Select
                    value={colFilters.jobCode}
                    onValueChange={(val) =>
                      setColFilters({
                        ...colFilters,
                        jobCode: val === "all" ? "" : val,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs bg-white w-full px-2">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {uniqueJobCodes.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
              )}

              {visibleColumns.candidate && (
                <TableHead className="p-1">
                  <Input
                    placeholder="Name/Email..."
                    className="h-7 text-xs bg-white"
                    value={colFilters.candidate}
                    onChange={(e) =>
                      setColFilters({
                        ...colFilters,
                        candidate: e.target.value,
                      })
                    }
                  />
                </TableHead>
              )}
              {visibleColumns.position && (
                <TableHead className="p-1">
                  <Input
                    placeholder="Position..."
                    className="h-7 text-xs bg-white"
                    value={colFilters.position}
                    onChange={(e) =>
                      setColFilters({ ...colFilters, position: e.target.value })
                    }
                  />
                </TableHead>
              )}

              {/* Score Filter Dropdown */}
              {visibleColumns.score && (
                <TableHead className="p-1 text-center">
                  <Select value={scoreFilter} onValueChange={setScoreFilter}>
                    <SelectTrigger className="h-7 text-xs bg-white w-full px-2 flex items-center justify-between">
                      {/* Show dot icon if selected */}
                      {scoreFilter === "all" ? (
                        <span className="text-gray-400">All</span>
                      ) : scoreFilter === "high" ? (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      ) : scoreFilter === "medium" ? (
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {lang === "vi" ? "Tất cả" : "All"}
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          {lang === "vi"
                            ? "Phù hợp cao (>=8)"
                            : "High Match (>=8)"}
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          {lang === "vi" ? "Phù hợp TB (5-7)" : "Medium (5-7)"}
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          {lang === "vi"
                            ? "Phù hợp thấp (<5)"
                            : "Low Match (<5)"}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>
              )}

              {visibleColumns.source && (
                <TableHead className="p-1">
                  <Select
                    value={colFilters.source}
                    onValueChange={(val) =>
                      setColFilters({
                        ...colFilters,
                        source: val === "all" ? "" : val,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs bg-white w-full px-2">
                      <SelectValue placeholder={t.filterAll} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.filterAll}</SelectItem>
                      {uniqueSources.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
              )}
              {visibleColumns.status && (
                <TableHead className="p-1">
                  <Select
                    value={colFilters.status}
                    onValueChange={(val) =>
                      setColFilters({
                        ...colFilters,
                        status: val === "all" ? "" : val,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs bg-white w-full px-2">
                      <SelectValue placeholder={t.filterAll} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.filterAll}</SelectItem>
                      {uniqueStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
              )}
              {visibleColumns.education && (
                <TableHead className="p-1">
                  <Input
                    placeholder="School/Degree..."
                    className="h-7 text-xs bg-white"
                    value={colFilters.education}
                    onChange={(e) =>
                      setColFilters({
                        ...colFilters,
                        education: e.target.value,
                      })
                    }
                  />
                </TableHead>
              )}
              {visibleColumns.matchReason && (
                <TableHead className="p-1">
                  <Input
                    placeholder="Reason..."
                    className="h-7 text-xs bg-white"
                    value={colFilters.matchReason}
                    onChange={(e) =>
                      setColFilters({
                        ...colFilters,
                        matchReason: e.target.value,
                      })
                    }
                  />
                </TableHead>
              )}
              {viewMode === "rejected" && visibleColumns.rejectedRound && (
                <TableHead className="p-1">
                  <Input
                    placeholder="Round..."
                    className="h-7 text-xs bg-white"
                    value={colFilters.rejectedRound}
                    onChange={(e) =>
                      setColFilters({
                        ...colFilters,
                        rejectedRound: e.target.value,
                      })
                    }
                  />
                </TableHead>
              )}
              {viewMode === "rejected" && visibleColumns.potential && (
                <TableHead className="p-1 font-normal text-xs text-gray-400 text-center">
                  -
                </TableHead>
              )}
              {visibleColumns.summary && (
                <TableHead className="p-1">
                  <Input
                    placeholder="Summary..."
                    className="h-7 text-xs bg-white"
                    value={colFilters.summary}
                    onChange={(e) =>
                      setColFilters({ ...colFilters, summary: e.target.value })
                    }
                  />
                </TableHead>
              )}
              {visibleColumns.actions && <TableHead></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="h-24 text-center text-gray-500"
                >
                  {viewMode === "rejected"
                    ? "No rejected candidates."
                    : viewMode === "stock"
                      ? "No stock candidates."
                      : "No active candidates."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((c) => (
                <TableRow
                  key={c.id}
                  className="group hover:bg-blue-50/70 transition-all border-l-4 border-l-transparent hover:border-l-blue-500 cursor-pointer"
                  onClick={() => setSelectedCandidate(c)}
                >
                  {visibleColumns.received && (
                    <TableCell className="font-medium text-xs text-gray-500">
                      {c.timestamp ? c.timestamp.split(" ")[0] : "-"}
                    </TableCell>
                  )}

                  {visibleColumns.jobCode && (
                    <TableCell className="text-xs font-medium text-gray-600">
                      {c.jobCode || "-"}
                    </TableCell>
                  )}

                  {visibleColumns.candidate && (
                    <TableCell>
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-500">{c.email}</div>
                    </TableCell>
                  )}

                  {visibleColumns.position && (
                    <TableCell className="text-sm">{c.position}</TableCell>
                  )}

                  {visibleColumns.score && (
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          c.matchScore >= 8
                            ? "bg-green-100 text-green-700"
                            : c.matchScore >= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.matchScore}
                      </span>
                    </TableCell>
                  )}

                  {visibleColumns.source && (
                    <TableCell className="text-sm text-gray-600">
                      {c.source}
                    </TableCell>
                  )}

                  {visibleColumns.status && (
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          viewMode === "rejected"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : "border-blue-200 text-blue-700 bg-blue-50"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                  )}

                  {visibleColumns.education && (
                    <TableCell className="text-sm text-gray-600">
                      {c.education || c.degree || "-"}
                    </TableCell>
                  )}
                  {visibleColumns.matchReason && (
                    <TableCell
                      className="text-xs text-gray-500 max-w-[150px] truncate"
                      title={c.matchReason}
                    >
                      {c.matchReason || "-"}
                    </TableCell>
                  )}

                  {viewMode === "rejected" && visibleColumns.rejectedRound && (
                    <TableCell className="text-sm text-gray-600">
                      {c.rejectedRound || "-"}
                    </TableCell>
                  )}

                  {viewMode === "rejected" && visibleColumns.potential && (
                    <TableCell className="text-center">
                      {c.isPotential && (
                        <Check className="h-5 w-5 text-yellow-500 mx-auto" />
                      )}
                    </TableCell>
                  )}

                  {visibleColumns.summary && (
                    <TableCell
                      className="text-xs text-gray-500 max-w-[200px] truncate"
                      title={c.summary}
                    >
                      {c.summary}
                    </TableCell>
                  )}

                  {visibleColumns.actions && (
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedCandidate(c)}
                            >
                              {tKanban?.actionDetail}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => window.open(c.cvLink, "_blank")}
                            >
                              {t.viewCV}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            {viewMode === "stock" ? (
                              <DropdownMenuItem
                                onClick={() => handleReactivate(c)}
                              >
                                Rehire
                              </DropdownMenuItem>
                            ) : viewMode === "rejected" ? (
                              <DropdownMenuItem
                                onClick={() => handleWithdrawToScreen(c)}
                              >
                                {t.actionWithdraw}
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleProceedToScreen(c)}
                                >
                                  {t.actionProceed}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectClick(c)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  {t.actionReject}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Candidate Details Modal */}
      <Dialog
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Candidate Profile</DialogTitle>
              <div className="flex gap-2 pr-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNext}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedCandidate && (
            <div className="grid gap-6 py-4">
              {/* Header Info */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedCandidate.name}
                      {selectedCandidate.isPotential && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Potential
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="font-semibold">
                        {selectedCandidate.position}
                      </span>
                      <span>•</span>
                      <span>{selectedCandidate.email}</span>
                      <span>•</span>
                      <span>{selectedCandidate.phone}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-3xl font-bold ${
                      selectedCandidate.matchScore >= 8
                        ? "text-green-600"
                        : selectedCandidate.matchScore >= 5
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {selectedCandidate.matchScore}/10
                  </div>
                  <span className="text-xs text-gray-400">AI Match Score</span>
                </div>
              </div>

              {/* Summary */}
              {selectedCandidate.summary && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2">
                  <span className="font-semibold text-blue-800 flex items-center gap-2">
                    ✨ Summary
                  </span>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                    {selectedCandidate.summary}
                  </p>
                </div>
              )}

              {/* Grid Info */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div className="col-span-3 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-4 w-4" /> Personal Info
                </div>

                <div>
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Full Name
                  </label>
                  <p>{selectedCandidate.name}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Gender / YOB
                  </label>
                  <p>
                    {selectedCandidate.gender || "-"} /{" "}
                    {selectedCandidate.yob || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase font-bold flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location
                  </label>
                  <p>{selectedCandidate.location || "-"}</p>
                </div>

                <div className="col-span-3 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2 mt-4">
                  <Briefcase className="h-4 w-4" /> Experience & Skills
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Current Function
                  </label>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedCandidate.jobFunction
                      ? selectedCandidate.jobFunction.replace(
                          /(?<!^)(\s?-\s)/g,
                          "\n- ",
                        )
                      : "-"}
                  </p>
                </div>
                <div className="col-span-1">
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Skills
                  </label>
                  <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-normal">
                    {selectedCandidate.skills
                      ? selectedCandidate.skills.replace(
                          /(?<!^)(\s?-\s)/g,
                          "\n- ",
                        )
                      : "-"}
                  </p>
                </div>
                <div className="col-span-3 mt-2">
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Work History
                  </label>
                  <p className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border mt-1 leading-relaxed">
                    {selectedCandidate.workHistory
                      ? selectedCandidate.workHistory
                          .replace(/\\n/g, "\n")
                          .replace(/(?<!^)(\s?-\s)/g, "\n- ")
                      : "-"}
                  </p>
                </div>

                <div className="col-span-3 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2 mt-4">
                  <GraduationCap className="h-4 w-4" /> Education
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    School
                  </label>
                  <p>{selectedCandidate.education || "-"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Degree
                  </label>
                  <p>{selectedCandidate.degree || "-"}</p>
                </div>

                <div className="col-span-3 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2 mt-4">
                  <Calendar className="h-4 w-4" /> Application Info
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Source
                  </label>
                  <p>{selectedCandidate.source || "-"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Applied Date
                  </label>
                  <p>{selectedCandidate.timestamp || "-"}</p>
                </div>

                <div className="col-span-3">
                  {" "}
                  {/* Use Full Width for Cert to allow long text */}
                  <label className="text-gray-500 text-xs uppercase font-bold flex gap-2">
                    <Award className="h-3 w-3" /> Certification
                  </label>
                  <p className="whitespace-pre-wrap text-sm">
                    {selectedCandidate.certification || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-gray-500 text-xs uppercase font-bold">
                    Status
                  </label>
                  <p>
                    <Badge variant="outline">{selectedCandidate.status}</Badge>
                    {selectedCandidate.rejectedRound && (
                      <span className="ml-2 text-red-500 text-xs">
                        Failed at: {selectedCandidate.rejectedRound}
                      </span>
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  {selectedCandidate.failureReason && (
                    <div>
                      <label className="text-gray-500 text-xs uppercase font-bold">
                        Failure Reason
                      </label>
                      <p className="text-red-600">
                        {selectedCandidate.failureReason}
                      </p>
                    </div>
                  )}
                </div>

                {selectedCandidate.matchReason && (
                  <div className="col-span-3 bg-gray-50 p-2 rounded border">
                    <label className="text-gray-500 text-xs uppercase font-bold">
                      AI Match Reason
                    </label>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedCandidate.matchReason.replace(
                        /(?<!^)(\s?-\s)/g,
                        "\n- ",
                      )}
                    </p>
                  </div>
                )}
                {selectedCandidate.notes && (
                  <div className="col-span-3 bg-yellow-50 p-2 rounded border border-yellow-100">
                    <label className="text-gray-500 text-xs uppercase font-bold">
                      Notes
                    </label>
                    <p className="text-gray-700">{selectedCandidate.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  {viewMode === "active" && (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectClick(selectedCandidate)}
                      >
                        {t.actionReject}
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={() => handleProceedToScreen(selectedCandidate)}
                      >
                        {t.actionProceed}
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedCandidate.cvLink && (
                    <Button variant="outline" asChild>
                      <a
                        href={selectedCandidate.cvLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Original CV
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rehire Modal */}
      <RehireModal
        isOpen={isRehireModalOpen}
        onClose={() => setIsRehireModalOpen(false)}
        candidate={rehireCandidate}
        availableJobCodes={uniqueJobCodes}
        onConfirm={confirmRehire}
      />

      {/* Decline Modal */}
      <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tKanban?.modalDeclineTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label>{tKanban?.labelForReason}</Label>
              <Select
                value={declineReasonType}
                onValueChange={setDeclineReasonType}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tKanban?.selectReasonPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {REASONS_EN.screening.map((reasonEn) => (
                    <SelectItem key={reasonEn} value={reasonEn}>
                      {tKanban?.reasons?.screening[
                        REASONS_EN.screening.indexOf(reasonEn)
                      ] || reasonEn}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Khác (Other)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(declineReasonType === "Other" || !declineReasonType) && (
              <Input
                placeholder={tKanban?.placeholderReason}
                value={declineReasonText}
                onChange={(e) => setDeclineReasonText(e.target.value)}
              />
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="potentialCv"
                className="h-4 w-4 rounded border-gray-300 text-[#B91C1C] focus:ring-[#B91C1C]"
                checked={isPotentialDecline}
                onChange={(e) => setIsPotentialDecline(e.target.checked)}
              />
              <Label
                htmlFor="potentialCv"
                className="font-medium cursor-pointer"
              >
                {lang === "vi"
                  ? "Đánh dấu là CV Tiềm năng"
                  : "Mark as Potential Candidate"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeclineModalOpen(false)}
            >
              {tKanban?.btnCancel}
            </Button>
            <Button variant="destructive" onClick={confirmDecline}>
              {tKanban?.btnConfirmDecline}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
