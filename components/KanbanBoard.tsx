"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import RehireModal from "@/components/RehireModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, EyeOff, Eye, Copy, Check } from "lucide-react";
import { dictionary, LangType } from "@/lib/dictionary";
import { ACTIVE_JOBS } from "@/lib/constants";
import { parse, isAfter, parseISO } from "date-fns";

interface JobData {
    jobCode: string;
    positionId?: string;
    title?: string;
    group?: string;
    status: string;
    stopDate: string;
}


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
  hrInterviewDate?: string;
  interviewDate1?: string;
  interviewDate2?: string;
  testResult?: string;
  failureReason?: string;
  isPotential?: boolean;
  rejectedRound?: string;
  notes?: string;
  applyDate?: string;
  // Multi-source fields (NEW)
  dataSource?: "HO" | "ST";
  sheetId?: string;
}

interface KanbanBoardProps {
  lang: LangType;
  user?: any;
}

// English Keys for Database Storage
const REASONS_EN = {
  screening: ["Not suitable for JD", "Insufficient Experience", "Duplicate CV", "Blacklist", "Other"],
  interview: ["Technical Mismatch", "Cultural Mismatch", "Failed English", "High Salary Expectation", "No Show", "Other"],
  offer: ["Declined Offer", "Accepted Other Job", "Salary Negotiation Failed", "Ghosted", "Other"]
};

