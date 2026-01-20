"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";
import { dictionary, LangType } from "@/lib/dictionary";

interface Candidate {
  id: number;
  fullName: string;
  email: string;
  positionRaw: string;
  matchScore: string;
  status: string; // New, Screening, Interview, Interview2, Offer, Rejected
  cvLink: string;
  matchReason: string;
  jobCode?: string;
  positionId?: string;
  timestamp?: string;
}

interface KanbanBoardProps {
  lang: LangType;
}

export default function KanbanBoard({ lang }: KanbanBoardProps) {
  const t = dictionary[lang].kanban;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Data for Modals
  const [interviewDetails, setInterviewDetails] = useState({
    date: "", 
    time: "",
    venue: "HCM Office – Eximland Building, 163 Phan Dang Luu, Ward 1, Phu Nhuan District, HCMC",
    interviewer: ""
  });
  const [interviewRound, setInterviewRound] = useState<1 | 2>(1); // 1 or 2

  const [declineReasonType, setDeclineReasonType] = useState<string>("");
  const [declineReasonText, setDeclineReasonText] = useState("");

  const COLUMNS = [
    { id: "New", title: t.colNew, color: "bg-blue-50" },
    { id: "Screening", title: t.colScreening, color: "bg-yellow-50" },
    { id: "Interview", title: t.colInterview, color: "bg-purple-50" },
    { id: "Interview2", title: t.colInterview2, color: "bg-purple-100" }, // New Column
    { id: "Offer", title: t.colOffer, color: "bg-green-50" },
  ];

  const REASONS_MAP: Record<string, string[]> = {
    "New": t.reasons.screening,
    "Screening": t.reasons.screening,
    "Interview": t.reasons.interview,
    "Interview2": t.reasons.interview,
    "Offer": t.reasons.offer
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      if (data.candidates) {
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error("Failed to fetch candidates", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const moveStatus = async (candidate: Candidate, targetStatus: string, round?: 1 | 2) => {
    // 1. Interview Logic
    if (targetStatus === "Interview" || targetStatus === "Interview2") {
      setSelectedCandidate(candidate);
      setInterviewRound(round || 1);
      setIsInterviewModalOpen(true);
      return; 
    }

    // 2. Direct Logic for Screening/Offer/Withdraw
    let updates: any = { status: targetStatus };
    const todayStr = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy

    if (targetStatus === "Offer") {
       updates.offerDate = todayStr;
    }
    // Return to previous logic (Withdraw)
    // Map current -> previous
    const PREV_MAP: Record<string, string> = {
      "Screening": "New",
      "Interview": "Screening",
      "Interview2": "Interview",
      "Offer": "Interview2",
      "Rejected": "New" // Reset if withdrawn from rejected? Actually mainly for active flow.
    };
    
    // If it's a "Withdraw" action (special case handled by caller usually passing the specific target)
    // Here we assume targetStatus IS the intended status.

    await updateCandidateAPI(candidate.id, updates);
  };

  const handleWithdraw = async (candidate: Candidate) => {
     // Determine previous status
     const status = candidate.status;
     let prev = "New";
     if (status === "Screening") prev = "New";
     if (status === "Interview") prev = "Screening";
     if (status === "Interview2") prev = "Interview";
     if (status === "Offer") prev = "Interview2";
     
     await moveStatus(candidate, prev);
  };

  const handleDeclineClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDeclineReasonType("");
    setDeclineReasonText("");
    setIsDeclineModalOpen(true);
  };

  const confirmDecline = async () => {
    if (!selectedCandidate) return;
    
    // Combine Reason
    let finalReason = declineReasonType;
    if (declineReasonType === "Other" || !declineReasonType) {
        finalReason = declineReasonText;
    }

    await updateCandidateAPI(selectedCandidate.id, {
      status: "Rejected",
      failureReason: finalReason
    });
    setIsDeclineModalOpen(false);
  };

  const confirmInterview = async () => {
    if (!selectedCandidate) return;
    
    // Outlook Logic...
    const subject = `Interview Invitation (Round ${interviewRound}) - ${selectedCandidate.positionRaw}`;
    const body = `Dear Mr./Ms. ${selectedCandidate.fullName},\n\nWe are pleased to invite you to Round ${interviewRound} interview.\n\nTime: ${interviewDetails.time} - ${interviewDetails.date}\nVenue: ${interviewDetails.venue}\nInterviewer: ${interviewDetails.interviewer}\n\nBest regards,\nCBS HR Team`; 
    
    const mailtoLink = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");

    // Update API
    // Format date dd/mm/yyyy
    const dateObj = new Date(interviewDetails.date);
    const dateStr = dateObj.toLocaleDateString('en-GB'); // Standard format
    const timeStr = interviewDetails.time;
    const fullDate = `${dateStr} ${timeStr}`;

    const updates: any = {
      status: interviewRound === 1 ? "Interview" : "Interview2",
      interviewer: interviewDetails.interviewer
    };
    
    if (interviewRound === 1) updates.interviewDate1 = fullDate;
    else updates.interviewDate2 = fullDate;

    await updateCandidateAPI(selectedCandidate.id, updates);

    setIsInterviewModalOpen(false);
  };

  const updateCandidateAPI = async (id: number, updates: any) => {
    // Optimistic Update
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));

    try {
      await fetch("/api/candidates/update", {
        method: "POST",
        body: JSON.stringify({ id, updates })
      });
    } catch (error) {
      console.error("Update failed", error);
      fetchCandidates();
    }
  };

  // --- FILTERING ---
  const filteredCandidates = candidates.filter(c => {
    // 1. Hide Rejected candidates from board
    if (c.status === "Rejected") return false;

    // 2. Search Term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.fullName?.toLowerCase().includes(searchLower) ||
      c.jobCode?.toLowerCase().includes(searchLower) ||
      c.positionId?.toLowerCase().includes(searchLower) ||
      c.positionRaw?.toLowerCase().includes(searchLower);

    // 3. Score Filter
    let matchesScore = true;
    if (scoreFilter !== "all") {
       const score = parseInt(c.matchScore) || 0;
       if (scoreFilter === "high") matchesScore = score >= 8;
       if (scoreFilter === "medium") matchesScore = score >= 5 && score < 8;
       if (scoreFilter === "low") matchesScore = score < 5;
    }

    // 4. Date Filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      if (!c.timestamp) {
        matchesDate = false;
      } else {
        // Parse "dd/mm/yyyy hh:mm:ss"
        const parts = c.timestamp.split(" ")[0].split("/");
        // Assumes dd/mm/yyyy format from Sheet
        if (parts.length === 3) {
          const cDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          
          if (dateFrom) {
            const dStart = new Date(dateFrom); // yyyy-mm-dd
            // Compare timestamps (ignoring time for start date? strictly >=)
            // Reset hours for comparison to be inclusive
            dStart.setHours(0,0,0,0);
            cDate.setHours(0,0,0,0);
            if (cDate < dStart) matchesDate = false;
          }
          
          if (dateTo && matchesDate) {
             const dEnd = new Date(dateTo);
             dEnd.setHours(0,0,0,0);
             if (cDate > dEnd) matchesDate = false;
          }
        }
      }
    }

    return matchesSearch && matchesScore && matchesDate;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col relative w-full">
      <div className="flex-1 flex flex-col overflow-hidden relative border rounded-lg bg-gray-50 h-[calc(100vh-250px)]">
        
        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-20 bg-white p-2 border-b flex flex-wrap gap-2 items-center shadow-sm">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <Search className="w-4 h-4 text-gray-500" />
            <Input 
              placeholder={t.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white h-8 text-sm"
            />
          </div>
          
          {/* Score Filter */}
          <div className="w-[140px]">
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="bg-white h-8 text-sm">
                <SelectValue placeholder={t.filterScore} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filterAll}</SelectItem>
                <SelectItem value="high">High Match ({">"}= 8)</SelectItem>
                <SelectItem value="medium">Medium (5-7)</SelectItem>
                <SelectItem value="low">Low (&lt; 5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">From:</span>
            <Input 
              type="date" 
              className="h-8 w-[130px] text-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-xs text-gray-500">To:</span>
            <Input 
              type="date" 
              className="h-8 w-[130px] text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Board Columns - Horizontal Scroll if needed, but compacted */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-2">
           <div className="flex gap-2 h-full min-w-full">
            {COLUMNS.map((col) => (
              <div key={col.id} className={`flex-1 min-w-[200px] flex flex-col rounded-lg border border-gray-200 ${col.color}`}>
                {/* Column Header */}
                <div className="flex justify-between items-center p-2 border-b bg-white/50 rounded-t-lg">
                  <h3 className="font-bold text-xs text-gray-700 truncate" title={col.title}>{col.title}</h3>
                  <Badge variant="secondary" className="bg-white h-5 text-[10px] px-1">
                    {filteredCandidates.filter(c => (c.status || "New") === col.id).length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {filteredCandidates
                    .filter(c => (c.status || "New") === col.id)
                    .map((c) => (
                      <Card key={c.id} className="hover:shadow-md transition-shadow relative group bg-white">
                        <CardContent className="p-2 space-y-1">
                           <div className="absolute top-1 right-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-gray-100 rounded-full">
                                    <MoreHorizontal className="h-3 w-3 text-gray-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => window.open(c.cvLink, "_blank")}>
                                    {t.actionDetail} (CV)
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  
                                  {col.id === "New" && (
                                    <DropdownMenuItem onClick={() => moveStatus(c, "Screening")}>
                                      Pass Screening
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {col.id === "Screening" && (
                                    <DropdownMenuItem onClick={() => moveStatus(c, "Interview", 1)}>
                                      Schedule Interview V1
                                    </DropdownMenuItem>
                                  )}

                                  {col.id === "Interview" && (
                                    <>
                                      <DropdownMenuItem onClick={() => moveStatus(c, "Interview2", 2)}>
                                        Schedule Interview V2
                                      </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => moveStatus(c, "Offer")}>
                                        Make Offer
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {col.id === "Interview2" && (
                                    <DropdownMenuItem onClick={() => moveStatus(c, "Offer")}>
                                      Make Offer
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {col.id !== "New" && (
                                     <>
                                       <DropdownMenuSeparator />
                                       <DropdownMenuItem onClick={() => handleWithdraw(c)}>
                                         {t.actionWithdraw}
                                       </DropdownMenuItem>
                                     </>
                                  )}

                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeclineClick(c)}>
                                    {t.actionDecline}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                           </div>

                          <div className="pr-5">
                            <h4 className="font-semibold text-xs text-[#EE2E24] truncate" title={c.fullName}>{c.fullName}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">{c.jobCode}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                             <span className="text-[10px] bg-gray-100 px-1 rounded truncate max-w-[80px]" title={c.positionRaw}>
                               {c.positionRaw}
                             </span>
                             <Badge className={`h-4 text-[10px] px-1 ${
                                parseInt(c.matchScore) >= 8 ? "bg-green-500" : 
                                parseInt(c.matchScore) >= 5 ? "bg-yellow-500" : "bg-gray-500"
                              }`}>
                                {c.matchScore}
                              </Badge>
                          </div>
                          {/* Timestamp Display */}
                          <div className="text-[9px] text-gray-400 text-right">
                            {c.timestamp ? c.timestamp.split(" ")[0] : ""}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
           </div>
        </div>
      </div>

      {/* Decline Modal */}
      <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>{t.modalDeclineTitle}</DialogTitle>
           </DialogHeader>
           <div className="py-2 space-y-4">
             <div className="space-y-2">
                <Label>{t.labelForReason}</Label>
                <Select value={declineReasonType} onValueChange={setDeclineReasonType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(REASONS_MAP[selectedCandidate?.status || "New"] || t.reasons.screening).map((reason) => (
                       <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                    <SelectItem value="Other">Khác (Other)</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             
             {(declineReasonType === "Other" || !declineReasonType) && (
                 <Input 
                   placeholder={t.placeholderReason || "Nhập lý do chi tiết..."}
                   value={declineReasonText}
                   onChange={(e) => setDeclineReasonText(e.target.value)}
                 />
             )}
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDeclineModalOpen(false)}>{t.btnCancel}</Button>
             <Button variant="destructive" onClick={confirmDecline}>{t.btnConfirmDecline}</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Interview Modal (Reused) */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.modalInterviewTitle} (V{interviewRound})</DialogTitle>
          </DialogHeader>
           <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ngày</Label>
                <Input type="date" className="col-span-3" value={interviewDetails.date} onChange={e => setInterviewDetails({...interviewDetails, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Giờ</Label>
                <Input type="time" className="col-span-3" value={interviewDetails.time} onChange={e => setInterviewDetails({...interviewDetails, time: e.target.value})} />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Địa điểm</Label>
                <Input className="col-span-3" value={interviewDetails.venue} onChange={e => setInterviewDetails({...interviewDetails, venue: e.target.value})} />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">PV Với</Label>
                <Input className="col-span-3" placeholder="Interviewer Name" value={interviewDetails.interviewer} onChange={e => setInterviewDetails({...interviewDetails, interviewer: e.target.value})} />
              </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInterviewModalOpen(false)}>{t.btnCancel}</Button>
            <Button onClick={confirmInterview} className="bg-[#EE2E24] hover:bg-[#D5261C]">{t.btnSendInvite}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
