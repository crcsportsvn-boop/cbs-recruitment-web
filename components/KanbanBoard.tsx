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
import { MoreHorizontal, Search, EyeOff, Eye } from "lucide-react";
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
  log?: string; 
  // Dates for recovery logic
  offerDate?: string;
  interviewDate1?: string;
  interviewDate2?: string;
  testResult?: string;
  failureReason?: string;
}

interface KanbanBoardProps {
  lang: LangType;
}

// English Keys for Database Storage
const REASONS_EN = {
  screening: ["Not suitable for JD", "Insufficient Experience", "Duplicate CV", "Blacklist", "Other"],
  interview: ["Technical Mismatch", "Cultural Mismatch", "Failed English", "High Salary Expectation", "No Show", "Other"],
  offer: ["Declined Offer", "Accepted Other Job", "Salary Negotiation Failed", "Ghosted", "Other"]
};

export default function KanbanBoard({ lang }: KanbanBoardProps) {
  const t = dictionary[lang].kanban;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showRejected, setShowRejected] = useState(false);

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
    { id: "New", title: t.colNew, color: "bg-gray-50" },
    { id: "Screening", title: t.colScreening, color: "bg-[#FFF0F0]" },
    { id: "Interview", title: t.colInterview, color: "bg-gray-50" },
    { id: "Interview2", title: t.colInterview2, color: "bg-[#FFF0F0]" },
    { id: "Offer", title: t.colOffer, color: "bg-gray-50" },
    ...(showRejected ? [{ id: "Rejected", title: t.colRejected, color: "bg-[#FFF0F0]" }] : [])
  ];

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

    // 2. Direct Logic for Screening/Offer
    let updates: any = { status: targetStatus };
    const todayStr = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy

    if (targetStatus === "Offer") {
       updates.offerDate = todayStr;
    }
    
    // Test Result if moving New -> Screening
    if (targetStatus === "Screening" && candidate.status === "New") {
       updates.testResult = todayStr;
    }

    await updateCandidateAPI(candidate.id, updates);
  };

  const handleWithdraw = async (candidate: Candidate) => {
     // Determine previous status
     const status = candidate.status;
     let prev = "New";
     
     if (status === "Rejected") {
        // Smart Recovery Strategy: Find the latest completed stage
        if (candidate.offerDate) prev = "Offer";
        else if (candidate.interviewDate2) prev = "Interview2";
        else if (candidate.interviewDate1) prev = "Interview";
        else if (candidate.testResult) prev = "Screening";
        else prev = "New";
     } else {
        // Standard Step Back
        if (status === "Screening") prev = "New";
        else if (status === "Interview") prev = "Screening";
        else if (status === "Interview2") prev = "Interview";
        else if (status === "Offer") prev = "Interview2";
     }

     // Log logic
     const logMsg = `[Withdraw/Recover] from ${status} to ${prev} on ${new Date().toLocaleDateString('en-GB')}.`;
     const newLog = candidate.log ? candidate.log + "\n" + logMsg : logMsg;
     
     const updates: any = { 
       status: prev,
       log: newLog 
     };

     if (status === "Rejected") {
        updates.failureReason = ""; // Clear failure reason on recovery
     } else {
        // Clear dates ONLY if backing out from a valid stage (not recovering)
        if (status === "Offer") updates.offerDate = "";
        if (status === "Interview") updates.interviewDate1 = ""; 
        if (status === "Interview2") updates.interviewDate2 = ""; 
        if (status === "Screening") updates.testResult = ""; 
     }

     await updateCandidateAPI(candidate.id, updates);
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
    } else {
       // If standard reason, ensure we are using the English value (already set by Select value)
       // The UI logic below ensures value is EN
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
    const dateObj = new Date(interviewDetails.date);
    const dateStr = dateObj.toLocaleDateString('en-GB'); 
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
    // 1. Hide Rejected candidates if Toggle is OFF
    if (!showRejected && c.status === "Rejected") return false;

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
        const parts = c.timestamp.split(" ")[0].split("/");
        if (parts.length === 3) {
          const cDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          
          if (dateFrom) {
            const dStart = new Date(dateFrom); 
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

  // Determine current decline reasons
  const currentStage = selectedCandidate?.status || "New";
  let reasonKeys = REASONS_EN.screening;
  let reasonLabels = t.reasons.screening;
  
  if (currentStage === "Interview" || currentStage === "Interview2") {
     reasonKeys = REASONS_EN.interview;
     reasonLabels = t.reasons.interview;
  }
  if (currentStage === "Offer") {
     reasonKeys = REASONS_EN.offer;
     reasonLabels = t.reasons.offer;
  }


  return (
    <div className="flex flex-col h-[calc(100vh-220px)] border rounded-lg bg-gray-50 overflow-hidden relative shadow-sm">
        
        {/* Sticky Filter Bar */}
        <div className="bg-white p-3 border-b flex flex-wrap gap-3 items-center shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <Search className="w-4 h-4 text-gray-500" />
            <Input 
              placeholder={t.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white h-9 text-sm"
            />
          </div>
          
          {/* Score Filter */}
          <div className="w-[140px]">
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="bg-white h-9 text-sm">
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
          <div className="flex items-center gap-2 bg-white px-2 rounded border h-9">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">From:</span>
            <Input 
              type="date" 
              className="h-7 w-[110px] text-xs border-0 focus-visible:ring-0 p-1"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">To:</span>
            <Input 
              type="date" 
              className="h-7 w-[110px] text-xs border-0 focus-visible:ring-0 p-1"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Rejected Toggle */}
          {/* Rejected Toggle */}
          <Button 
            className="gap-2 h-9 bg-[#B91C1C] hover:bg-[#991b1b] text-white"
            size="sm"
            onClick={() => setShowRejected(!showRejected)}
          >
            {showRejected ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
            {t.toggleRejected || "Rejected"}
          </Button>

        </div>

        {/* Board Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-3" style={{ transform: "rotateX(180deg)" }}>
           <div className="flex gap-3 h-full min-w-max" style={{ transform: "rotateX(180deg)" }}>
            {COLUMNS.map((col) => (
              <div key={col.id} className={`w-[250px] flex flex-col rounded-lg border border-gray-200/60 shadow-sm ${col.color}`}>
                {/* Column Header */}
                <div className="flex justify-between items-center p-3 border-b bg-white/60 rounded-t-lg backdrop-blur-sm sticky top-0">
                  <h3 className="font-bold text-sm text-gray-700 truncate" title={col.title}>{col.title}</h3>
                  <Badge variant="secondary" className="bg-white/80 h-5 text-[10px] px-2 shadow-sm">
                    {filteredCandidates.filter(c => (c.status || "New") === col.id).length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {filteredCandidates
                    .filter(c => (c.status || "New") === col.id)
                    .map((c) => (
                      <Card key={c.id} className="hover:shadow-md transition-all duration-200 group bg-white border-l-4" style={{ borderLeftColor: parseInt(c.matchScore) >= 8 ? '#22c55e' : parseInt(c.matchScore) >= 5 ? '#eab308' : '#6b7280' }}>
                        <CardContent className="p-3 space-y-2">
                           <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-sm text-[#B91C1C] leading-snug" title={c.fullName}>{c.fullName}</h4>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-6 w-6 p-0 -mt-1 -mr-2 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
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
                                  
                                  {/* Withdraw is available if not New */}
                                  {col.id !== "New" && (
                                     <>
                                       <DropdownMenuSeparator />
                                       <DropdownMenuItem onClick={() => handleWithdraw(c)}>
                                         {t.actionWithdraw}
                                       </DropdownMenuItem>
                                     </>
                                  )}
                                  
                                  {/* Allow Re-withdraw if Rejected */}
                                  {col.id === "Rejected" && (
                                     <>
                                       <DropdownMenuSeparator />
                                       <DropdownMenuItem onClick={() => handleWithdraw(c)}>
                                         Recover to Previous
                                       </DropdownMenuItem>
                                     </>
                                  )}

                                  <DropdownMenuSeparator />
                                  {col.id !== "Rejected" && (
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeclineClick(c)}>
                                      {t.actionDecline}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                           </div>

                           <div className="space-y-1">
                               <p className="text-[11px] text-gray-600 font-medium">{c.jobCode}</p>
                               <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 block w-fit max-w-full whitespace-normal break-words" title={c.positionRaw}>
                               {c.positionRaw}
                               </span>
                           </div>
                           
                           <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
                             <div className="text-[9px] text-gray-400">
                               {c.timestamp ? c.timestamp.split(" ")[0] : ""}
                             </div>
                             
                             {(col.id === "New") && (
                               <Badge className={`h-5 text-[10px] px-1.5 ${
                                  parseInt(c.matchScore) >= 8 ? "bg-green-500" : 
                                  parseInt(c.matchScore) >= 5 ? "bg-yellow-500" : "bg-gray-500"
                                }`}>
                                  Score: {c.matchScore}
                                </Badge>
                             )}
                           </div>

                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
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
                    <SelectValue placeholder={t.selectReasonPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonKeys.map((reasonEn, idx) => (
                       <SelectItem key={reasonEn} value={reasonEn}>
                         {reasonLabels[idx] || reasonEn}
                       </SelectItem>
                    ))}
                    <SelectItem value="Other">Khác (Other)</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             
             {(declineReasonType === "Other" || !declineReasonType) && (
                 <Input 
                   placeholder={t.placeholderReason}
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
      
      {/* Interview Modal */}
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