export default function KanbanBoard({ lang, user }: KanbanBoardProps) {
  const t = dictionary[lang].kanban;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Record<string, JobData>>({});
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showRejected, setShowRejected] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [selectedJobCode, setSelectedJobCode] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "HO" | "ST">("all"); // NEW: Data source filter
  
  // Job Codes for Filter
  const uniqueJobCodes = Array.from(new Set(candidates.map(c => c.jobCode).filter(Boolean))) as string[];

  // Modal State
  // Modal State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isStopJobModalOpen, setIsStopJobModalOpen] = useState(false);
  const [isRehireModalOpen, setIsRehireModalOpen] = useState(false); // New
  const [rehireCandidate, setRehireCandidate] = useState<Candidate | null>(null); // New
  const [isHiredModalOpen, setIsHiredModalOpen] = useState(false);
  const [hiredDate, setHiredDate] = useState("");
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Data for Modals
  const [interviewDetails, setInterviewDetails] = useState({
    date: new Date().toISOString().split('T')[0], // Default to Today
    time: "09:00",
    venue: "HCM Office – Eximland Building, 163 Phan Dang Luu, Ward 1, Phu Nhuan District, HCMC",
    interviewer: ""
  });
  const [interviewType, setInterviewType] = useState<"HR" | "L1" | "L2">("L1"); 

  const [declineReasonType, setDeclineReasonType] = useState<string>("");
  const [declineReasonText, setDeclineReasonText] = useState("");
  const [stopJobReason, setStopJobReason] = useState(""); // New
  const [stopJobOtherReason, setStopJobOtherReason] = useState(""); // New
  const [isPotentialDecline, setIsPotentialDecline] = useState(false);

  const COLUMNS = [
    { id: "New", title: t.colNew, color: "bg-gray-50" },
    { id: "Screening", title: t.colScreening, color: "bg-[#FFF0F0]" },
    { id: "HR Interview", title: t.colHrInterview, color: "bg-gray-50" },
    { id: "Interview", title: t.colInterview, color: "bg-[#FFF0F0]" },
    { id: "Interview2", title: t.colInterview2, color: "bg-gray-50" },
    { id: "Offer", title: t.colOffer, color: "bg-[#FFF0F0]" },
    ...(showRejected ? [{ id: "Rejected", title: t.colRejected, color: "bg-gray-50" }] : [])
  ];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const [candRes, jobRes] = await Promise.all([
        fetch("/api/candidates"),
        fetch("/api/jobs")
      ]);
      
      if (!candRes.ok) throw new Error("Failed");
      const data = await candRes.json();
      const jobData = await jobRes.json();

      // Jobs Map - Store complete job info including title and positionId
      const jobMap: Record<string, JobData> = {};
      if (jobData.jobs) {
          jobData.jobs.forEach((j: any) => {
              jobMap[j.jobCode] = { 
                  jobCode: j.jobCode, 
                  positionId: j.positionId,
                  title: j.title,
                  group: j.group,
                  status: j.status, 
                  stopDate: j.stopDate 
              };
          });
      }
      setJobs(jobMap);

      const formatted = data.candidates.map((c: any) => ({
        // ... mapping remains same, assuming API returns same structure
        id: c.id,
        fullName: c.fullName,
        positionRaw: c.positionRaw,
        status: c.status || "New",
        matchScore: c.matchScore,
        cvLink: c.cvLink,
        email: c.email || "",
        matchReason: c.matchReason || "",
        notes: c.notes || "",
        jobCode: c.jobCode,
        timestamp: c.timestamp,
        log: c.log || "",
        offerDate: c.offerDate,
        hrInterviewDate: c.hrInterviewDate,
        interviewDate1: c.interviewDate1,
        interviewDate2: c.interviewDate2,
        testResult: c.testResult,
        failureReason: c.failureReason,
        isPotential: c.isPotential,
        rejectedRound: c.rejectedRound,
        applyDate: c.applyDate,
        dataSource: c.dataSource || "HO", // NEW: Track data source
        sheetId: c.sheetId, // NEW: For update routing
      }));
      setCandidates(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const moveStatus = async (candidate: Candidate, targetStatus: string, type?: "HR" | "L1" | "L2") => {
    // 1. Interview Logic (Including HR Interview)
    if (targetStatus === "Interview" || targetStatus === "Interview2" || targetStatus === "HR Interview") {
      setSelectedCandidate(candidate);
      setInterviewType(type || "L1");
      
      // Default Date/Time Logic (Today)
      setInterviewDetails(prev => ({
          ...prev, 
          date: new Date().toISOString().split('T')[0],
          time: "09:00"
      }));

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

    // --- CLEANUP LOGIC FOR BACKWARD MOVES ---
    // If we move to a stage, we must clear dates of SUBSEQUENT stages to avoid dirty data in reports.
    // Hierarchy: New -> Screening -> HR Interview -> Interview -> Interview2 -> Offer
    
    const STAGE_ORDER = ["New", "Screening", "HR Interview", "Interview", "Interview2", "Offer", "Hired"];
    const targetIdx = STAGE_ORDER.indexOf(targetStatus);
    const currentIdx = STAGE_ORDER.indexOf(candidate.status);

    // If moving backward (or even sideways to same stage, though unlikely), ensure future fields are empty
    // Actually, we should ALWAYS ensure fields *after* the target stage are cleared, 
    // just in case they were set previously (e.g. rehire or accidental forward move).
    
    if (targetIdx !== -1) {
        // If target is BEFORE Offer (i.e. index < 5), clear Offer Date
        if (targetIdx < 5) updates.offerDate = ""; 
        
        // If target is BEFORE Interview2 (i.e. index < 4), clear Interview2 Date
        if (targetIdx < 4) updates.interviewDate2 = "";

        // If target is BEFORE Interview (L1) (i.e. index < 3), clear Interview1 Date
        if (targetIdx < 3) updates.interviewDate1 = "";

        // If target is BEFORE HR Interview (i.e. index < 2), clear HR Date
        if (targetIdx < 2) updates.hrInterviewDate = "";

        // If target is BEFORE Screening (i.e. New) (i.e. index < 1), clear TestResult
        if (targetIdx < 1) updates.testResult = "";
    }
    // -----------------------------------------

    await updateCandidateAPI(candidate, updates);
  };

  const handleHired = (candidate: Candidate) => {
      setSelectedCandidate(candidate);
      setHiredDate(new Date().toLocaleDateString('en-GB'));
      setIsHiredModalOpen(true);
  };

  const confirmHired = async () => {
      if (!selectedCandidate) return;
      await updateCandidateAPI(selectedCandidate, {
          status: "Hired",
          applyDate: hiredDate, 
          officialDate: hiredDate 
      });
      setIsHiredModalOpen(false);
  };

  const handleWithdraw = async (candidate: Candidate) => {
     // Determine previous status
     const status = candidate.status;
     let prev = "New";
     
     if (status === "Rejected") {
        // Smart Recovery Strategy
        if (candidate.offerDate) prev = "Offer";
        else if (candidate.interviewDate2) prev = "Interview2";
        else if (candidate.interviewDate1) prev = "Interview";
        else if (candidate.hrInterviewDate) prev = "HR Interview";
        else if (candidate.testResult) prev = "Screening";
        else prev = "New";
     } else {
        // Standard Step Back
        if (status === "Screening") prev = "New";
        else if (status === "HR Interview") prev = "Screening";
        else if (status === "Interview") prev = "HR Interview";
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
        updates.failureReason = ""; 
     } else {
        if (status === "Offer") updates.offerDate = "";
        if (status === "Interview") updates.interviewDate1 = ""; 
        if (status === "Interview2") updates.interviewDate2 = "";
        if (status === "HR Interview") updates.hrInterviewDate = "";
        if (status === "Screening") updates.testResult = ""; 
     }

     await updateCandidateAPI(candidate, updates);
  };

  const handleDeclineClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDeclineReasonType("");
    setDeclineReasonText("");
    setIsPotentialDecline(false);
    setIsDeclineModalOpen(true);
  };

  const confirmDecline = async () => {
    if (!selectedCandidate) return;
    
    // Combine Reason
    let finalReason = declineReasonType;
    if (declineReasonType === "Other" || !declineReasonType) {
        finalReason = declineReasonText;
    }

    const roundMap: Record<string, string> = {
       "New": "Screening",
       "Screening": "Screening",
       "HR Interview": "HR Interview",
       "Interview": "Interview Round 1",
       "Interview2": "Interview Round 2", 
       "Offer": "Offer"
    };
    const currentStatus = selectedCandidate.status || "New";
    const rejectedRound = roundMap[currentStatus] || currentStatus;

    await updateCandidateAPI(selectedCandidate, {
      status: "Rejected",
      failureReason: finalReason,
      isPotential: isPotentialDecline,
      rejectedRound: rejectedRound
    });
    setIsDeclineModalOpen(false);
  };

  const confirmInterview = async () => {
    if (!selectedCandidate) return;
    
    // Outlook Logic ONLY for L1 & L2 (Not HR)
    if (interviewType !== "HR") {
        const roundName = interviewType === "L1" ? "Round 1" : "Round 2";
        const subject = `Interview Invitation (${roundName}) - ${selectedCandidate.positionRaw} - ${selectedCandidate.fullName}`;
        
        // Construct Signature ...
        const senderName = user?.config?.displayName || user?.name || "HR Team";
        const senderPhone = user?.config?.phoneNumber || "";
        
        const body = `Dear Mr./Ms. ${selectedCandidate.fullName},\n\n` +
                     `Greetings from CBS VN.\n\n` +
                     `Thank you for your interest in a possible job opportunity with us. After exploring your qualifications, we are pleased to invite you to join an offline interview with the following details:\n\n` +
                     `Applied Position:  ${selectedCandidate.positionRaw}\n` +
                     `Date & time:       ${interviewDetails.time}, ${new Date(interviewDetails.date || new Date()).toLocaleDateString('en-GB')}\n` +
                     `Venue:             ${interviewDetails.venue}\n` +
                     `Meet with:         ${interviewDetails.interviewer}\n\n` +
                     `Please confirm your attendance by replying to this email. Should you need any assistance, do not hesitate to contact me via ${senderPhone} (${senderName}).\n\n` +
                     `Thanks and best regards!\n\n` +
                     `${senderName}\n` +
                     `CBS HR Team`;
    
        const mailtoLink = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, "_blank");
    }

    // Update API
    const dateObj = new Date(interviewDetails.date || new Date());
    const dateStr = dateObj.toLocaleDateString('en-GB'); 
    const timeStr = interviewDetails.time;
    const fullDate = `${dateStr} ${timeStr}`;

    const updates: any = {
      interviewer: interviewDetails.interviewer
    };
    
    if (interviewType === "HR") {
        updates.status = "HR Interview";
        updates.hrInterviewDate = fullDate;
    } else if (interviewType === "L1") {
        updates.status = "Interview";
        updates.interviewDate1 = fullDate;
    } else {
        updates.status = "Interview2";
        updates.interviewDate2 = fullDate;
    }

    await updateCandidateAPI(selectedCandidate, updates);
    setIsInterviewModalOpen(false);
  };

  const copyToClipboard = () => {
      if (!selectedCandidate) return;
      const senderName = user?.config?.displayName || user?.name || "HR Team";
      const senderPhone = user?.config?.phoneNumber || "";
      const dateStr = new Date(interviewDetails.date || new Date()).toLocaleDateString('en-GB'); // dd/MM/yyyy

      // Rich Text HTML logic
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            <p>Dear <strong>${selectedCandidate.fullName}</strong>,</p>
            <p>Greetings from <strong>CBS VN</strong>.</p>
            <p>Thank you for your interest in a possible job opportunity with us. After exploring your qualifications, we are pleased to invite you to join an <u>offline</u> interview with the following details:</p>
            
            <table style="border-collapse: collapse; margin: 15px 0;">
                <tr>
                    <td style="font-weight: bold; padding-right: 20px; padding-bottom: 5px; vertical-align: top; white-space: nowrap;">Applied Position:</td>
                    <td style="font-weight: bold; padding-bottom: 5px;">${selectedCandidate.positionRaw}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding-right: 20px; padding-bottom: 5px; vertical-align: top; white-space: nowrap;">Date & time:</td>
                    <td style="padding-bottom: 5px;">${dateStr}, at <strong>${interviewDetails.time}</strong></td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding-right: 20px; padding-bottom: 5px; vertical-align: top; white-space: nowrap;">Venue:</td>
                    <td style="padding-bottom: 5px;">${interviewDetails.venue}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding-right: 20px; padding-bottom: 5px; vertical-align: top; white-space: nowrap;">Meet with:</td>
                    <td style="padding-bottom: 5px;">${interviewDetails.interviewer}</td>
                </tr>
            </table>

            <p>Please confirm your attendance by replying to this email. Should you need any assistance, do not hesitate to contact me via ${senderPhone} (${senderName}).</p>
            <br/>
            <p><strong>Thanks and best regards!</strong></p>
            <br/>
            <p style="color: #B91C1C; font-weight: bold;">${senderName}</p>
        </div>
      `;
      
      const blob = new Blob([htmlContent], { type: "text/html" });
      const textBlob = new Blob([htmlContent.replace(/<[^>]*>/g, "")], { type: "text/plain" });
      const data = [new ClipboardItem({ 
          "text/html": blob,
          "text/plain": textBlob 
      })];
      
      navigator.clipboard.write(data).catch(err => {
          console.error("Failed to copy:", err);
      });
  };

  const updateCandidateAPI = async (candidate: Candidate, updates: any) => {
    // Optimistic update
    setCandidates(prev => prev.map(c => 
      c.id === candidate.id ? { ...c, ...updates } : c
    ));

    try {
      const res = await fetch("/api/candidates/update", {
        method: "POST",
        body: JSON.stringify({ 
          id: candidate.id, 
          updates,
          dataSource: candidate.dataSource, // NEW: Route to correct sheet
          sheetId: candidate.sheetId // NEW: Exact sheet ID
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update Failed");
      }
    } catch (error) {
      console.error("Update failed", error);
      fetchCandidates(); // Revert
    }
  };

  const handleStopJob = async () => {
    if (selectedJobCode === "all") return;
    
    const finalReason = stopJobReason === "Other" ? stopJobOtherReason : stopJobReason;
    if (!finalReason) {
        // Show validation error in UI (stop job reason is required)
        return;
    }

    // Get Title and Group from Jobs API data (not hardcoded ACTIVE_JOBS)
    const jobInfo = jobs[selectedJobCode];
    const title = jobInfo?.title || "Unknown";
    const group = jobInfo?.group || (selectedJobCode.startsWith("ST") ? "Store" : "HO");

    try {
        const res = await fetch("/api/jobs/stop", {
            method: "POST",
            body: JSON.stringify({ 
                jobCode: selectedJobCode, 
                reason: finalReason,
                title,
                group
            })
        });
        
        if (!res.ok) throw new Error("Failed to stop job");
        
        setIsStopJobModalOpen(false);
        setStopJobReason("");
        setStopJobOtherReason("");
        fetchCandidates(); // Refresh to update Stock view
    } catch (e) {
        console.error(e);
    }
  };

  const handleResumeJob = () => {
      if (selectedJobCode === "all") return;
      setIsResumeModalOpen(true);
  };

  const confirmResumeJob = async () => {
      try {
          // Re-enable in Jobs Sheet
          await fetch("/api/jobs", {
              method: "POST",
              body: JSON.stringify({
                  jobCode: selectedJobCode,
                  status: "Hiring",
                  stopDate: "",
                  reason: ""
              })
          });
          fetchCandidates();
          setIsResumeModalOpen(false);
      } catch (e) {
          console.error("Failed to resume", e);
      }
  };

  const handleReactivateCandidate = (candidate: Candidate) => {
      setRehireCandidate(candidate);
      setIsRehireModalOpen(true);
  };

  const confirmRehire = async (jobCode: string) => {
      if (!rehireCandidate) return;

      // Determine correct applyDate logic (Same as DatapoolTable)
      let newApplyDate = "";
      const targetJob = jobs[jobCode];
      if (targetJob && targetJob.status === "Stopped" && targetJob.stopDate) {
          newApplyDate = targetJob.stopDate; 
      }

      // Optimistic
      setCandidates(prev => prev.map(c => c.id === rehireCandidate.id ? { ...c, status: "Screening", jobCode: jobCode, notes: "", applyDate: newApplyDate } : c));
      
      // API
      await updateCandidateAPI(rehireCandidate, { status: "Screening", jobCode: jobCode, notes: "", applyDate: newApplyDate });
      fetchCandidates();
  };

  // --- FILTERING ---
  const filteredCandidates = candidates.filter(c => {
    const isNoteStock = c.notes?.includes("Stock");
    let isStoppedRule = false;
    const job = jobs[c.jobCode || ""];
    if (job && job.status === "Stopped" && job.stopDate) {
        try {
             // Prefer applyDate (ISO), fallback to timestamp (dd/MM/yyyy)
             let cDate;
             if (c.applyDate) {
                 cDate = parseISO(c.applyDate);
             } else {
                 cDate = parse(c.timestamp || "", 'dd/MM/yyyy HH:mm:ss', new Date());
             }
             const sDate = parseISO(job.stopDate);
             if (isAfter(cDate, sDate)) isStoppedRule = true;
        } catch (e) {}
    }
    const isStock = isNoteStock || isStoppedRule;
    
    // 1. View Logic
    if (showStock) {
        return isStock;
    }
    
    // If NOT showing stock, hide stock items
    if (isStock) return false;

    // Reject Logic
    if (!showRejected && c.status === "Rejected") return false;
    if (showRejected && c.status !== "Rejected") return false; // Optional: Show ONLY rejected? 
    // User current logic for Show Rejected was to TOGGLE it ON TOP, or Filter?
    // Current code: "if !showRejected && c.status === Rejected return false" -> Means "Hide rejected by default".
    // If showRejected is true, it shows BOTH active and rejected? 
    // "Toggle Rejected" usually implies "Show Rejected" in list. 
    
    // Let's refine based on "View Mode".
    // "Normal": Active, Non-Stock.
    // "Rejected Toggle": Active + Rejected? Or Just Rejected?
    // User requested: "show một pop up... giống Show Reject"
    
    // To keep it simple:
    // If showStock -> Show ONLY Stock.
    // If showRejected -> Show ONLY Rejected (or Active + Rejected, but typically user wants to review rejected separately).
    // Let's stick to: "Show Rejected" = Include Rejected. 
    
    // 2. Job Code Filter
    if (selectedJobCode !== "all" && c.jobCode !== selectedJobCode) return false;

    // 2.5. Data Source Filter (NEW - for Admin combined view)
    if (sourceFilter !== "all" && c.dataSource !== sourceFilter) return false;

    // 3. Search Term
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.fullName?.toLowerCase().includes(searchLower) ||
      c.jobCode?.toLowerCase().includes(searchLower) ||
      c.positionId?.toLowerCase().includes(searchLower) ||
      c.positionRaw?.toLowerCase().includes(searchLower);

    // 4. Score Filter
    let matchesScore = true;
    if (scoreFilter !== "all") {
       const score = parseInt(c.matchScore) || 0;
       if (scoreFilter === "high") matchesScore = score >= 8;
       if (scoreFilter === "medium") matchesScore = score >= 5 && score < 8;
       if (scoreFilter === "low") matchesScore = score < 5;
    }

    // 5. Date Filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const dateStr = c.applyDate || c.timestamp; // Use applyDate filters too if available? Or just stick to one strategy. User said "cứ lấy cột này so sánh". 
      // If applyDate exist (ISO), use it. If not, fallback to timestamp.
      if (!dateStr) {
         matchesDate = false;
      } else {
         let cDate;
         if (c.applyDate) {
             cDate = new Date(c.applyDate); 
          } else if (c.timestamp) {
             const firstPart = c.timestamp.split(" ")[0];
             if (firstPart) {
                 const parts = firstPart.split("/");
                 const [day, month, year] = parts;
                 if (parts.length === 3 && day && month && year) {
                     cDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                 }
             }
          }

         if (cDate) {
            cDate.setHours(0,0,0,0);
            if (dateFrom) {
                const dStart = new Date(dateFrom); 
                dStart.setHours(0,0,0,0);
                if (cDate < dStart) matchesDate = false;
            }
            if (dateTo && matchesDate) {
                const dEnd = new Date(dateTo);
                dEnd.setHours(0,0,0,0);
                if (cDate > dEnd) matchesDate = false;
            }
         } else {
             matchesDate = false;
         }
      }
    }

    return matchesSearch && matchesScore && matchesDate;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // Determine current decline reasons
  const currentStage = selectedCandidate?.status || "New";
  let reasonKeys = REASONS_EN.screening;
  let reasonLabels = t.reasons.screening;

  if (currentStage === "Interview" || currentStage === "Interview2") {
    reasonKeys = REASONS_EN.interview;
    reasonLabels = t.reasons.interview;
  } else if (currentStage === "Offer") {
    reasonKeys = REASONS_EN.offer;
    reasonLabels = t.reasons.offer;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] border rounded-lg bg-gray-50 overflow-hidden relative shadow-sm">
        
        {/* Sticky Filter Bar */}
        <div className="bg-white p-3 border-b flex flex-wrap gap-3 items-center shrink-0">
          
          {/* Job Code Filter & Search Split */}
          <div className="flex gap-2 items-center flex-1 min-w-[300px]">
             {/* Job Code Finder */}
             <div className="flex items-center">
                <Select value={selectedJobCode} onValueChange={setSelectedJobCode}>
                  <SelectTrigger className="w-[180px] h-9 text-sm bg-white border-r-0 rounded-r-none focus:ring-0">
                    <SelectValue placeholder="Select Job Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {uniqueJobCodes.map(code => (
                        <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* 3-Dots Menu for Stop Job */}
                {selectedJobCode !== "all" && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-l-0 bg-gray-50">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {jobs[selectedJobCode]?.status === "Stopped" ? (
                                <DropdownMenuItem className="text-green-600" onClick={handleResumeJob}>
                                    Continue Recruitment
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem className="text-red-600" onClick={() => setIsStopJobModalOpen(true)}>
                                    Stop Recruitment
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
             </div>

             {/* Text Search */}
             <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder={t.searchPlaceholder} 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white h-9 pl-8 text-sm w-full"
                    />
                </div>
             </div>
          </div>
          
          {/* Score Filter */}
          <div className="w-[130px]">
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

          {/* Source Filter (Manager Only - combined view) */}
          {user?.role === "Manager" && (
          <div className="w-[120px]">
            <Select value={sourceFilter} onValueChange={(v: "all" | "HO" | "ST") => setSourceFilter(v)}>
              <SelectTrigger className="bg-white h-9 text-sm">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="HO">HO Only</SelectItem>
                <SelectItem value="ST">Store Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          )}

          {/* Date Filter - Compact */}
          <div className="flex items-center gap-1 bg-white px-2 rounded border h-9">
            <span className="text-xs text-gray-500 font-medium">From:</span>
            <Input 
              type="date" 
              className="h-7 w-[95px] text-xs border-0 focus-visible:ring-0 p-1"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-xs text-gray-500 font-medium">To:</span>
            <Input 
              type="date" 
              className="h-7 w-[95px] text-xs border-0 focus-visible:ring-0 p-1"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* View Toggles */}
          <div className="flex bg-gray-100 p-1 rounded-md gap-1 h-9 items-center">
             <Button 
                variant={(!showRejected && !showStock) ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-7 text-xs ${(!showRejected && !showStock) ? "bg-green-100 text-green-700 hover:bg-green-200 shadow-sm" : "text-gray-500"}`}
                onClick={() => { setShowRejected(false); setShowStock(false); }}
             >
                Active
             </Button>
             <Button 
                variant={showRejected ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-7 text-xs ${showRejected ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
                onClick={() => { setShowRejected(true); setShowStock(false); }}
             >
                Rejected
             </Button>
             <Button 
                variant={showStock ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-7 text-xs ${showStock ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                onClick={() => { setShowRejected(false); setShowStock(true); }}
             >
                Stock
             </Button>
          </div>

          {/* Job Status Indicator - Inline */}
          {selectedJobCode !== "all" && jobs[selectedJobCode] && (
            <div className="flex bg-gray-100 p-1 rounded-md gap-1 h-9 items-center">
              <div className="flex items-center gap-1.5 px-2 h-7 bg-white rounded shadow-sm">
                <span className="text-xs font-semibold text-gray-700">{selectedJobCode}</span>
                <span className="text-xs text-gray-400">:</span>
                <span className={`text-xs font-medium ${
                  jobs[selectedJobCode].status === "Hiring" 
                    ? "text-green-600" 
                    : jobs[selectedJobCode].status === "Stopped" 
                      ? "text-red-600" 
                      : "text-gray-600"
                }`}>
                  {jobs[selectedJobCode].status === "Hiring" ? "Hiring" : 
                   jobs[selectedJobCode].status === "Stopped" ? "Closed" : 
                   jobs[selectedJobCode].status || "Unknown"}
                </span>
              </div>
            </div>
          )}

        </div>



        {/* Board Columns */}
        <div className="flex-1 overflow-hidden p-3" style={{ transform: "rotateX(180deg)" }}>
           <div className="flex w-full h-full gap-2" style={{ transform: "rotateX(180deg)" }}>
            {COLUMNS.map((col) => {
               // Hide columns in Stock View except 'New' or just show List?
               // User wants "appearance like Show Rejected" -> likely means in Table? 
               // Or Kanban? "xuất hiện ở view Stock... giống Show Reject của 2 tap datapool và process"
               // Update: Show Rejected is a Table View in Datapool, but Kanban can also show Rejected col.
               // Let's assume Stock View in Kanban just filters cards. But columns?
               // All columns are relevant since Stock candidates might have been in any stage.
               // But usually Stock View might be a single list.
               // For now, I'll keep Kanban columns.
               
               const colCandidates = filteredCandidates.filter(c => {
                   const s = c.status || "New";
                   if (col.id === "Offer") return s === "Offer" || s === "Hired";
                   return s === col.id;
               });
               
               // If Stock View, we might want to show Reactivate Button on cards
               
                // If Stock View, we might want to show Reactivate Button on cards
                
                return (
               <div 
                   key={col.id} 
                   className={`w-[220px] flex flex-col rounded-lg border border-gray-200/60 shadow-sm ${col.color} transition-colors duration-200`}
                   onDragOver={(e) => {
                       e.preventDefault(); // Allow drop
                       e.currentTarget.classList.add("ring-2", "ring-[#B91C1C]/20");
                   }}
                   onDragLeave={(e) => {
                       e.currentTarget.classList.remove("ring-2", "ring-[#B91C1C]/20");
                   }}
                   onDrop={(e) => {
                       e.preventDefault();
                       e.currentTarget.classList.remove("ring-2", "ring-[#B91C1C]/20");
                       const candJson = e.dataTransfer.getData("candidate");
                       if (candJson) {
                           try {
                               const cand = JSON.parse(candJson);
                               if (cand.status !== col.id) {
                                   // Identify type for Interview status
                                   let type: "HR" | "L1" | "L2" | undefined;
                                   if (col.id === "HR Interview") type = "HR";
                                   else if (col.id === "Interview") type = "L1";
                                   else if (col.id === "Interview2") type = "L2";
                                   
                                   moveStatus(cand, col.id, type);
                               }
                           } catch (err) {
                               console.error("Drop Error", err);
                           }
                       }
                   }}
               >
                 {/* Column Header */}
                 <div className="flex justify-between items-center p-3 border-b bg-white/60 rounded-t-lg backdrop-blur-sm sticky top-0">
                   <h3 className="font-bold text-sm text-gray-700 truncate" title={col.title}>{col.title}</h3>
                   <Badge variant="secondary" className="bg-white/80 h-5 text-[10px] px-2 shadow-sm">
                     {colCandidates.length}
                   </Badge>
                 </div>

                 {/* Cards Container */}
                 <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
                   {colCandidates.map((c) => (
                       <div
                           draggable
                           onDragStart={(e) => {
                               e.dataTransfer.setData("candidate", JSON.stringify(c));
                               e.dataTransfer.effectAllowed = "move";
                               // Optional: Set drag image or styling
                           }}
                           key={c.id} 
                           className="cursor-grab active:cursor-grabbing"
                        >
                       <Card className="hover:shadow-md transition-all duration-200 group bg-white border-l-4" style={{ borderLeftColor: parseInt(c.matchScore) >= 8 ? '#22c55e' : parseInt(c.matchScore) >= 5 ? '#eab308' : '#6b7280' }}>
                         <CardContent className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                               <h4 className="font-bold text-[11px] text-[#B91C1C] leading-snug" title={c.fullName}>{c.fullName}</h4>
                               <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" className="h-6 w-6 p-0 -mt-1 -mr-2 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                     <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                   </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                   {showStock ? (
                                      <DropdownMenuItem onClick={() => handleReactivateCandidate(c)}>
                                         Rehire
                                      </DropdownMenuItem>
                                   ) : (
                                     <>
                                         {/* Standard Actions */}
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
                                             <DropdownMenuItem onClick={() => moveStatus(c, "HR Interview", "HR")}>
                                             Schedule HR Interview
                                             </DropdownMenuItem>
                                         )}
                                         {col.id === "HR Interview" && (
                                             <DropdownMenuItem onClick={() => moveStatus(c, "Interview", "L1")}>
                                             Schedule Manager L1
                                             </DropdownMenuItem>
                                         )}
                                         {col.id === "Interview" && (
                                             <>
                                             <DropdownMenuItem onClick={() => moveStatus(c, "Interview2", "L2")}>
                                                 Schedule Manager L2
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
                                         {col.id === "Offer" && (
                                             <DropdownMenuItem className="text-green-600 font-bold" onClick={() => handleHired(c)}>
                                                 Hired
                                             </DropdownMenuItem>
                                         )}

                                         {/* Withdraw Logic */}
                                         {col.id !== "New" && (
                                             <>
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem onClick={() => handleWithdraw(c)}>
                                                 {t.actionWithdraw}
                                             </DropdownMenuItem>
                                             </>
                                         )}
                                         
                                         {/* Recovery logic only for Rejected, not for Stock (Stock has Reactivate) */}
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
                                     </>
                                   )}
                                 </DropdownMenuContent>
                               </DropdownMenu>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[11px] text-gray-600 font-medium">{c.jobCode}</p>
                                {c.positionId && <p className="text-[10px] text-gray-400 leading-tight">{c.positionId}</p>}
                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 block w-fit max-w-full whitespace-normal break-words" title={c.positionRaw}>
                                {c.positionRaw}
                                </span>
                                {/* Show Stock Reason */}
                                {showStock && c.notes && <p className="text-[10px] text-blue-600 italic">{c.notes}</p>}
                            </div>
                            
                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-gray-400">
                                  {c.timestamp ? c.timestamp.split(" ")[0] : ""}
                                </span>
                                {/* Data Source Badge (Manager only - combined view) */}
                                {user?.role === "Manager" && (
                                  <Badge className={`h-4 text-[8px] px-1 ${c.dataSource === "HO" ? "bg-blue-500 hover:bg-blue-600" : "bg-purple-500 hover:bg-purple-600"}`}>
                                    {c.dataSource === "HO" ? "HO" : "ST"}
                                  </Badge>
                                )}
                              </div>
                              
                              {(col.id === "New" || showStock) && (
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
                       </div>
                    ))}
                </div>
              </div>
            );})}
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
             <Button variant="outline" onClick={() => setIsDeclineModalOpen(false)}>{t.btnCancel}</Button>
             <Button variant="destructive" onClick={confirmDecline}>{t.btnConfirmDecline}</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Interview Modal */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.modalInterviewTitle} ({interviewType})</DialogTitle>
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
            <Button variant="secondary" onClick={copyToClipboard} className="gap-2">
                <Copy className="h-4 w-4" /> Copy Email Template
            </Button>
            <Button onClick={confirmInterview} className="bg-[#B91C1C] hover:bg-[#991b1b]">{t.btnSendInvite}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Stop Job Modal */}
      <Dialog open={isStopJobModalOpen} onOpenChange={setIsStopJobModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Stop Recruitment for {selectedJobCode}</DialogTitle>
                <p className="text-sm text-gray-500">
                    This will mark the Job as Stopped. New applicants arriving after this timestamp will be automatically marked as Stock.
                    Existing candidates remain unaffected.
                </p>
            </DialogHeader>
            <div className="py-2 space-y-4">
                <div className="space-y-2">
                    <Label>Reason for Stopping</Label>
                    <Select value={stopJobReason} onValueChange={setStopJobReason}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Reason" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Headcount reduction">Headcount reduction</SelectItem>
                            <SelectItem value="Budget constraints">Budget constraints</SelectItem>
                            <SelectItem value="Strategy change">Strategy change</SelectItem>
                            <SelectItem value="Hired internally">Hired internally</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {stopJobReason === "Other" && (
                    <Input 
                        placeholder="Type other reason..."
                        value={stopJobOtherReason}
                        onChange={(e) => setStopJobOtherReason(e.target.value)}
                    />
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsStopJobModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleStopJob}>Confirm Stop</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hired Modal */}
      <Dialog open={isHiredModalOpen} onOpenChange={setIsHiredModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Hired</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label>Start Date (dd/mm/yyyy)</Label>
                    <Input 
                        value={hiredDate}
                        onChange={(e) => setHiredDate(e.target.value)}
                        placeholder="dd/mm/yyyy"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsHiredModalOpen(false)}>{t.btnCancel}</Button>
                <Button onClick={confirmHired} className="bg-green-600 hover:bg-green-700 text-white">Confirm</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Job Modal */}
      <Dialog open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Resume Recruitment</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <p>Are you sure you want to resume recruitment for <strong>{selectedJobCode}</strong>?</p>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsResumeModalOpen(false)}>{t.btnCancel}</Button>
                <Button onClick={confirmResumeJob} className="bg-blue-600 hover:bg-blue-700 text-white">Confirm Resume</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rehire Modal */}
      <RehireModal 
        isOpen={isRehireModalOpen}
        onClose={() => setIsRehireModalOpen(false)}
        candidate={rehireCandidate}
        availableJobCodes={Object.keys(jobs).sort()}
        onConfirm={confirmRehire}
      />

    </div>
  );
}
