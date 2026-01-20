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
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { dictionary, LangType } from "@/lib/dictionary";

interface Candidate {
  id: number;
  fullName: string;
  email: string;
  positionRaw: string;
  matchScore: string;
  status: string; // New, Screening, Interview, Offer, Rejected
  cvLink: string;
  matchReason: string;
  jobCode?: string;
  positionId?: string;
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
  const [declineReason, setDeclineReason] = useState("");

  const COLUMNS = [
    { id: "New", title: t.colNew, color: "bg-blue-50" },
    { id: "Screening", title: t.colScreening, color: "bg-yellow-50" },
    { id: "Interview", title: t.colInterview, color: "bg-purple-50" },
    { id: "Offer", title: t.colOffer, color: "bg-green-50" },
    // Rejected hidden by default, or separate view
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

  const moveStatus = async (candidate: Candidate, targetStatus: string) => {
    // 1. Interactive Logic
    if (targetStatus === "Interview") {
      setSelectedCandidate(candidate);
      setIsInterviewModalOpen(true);
      return; 
    }

    // 2. Direct Logic for Screening/Offer
    let updates: any = { status: targetStatus };
    if (targetStatus === "Offer") {
       updates.offerDate = new Date().toLocaleDateString('en-GB');
    }

    await updateCandidateAPI(candidate.id, updates);
  };

  const handleDeclineClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDeclineModalOpen(true);
  };

  const confirmDecline = async () => {
    if (!selectedCandidate) return;
    await updateCandidateAPI(selectedCandidate.id, {
      status: "Rejected",
      failureReason: declineReason
    });
    setIsDeclineModalOpen(false);
    setDeclineReason("");
  };

  const confirmInterview = async () => {
    if (!selectedCandidate) return;
    
    // Outlook Logic...
    const subject = `Interview Invitation - ${selectedCandidate.positionRaw}`;
    const body = `Dear Mr./Ms. ${selectedCandidate.fullName},\n\nGreetings from CBS VN.\n\nThank you for your interest in a possible job opportunity with us. After exploring your qualifications, we are pleased to invite you to join an offline interview with the following details:\n\nApplied Position: ${selectedCandidate.positionRaw}\n\nDate & time: ${interviewDetails.date} at ${interviewDetails.time}\n\nVenue: ${interviewDetails.venue}\n\nMeet with: ${interviewDetails.interviewer}\n\nHR Data Analyst\n\nFriday, July 11th, 2025, at 8:00 AM\n\nHCM Office – Eximland Building, 163 Phan Dang Luu, Ward 1, Phu Nhuan District, HCMC\n\nMs. Van Le – Head of HR – CBS VN\n\n \n\nPlease confirm your attendance by replying to this email. Should you need any assistance, do not hesitate to contact me via 0906627301 (Ms. Nga).\n\n \nThanks and best regards!`; // Template shortened for brevity
    
    const mailtoLink = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");

    // Update API
    const fullDate = `${interviewDetails.date} ${interviewDetails.time}`;
    await updateCandidateAPI(selectedCandidate.id, {
      status: "Interview",
      interviewDate1: fullDate,
      interviewer: interviewDetails.interviewer
    });

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

    return matchesSearch && matchesScore;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="h-full flex flex-col">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-4 p-2 bg-gray-50 rounded-md border">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-500" />
          <Input 
            placeholder={t.searchPlaceholder} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />
        </div>
        <div className="w-[180px]">
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder={t.filterScore} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filterAll}</SelectItem>
              <SelectItem value="high">High Match ({">"}= 8)</SelectItem>
              <SelectItem value="medium">Medium (5-7)</SelectItem>
              <SelectItem value="low">Low ({htmlLc"{"} 5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto min-h-[600px] pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className={`flex-shrink-0 w-80 rounded-lg p-3 ${col.color} border border-gray-200 flex flex-col`}>
             <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-gray-700">{col.title}</h3>
              <Badge variant="secondary" className="bg-white">
                {filteredCandidates.filter(c => (c.status || "New") === col.id).length}
              </Badge>
            </div>

            <div className="space-y-3">
              {filteredCandidates
                .filter(c => (c.status || "New") === col.id)
                .map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow relative group">
                    <CardContent className="p-3 space-y-2">
                       <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full">
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
                                <DropdownMenuItem onClick={() => moveStatus(c, "Interview")}>
                                  Schedule Interview
                                </DropdownMenuItem>
                              )}

                              {col.id === "Interview" && (
                                <DropdownMenuItem onClick={() => moveStatus(c, "Offer")}>
                                  Make Offer
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeclineClick(c)}>
                                {t.actionDecline}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>

                      <div>
                        <h4 className="font-semibold text-sm pr-6 text-[#EE2E24]">{c.fullName}</h4>
                        <p className="text-xs text-muted-foreground">{c.jobCode} - {c.positionId}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                         <span className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]" title={c.positionRaw}>
                           {c.positionRaw}
                         </span>
                         <Badge className={
                            parseInt(c.matchScore) >= 8 ? "bg-green-500" : 
                            parseInt(c.matchScore) >= 5 ? "bg-yellow-500" : "bg-gray-500"
                          }>
                            {c.matchScore}
                          </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Decline Modal */}
      <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>{t.modalDeclineTitle}</DialogTitle>
           </DialogHeader>
           <div className="py-2">
             <Label>{t.labelForReason}</Label>
             <Input 
               className="mt-2"
               placeholder="E.g. Technical mismatch, Budget constraints..."
               value={declineReason}
               onChange={(e) => setDeclineReason(e.target.value)}
             />
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
            <DialogTitle>{t.modalInterviewTitle}</DialogTitle>
          </DialogHeader>
           {/* ...Inputs for Date/Time/Venue (Simplified for brevity code reuse)... */} 
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
