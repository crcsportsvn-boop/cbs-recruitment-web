"use client";

import { useState, useEffect } from "react";
import { dictionary, LangType } from "@/lib/dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Eye, EyeOff, Settings, Check, MoreHorizontal, User, Calendar, MapPin, GraduationCap, ChevronLeft, ChevronRight, Briefcase, FileText, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
}

interface DatapoolTableProps {
  lang: LangType;
  user?: any;
}

const REASONS_EN = {
  screening: ["Not suitable for JD", "Insufficient Experience", "Duplicate CV", "Blacklist", "Other"],
};

export default function DatapoolTable({ lang, user }: DatapoolTableProps) {
  const t = dictionary[lang].datapoolTable;
  const tKanban = dictionary[lang].kanban; 
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [showRejected, setShowRejected] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    received: true,
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
    actions: true
  });

  // Actions / Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  
  // Decline Logic
  const [declineReasonType, setDeclineReasonType] = useState<string>("");
  const [declineReasonText, setDeclineReasonText] = useState("");
  const [isPotentialDecline, setIsPotentialDecline] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      const formatted = data.candidates.map((c: any) => ({
        id: c.id,
        name: c.fullName,
        position: c.positionId ? `${c.positionRaw} (${c.positionId})` : c.positionRaw,
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
            body: JSON.stringify({ id, updates })
        });
        
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "API returned error");
        }

        setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (error) {
        console.error("Update failed", error);
        alert(`Failed to update candidate: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Actions
  const handleProceedToScreen = async (c: Candidate) => {
     const todayStr = new Date().toLocaleDateString('en-GB'); 
     await updateCandidateAPI(c.id, {
         status: "Screening",
         testResult: todayStr
     });
     if (selectedCandidate?.id === c.id) setIsDeclineModalOpen(false); // Close modals if open
  };

  const handleWithdrawToScreen = async (c: Candidate) => {
      await updateCandidateAPI(c.id, {
          status: "Screening",
          failureReason: "",
          rejectedRound: "" 
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

     await updateCandidateAPI(candidateToReject.id, {
         status: "Rejected",
         failureReason: finalReason,
         isPotential: isPotentialDecline, 
         rejectedRound: rejectedRound
     });
     setIsDeclineModalOpen(false);
     setCandidateToReject(null);
  };

  // Filter Logic
  const filteredCandidates = candidates.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchLower) ||
      c.position?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchLower);

    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "high" && c.matchScore >= 8) ||
      (scoreFilter === "medium" && c.matchScore >= 5 && c.matchScore < 8) ||
      (scoreFilter === "low" && c.matchScore < 5);

    const isRejected = c.status === "Rejected";
    const isNew = c.status === "New";
    const matchesMode = showRejected ? isRejected : isNew;

    return matchesSearch && matchesScore && matchesMode;
  });

  // Navigation Logic for Modal
  const currentIndex = selectedCandidate ? filteredCandidates.findIndex(c => c.id === selectedCandidate.id) : -1;
  const hasNext = currentIndex !== -1 && currentIndex < filteredCandidates.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) setSelectedCandidate(filteredCandidates[currentIndex + 1]);
  }
  const handlePrev = () => {
    if (hasPrev) setSelectedCandidate(filteredCandidates[currentIndex - 1]);
  }

  // Keyboard navigation
  useEffect(() => {
    if (!selectedCandidate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") handleNext();
        if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCandidate, currentIndex, filteredCandidates]); // Depend on currentIndex/filteredCandidates to ensure handleNext/Prev work correctly

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
          <Button 
            className={`gap-2 min-w-[140px] transition-colors ${showRejected ? 'bg-[#B91C1C] hover:bg-[#991b1b] text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}
            onClick={() => setShowRejected(!showRejected)}
          >
             {showRejected ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
             {showRejected ? t.btnHideRejected : t.btnShowRejected}
          </Button>

          {/* Column Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="outline" className="ml-2 gap-2" title={t.configureColumns}>
                  <Settings className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem checked={visibleColumns.potential} onCheckedChange={(c) => setVisibleColumns(p => ({...p, potential: !!c}))}>
                 {t.colPotential}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.rejectedRound} onCheckedChange={(c) => setVisibleColumns(p => ({...p, rejectedRound: !!c}))}>
                 {t.colRejectedRound}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.summary} onCheckedChange={(c) => setVisibleColumns(p => ({...p, summary: !!c}))}>
                 {t.colSummary}
              </DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem checked={visibleColumns.education} onCheckedChange={(c) => setVisibleColumns(p => ({...p, education: !!c}))}>
                 {t.colEducation}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.matchReason} onCheckedChange={(c) => setVisibleColumns(p => ({...p, matchReason: !!c}))}>
                 {t.colMatchReason}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.score} onCheckedChange={(c) => setVisibleColumns(p => ({...p, score: !!c}))}>
                 {t.colScore}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.source} onCheckedChange={(c) => setVisibleColumns(p => ({...p, source: !!c}))}>
                 {t.colSource}
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
              {visibleColumns.received && <TableHead className="w-[100px]">{t.colReceived}</TableHead>}
              {visibleColumns.candidate && <TableHead>{t.colCandidate}</TableHead>}
              {visibleColumns.position && <TableHead>{t.colPosition}</TableHead>}
              {visibleColumns.score && <TableHead className="text-center">{t.colScore}</TableHead>}
              {visibleColumns.source && <TableHead>{t.colSource}</TableHead>}
              {visibleColumns.status && <TableHead>{t.colStatus}</TableHead>}
              
              {visibleColumns.education && <TableHead>{t.colEducation}</TableHead>}
              {visibleColumns.matchReason && <TableHead>{t.colMatchReason}</TableHead>}

              {(showRejected && visibleColumns.rejectedRound) && <TableHead>{t.colRejectedRound}</TableHead>}
              {(showRejected && visibleColumns.potential) && <TableHead className="text-center">{t.colPotential}</TableHead>}

              {visibleColumns.summary && <TableHead className="w-[200px]">{t.colSummary}</TableHead>}
              {visibleColumns.actions && <TableHead className="text-right">{t.colActions}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredCandidates.length === 0 ? (
               <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-gray-500">
                   {showRejected ? "No rejected candidates." : "No new candidates."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                  {visibleColumns.received && <TableCell className="font-medium text-xs text-gray-500">
                    {c.timestamp ? c.timestamp.split(" ")[0] : "-"}
                  </TableCell>}
                  
                  {visibleColumns.candidate && <TableCell>
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </TableCell>}

                  {visibleColumns.position && <TableCell className="text-sm">
                    {c.position}
                  </TableCell>}

                  {visibleColumns.score && <TableCell className="text-center">
                     <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        c.matchScore >= 8 ? "bg-green-100 text-green-700" :
                        c.matchScore >= 5 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                     }`}>
                        {c.matchScore}
                     </span>
                  </TableCell>}

                   {visibleColumns.source && <TableCell className="text-sm text-gray-600">{c.source}</TableCell>}
                   
                   {visibleColumns.status && <TableCell>
                      <Badge variant="outline" className={showRejected ? "border-red-200 text-red-700 bg-red-50" : "border-blue-200 text-blue-700 bg-blue-50"}>
                        {c.status}
                      </Badge>
                   </TableCell>}

                   {visibleColumns.education && <TableCell className="text-sm text-gray-600">{c.education || c.degree || "-"}</TableCell>}
                   {visibleColumns.matchReason && <TableCell className="text-xs text-gray-500 max-w-[150px] truncate" title={c.matchReason}>{c.matchReason || "-"}</TableCell>}

                   {(showRejected && visibleColumns.rejectedRound) && <TableCell className="text-sm text-gray-600">
                      {c.rejectedRound || "-"}
                   </TableCell>}

                   {(showRejected && visibleColumns.potential) && <TableCell className="text-center">
                      {c.isPotential && <Check className="h-5 w-5 text-yellow-500 mx-auto" />}
                   </TableCell>}

                   {visibleColumns.summary && <TableCell className="text-xs text-gray-500 max-w-[200px] truncate" title={c.summary}>
                      {c.summary}
                   </TableCell>}

                   {visibleColumns.actions && <TableCell className="text-right">
                       <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setSelectedCandidate(c)}>
                                      {tKanban?.actionDetail}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => window.open(c.cvLink, "_blank")}>
                                      {t.viewCV}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  
                                  {showRejected ? (
                                     <DropdownMenuItem onClick={() => handleWithdrawToScreen(c)}>
                                         {t.actionWithdraw}
                                     </DropdownMenuItem>
                                  ) : (
                                     <>
                                       <DropdownMenuItem onClick={() => handleProceedToScreen(c)}>
                                           {t.actionProceed}
                                       </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => handleRejectClick(c)} className="text-red-600 focus:text-red-600">
                                           {t.actionReject}
                                       </DropdownMenuItem>
                                     </>
                                  )}
                              </DropdownMenuContent>
                           </DropdownMenu>
                       </div>
                   </TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

       {/* Candidate Details Modal */}
       <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
             <div className="flex items-center justify-between">
                <DialogTitle>Candidate Profile</DialogTitle>
                <div className="flex gap-2 pr-8">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev} disabled={!hasPrev}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext} disabled={!hasNext}>
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
                          <User className="h-8 w-8 text-gray-400"/>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {selectedCandidate.name}
                            {selectedCandidate.isPotential && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Potential</Badge>}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="font-semibold">{selectedCandidate.position}</span>
                            <span>•</span>
                            <span>{selectedCandidate.email}</span>
                            <span>•</span>
                            <span>{selectedCandidate.phone}</span>
                        </p>
                      </div>
                  </div>
                  <div className="text-right">
                     <div className={`text-3xl font-bold ${
                         selectedCandidate.matchScore >= 8 ? 'text-green-600' : 
                         selectedCandidate.matchScore >= 5 ? 'text-yellow-600' : 'text-red-600'
                     }`}>
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
               <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                   
                   <div className="col-span-2 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2">
                      <User className="h-4 w-4"/> Personal Info
                   </div>
                   
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">Full Name</label>
                       <p>{selectedCandidate.name}</p>
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">Gender / YOB</label>
                       <p>{selectedCandidate.gender || "-"} / {selectedCandidate.yob || "-"}</p>
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold flex items-center gap-1"><MapPin className="h-3 w-3"/> Location</label>
                       <p>{selectedCandidate.location || "-"}</p>
                   </div>
                   
                   <div className="col-span-2 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2 mt-4">
                      <Briefcase className="h-4 w-4"/> Experience & Skills
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">Current Function</label>
                       <p>{selectedCandidate.jobFunction || "-"}</p>
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">Skills</label>
                       <p className="whitespace-pre-wrap text-sm">{selectedCandidate.skills || "-"}</p>
                   </div>
                   <div className="col-span-2">
                       <label className="text-gray-500 text-xs uppercase font-bold">Work History</label>
                       <p className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border mt-1">
                         {selectedCandidate.workHistory 
                            ? selectedCandidate.workHistory.replace(/\\n/g, "\n") 
                            : "-"}
                       </p>
                   </div>

                   <div className="col-span-2 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2 mt-4">
                      <GraduationCap className="h-4 w-4"/> Education
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">School</label>
                       <p>{selectedCandidate.education || "-"}</p>
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">Degree</label>
                       <p>{selectedCandidate.degree || "-"}</p>
                   </div>

                    <div className="col-span-2 border-b pb-2 mb-2 font-semibold text-gray-800 flex items-center gap-2 mt-4">
                      <Calendar className="h-4 w-4"/> Application Info
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">Source</label>
                       <p>{selectedCandidate.source || "-"}</p>
                   </div>
                   <div>
                       <label className="text-gray-500 text-xs uppercase font-bold">Applied Date</label>
                       <p>{selectedCandidate.timestamp || "-"}</p>
                   </div>
                   <div>
                        <label className="text-gray-500 text-xs uppercase font-bold">Status</label>
                        <p>
                            <Badge variant="outline">{selectedCandidate.status}</Badge>
                            {selectedCandidate.rejectedRound && <span className="ml-2 text-red-500 text-xs">Failed at: {selectedCandidate.rejectedRound}</span>}
                        </p>
                   </div>
                   {selectedCandidate.failureReason && (
                        <div>
                            <label className="text-gray-500 text-xs uppercase font-bold">Failure Reason</label>
                            <p className="text-red-600">{selectedCandidate.failureReason}</p>
                        </div>
                   )}
                   {selectedCandidate.matchReason && (
                       <div className="col-span-2 bg-gray-50 p-2 rounded border">
                           <label className="text-gray-500 text-xs uppercase font-bold">AI Match Reason</label>
                           <p className="text-gray-700">{selectedCandidate.matchReason}</p>
                       </div>
                   )}
                   {selectedCandidate.notes && (
                       <div className="col-span-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                           <label className="text-gray-500 text-xs uppercase font-bold">Notes</label>
                           <p className="text-gray-700">{selectedCandidate.notes}</p>
                       </div>
                   )}
               </div>

               {/* Action Footer */}
               <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex gap-2">
                     {!showRejected && (
                         <>
                            <Button variant="destructive" size="sm" onClick={() => handleRejectClick(selectedCandidate)}>
                                {t.actionReject}
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleProceedToScreen(selectedCandidate)}>
                                {t.actionProceed}
                            </Button>
                         </>
                     )}
                  </div>
                  <div className="flex gap-2">
                     {selectedCandidate.cvLink && (
                        <Button variant="outline" asChild>
                          <a href={selectedCandidate.cvLink} target="_blank" rel="noopener noreferrer">Original CV</a>
                        </Button>
                     )}
                     <Button variant="ghost" onClick={() => setSelectedCandidate(null)}>Close</Button>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Decline Modal */}
      <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>{tKanban?.modalDeclineTitle}</DialogTitle>
           </DialogHeader>
           <div className="py-2 space-y-4">
             <div className="space-y-2">
                <Label>{tKanban?.labelForReason}</Label>
                <Select value={declineReasonType} onValueChange={setDeclineReasonType}>
                  <SelectTrigger>
                    <SelectValue placeholder={tKanban?.selectReasonPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS_EN.screening.map((reasonEn) => (
                       <SelectItem key={reasonEn} value={reasonEn}>
                         {tKanban?.reasons?.screening[REASONS_EN.screening.indexOf(reasonEn)] || reasonEn}
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
                <Label htmlFor="potentialCv" className="font-medium cursor-pointer">
                   {lang === 'vi' ? "Đánh dấu là CV Tiềm năng" : "Mark as Potential Candidate"}
                </Label>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDeclineModalOpen(false)}>{tKanban?.btnCancel}</Button>
             <Button variant="destructive" onClick={confirmDecline}>{tKanban?.btnConfirmDecline}</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
