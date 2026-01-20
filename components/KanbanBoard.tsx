"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, User, MapPin, Mail, ArrowRight, XCircle, CheckCircle } from "lucide-react";

interface Candidate {
  id: number;
  fullName: string;
  email: string;
  positionRaw: string;
  matchScore: string;
  status: string; // New, Screening, Interview, Offer, Rejected
  cvLink: string;
  matchReason: string;
}

const COLUMNS = [
  { id: "New", title: "Mới (New)", color: "bg-blue-50" },
  { id: "Screening", title: "TA Duyệt (Screening)", color: "bg-yellow-50" },
  { id: "Interview", title: "Phỏng vấn (Interview)", color: "bg-purple-50" },
  { id: "Offer", title: "Offer / Hired", color: "bg-green-50" },
  { id: "Rejected", title: "Rejected", color: "bg-red-50" },
];

export default function KanbanBoard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);

  // Interview Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewDetails, setInterviewDetails] = useState({
    date: "", 
    time: "",
    venue: "HCM Office – Eximland Building, 163 Phan Dang Luu, Ward 1, Phu Nhuan District, HCMC",
    interviewer: ""
  });

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

  const handleDragStart = (candidate: Candidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDrop = async (targetStatus: string) => {
    if (!draggedCandidate) return;
    if (draggedCandidate.status === targetStatus) {
       setDraggedCandidate(null);
       return;
    }

    // Interactive Logic
    if (targetStatus === "Interview") {
      setSelectedCandidate(draggedCandidate);
      setIsInterviewModalOpen(true);
      // Wait for modal to confirm update
      setDraggedCandidate(null); 
      return; 
    }

    // Immediate Update for other statuses
    await updateCandidateStatus(draggedCandidate.id, targetStatus);
    setDraggedCandidate(null);
  };

  const updateCandidateStatus = async (id: number, status: string, extraDetails: any = null) => {
    // Optimistic Update
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, status, ...extraDetails } : c
    ));

    try {
      await fetch("/api/candidates/update", {
        method: "POST",
        body: JSON.stringify({
          id,
          status,
          ...extraDetails
        })
      });
    } catch (error) {
      console.error("Failed to update status", error);
      fetchCandidates(); // Revert on error
    }
  };

  const handleInterviewConfirm = async () => {
    if (!selectedCandidate) return;
    
    // Construct Email Link
    const subject = `Interview Invitation - ${selectedCandidate.positionRaw}`;
    const body = `Dear Mr./Ms. ${selectedCandidate.fullName},

Greetings from CBS VN. 

Thank you for your interest in a possible job opportunity with us. After exploring your qualifications, we are pleased to invite you to join an offline interview with the following details:

Applied Position: ${selectedCandidate.positionRaw}

Date & time: ${interviewDetails.date} at ${interviewDetails.time}

Venue: ${interviewDetails.venue}

Meet with: ${interviewDetails.interviewer}

HR Data Analyst

${interviewDetails.date}

${interviewDetails.venue}

${interviewDetails.interviewer}

 

Please confirm your attendance by replying to this email. Should you need any assistance, do not hesitate to contact me via 0906627301 (Ms. Nga).

 
Thanks and best regards!`;

    const mailtoLink = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open Mail Client
    window.open(mailtoLink, "_blank");

    // Update Status
    const fullDate = `${interviewDetails.date} ${interviewDetails.time}`;
    await updateCandidateStatus(selectedCandidate.id, "Interview", { 
      interviewDate: fullDate,
      interviewer: interviewDetails.interviewer
    });

    setIsInterviewModalOpen(false);
    setSelectedCandidate(null);
  };

  if (loading) return <div>Loading Board...</div>;

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4 min-h-[600px]">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className={`flex-shrink-0 w-80 rounded-lg p-3 ${col.color} border border-gray-200 flex flex-col`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-700">{col.title}</h3>
            <Badge variant="secondary" className="bg-white">
              {candidates.filter(c => (c.status || "New") === col.id).length}
            </Badge>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-[100px]">
            {candidates
              .filter(c => (c.status || "New") === col.id)
              .map((c) => (
                <Card 
                  key={c.id} 
                  draggable 
                  onDragStart={() => handleDragStart(c)}
                  className="cursor-move hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm line-clamp-1" title={c.fullName}>{c.fullName}</h4>
                      <Badge className={
                        parseInt(c.matchScore) >= 8 ? "bg-green-500" : 
                        parseInt(c.matchScore) >= 5 ? "bg-yellow-500" : "bg-gray-500"
                      }>
                        {c.matchScore}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.positionRaw}</p>
                    
                    {/* Action Hint */}
                    <div className="pt-1 flex justify-end">
                       <a href={c.cvLink} target="_blank" className="text-xs text-blue-600 hover:underline mr-2">CV</a>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Modal Interview */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lên Lịch Phỏng Vấn (Send Invite)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Ngày</Label>
              <Input 
                type="date" 
                className="col-span-3"
                value={interviewDetails.date}
                onChange={e => setInterviewDetails({...interviewDetails, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Giờ</Label>
              <Input 
                type="time" 
                className="col-span-3"
                value={interviewDetails.time}
                onChange={e => setInterviewDetails({...interviewDetails, time: e.target.value})}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Địa điểm</Label>
              <Input 
                className="col-span-3"
                value={interviewDetails.venue}
                onChange={e => setInterviewDetails({...interviewDetails, venue: e.target.value})}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">PV Với</Label>
              <Input 
                className="col-span-3" 
                placeholder="Ms. Van Le - Head of HR"
                value={interviewDetails.interviewer}
                onChange={e => setInterviewDetails({...interviewDetails, interviewer: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsInterviewModalOpen(false)}>Hủy</Button>
             <Button onClick={handleInterviewConfirm} className="bg-[#EE2E24] hover:bg-[#D5261C]">
               Gửi Email & Cập Nhật
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
