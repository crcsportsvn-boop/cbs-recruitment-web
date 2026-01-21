"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { LangType } from "@/lib/dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Filter, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Candidate {
  id: string;
  name: string; // Mapped from fullName
  position: string; // Mapped from positionRaw or jobCode
  status: string;
  matchScore: number;
  phone: string;
  email: string;
  cvLink: string;
  interviewDate1?: string;
  interviewDate2?: string;
  offerDate?: string;
  startDate?: string;
  source?: string;
  timestamp?: string; // Apply Date
  failureReason?: string;
  summary?: string;
}

interface DatapoolTableProps {
  lang: LangType;
  user?: any;
}

export default function DatapoolTable({ lang, user }: DatapoolTableProps) {

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [showRejected, setShowRejected] = useState(false);

  // Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      // Map API data to UI structure (reuse logic from Kanban)
      const formatted = data.candidates.map((c: any) => ({
        id: c.id,
        name: c.fullName,
        position: c.positionId ? `${c.positionRaw} (${c.positionId})` : c.positionRaw,
        status: c.status || "New",
        matchScore: parseInt(c.matchScore) || 0,
        phone: c.phone,
        email: c.email,
        cvLink: c.cvLink,
        interviewDate1: c.interviewDate1,
        interviewDate2: c.interviewDate2,
        offerDate: c.offerDate,
        startDate: c.startDate,
        source: c.source,
        timestamp: c.timestamp,
        failureReason: c.failureReason,
        summary: c.summary,
      }));
      setCandidates(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredCandidates = candidates.filter((c) => {
    // 1. Text Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchLower) ||
      c.position?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone?.includes(searchLower);

    // 2. Score Filter
    const matchesScore =
      scoreFilter === "all" ||
      (scoreFilter === "high" && c.matchScore >= 8) ||
      (scoreFilter === "medium" && c.matchScore >= 5 && c.matchScore < 8) ||
      (scoreFilter === "low" && c.matchScore < 5);

    // 3. Date Filter (Simple string compare for now, ideally parse dates)
    // Skipping complex date logic for brevity, assumes formatted dd/mm/yyyy
    
    // 4. Status Mode (New vs Rejected)
    // "New" view includes: "New" or any non-final status? 
    // User asked for "CV chưa screen" (Unscreened) vs "Rejected".
    // Unscreened usually means "New".
    // Let's broaden "Unscreened" to be "New".
    // If showRejected is true -> only "Rejected".
    // If showRejected is false -> only "New" (or maybe everything EXCEPT Rejected? User said "2 dạng", implying disjoint sets).
    // Let's implement: Default = "New". Toggle ON = "Rejected".
    
    // Actually user might want to see "All Active" vs "Rejected".
    // But specific request was "CV chưa screen" (New).
    const isRejected = c.status === "Rejected";
    const isNew = c.status === "New";
    
    const matchesMode = showRejected ? isRejected : isNew;

    return matchesSearch && matchesScore && matchesMode;
  });

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow min-h-[500px]">
      
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-3 rounded-lg border">
        {/* Search */}
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search candidates (Name, Position, Email)..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
           <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="All Scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
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
             {showRejected ? <Eye className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
             {showRejected ? "Showing Rejected" : "Show Rejected"}
          </Button>

           <div className="text-xs text-gray-500 flex items-center px-2">
              Viewing: <b>{showRejected ? "Rejected" : "Unscreened (New)"}</b>
           </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/50">
              <TableHead className="w-[100px]">Received</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-center">AI Score</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                   Listing candidates...
                </TableCell>
              </TableRow>
            ) : filteredCandidates.length === 0 ? (
               <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                   No candidates found in {showRejected ? "Rejected" : "New"} pool.
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                  <TableCell className="font-medium text-xs text-gray-500">
                    {c.timestamp ? c.timestamp.split(" ")[0] : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.position}
                    {c.matchScore >= 8 && <Badge variant="secondary" className="ml-2 text-[10px] bg-green-100 text-green-800">Top Match</Badge>}
                  </TableCell>
                  <TableCell className="text-center">
                     <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        c.matchScore >= 8 ? "bg-green-100 text-green-700" :
                        c.matchScore >= 5 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                     }`}>
                        {c.matchScore}
                     </span>
                  </TableCell>
                   <TableCell className="text-sm text-gray-600">{c.source}</TableCell>
                   <TableCell>
                      <Badge variant="outline" className={showRejected ? "border-red-200 text-red-700 bg-red-50" : "border-blue-200 text-blue-700 bg-blue-50"}>
                        {c.status}
                      </Badge>
                   </TableCell>
                   <TableCell className="text-right">
                      {c.cvLink && (
                        <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                          <a href={c.cvLink} target="_blank" rel="noopener noreferrer">
                            View CV
                          </a>
                        </Button>
                      )}
                   </TableCell>
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
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="grid gap-6 py-4">
               {/* Header Info */}
               <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                    <p className="text-sm text-gray-500">{selectedCandidate.position} • {selectedCandidate.email}</p>
                  </div>
                  <div className="text-right">
                     <div className="text-3xl font-bold text-primary">{selectedCandidate.matchScore}/10</div>
                     <span className="text-xs text-gray-400">AI Match Score</span>
                  </div>
               </div>

               {/* AI Summary */}
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2">
                  <span className="font-semibold text-blue-800 flex items-center gap-2">
                    ✨ AI Analysis
                  </span>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">
                    {selectedCandidate.summary || "No detailed summary available."}
                  </p>
               </div>

               {/* Process Info */}
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-semibold text-gray-700">Application Date</label>
                    <p>{selectedCandidate.timestamp || "N/A"}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700">Source</label>
                    <p>{selectedCandidate.source || "N/A"}</p>
                  </div>
                  <div>
                     <label className="font-semibold text-gray-700">Current Status</label>
                     <p className={selectedCandidate.status === "Rejected" ? "text-red-600 font-bold" : "text-gray-900"}>{selectedCandidate.status}</p>
                  </div>
                   {selectedCandidate.failureReason && (
                     <div>
                        <label className="font-semibold text-gray-700">Failure Reason</label>
                         <p className="text-red-600 italic">"{selectedCandidate.failureReason}"</p>
                     </div>
                   )}
               </div>

               {/* Action Footer */}
               <div className="flex justify-end gap-3 pt-4 border-t">
                  {selectedCandidate.cvLink && (
                     <Button variant="outline" asChild>
                       <a href={selectedCandidate.cvLink} target="_blank" rel="noopener noreferrer">Open Original CV</a>
                     </Button>
                  )}
                  <Button onClick={() => setSelectedCandidate(null)}>Close</Button>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
