"use client";

import { useState, useEffect } from "react";
import { dictionary, LangType } from "@/lib/dictionary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Eye, EyeOff, Filter, Settings, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Candidate {
  id: string;
  name: string;
  position: string;
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
  timestamp?: string;
  failureReason?: string;
  summary?: string;
  isPotential?: boolean;
  rejectedRound?: string;
}

interface DatapoolTableProps {
  lang: LangType;
  user?: any;
}

export default function DatapoolTable({ lang, user }: DatapoolTableProps) {
  const t = dictionary[lang].datapoolTable;
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
    rejectedRound: true,
    potential: true,
    summary: false, // Default hidden
    actions: true
  });

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
        isPotential: c.isPotential,
        rejectedRound: c.rejectedRound,
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
    
    // Toggle View: Rejected vs New
    // User wants "Show Rejected" to show Rejected list. Default shows New.
    // However, if "Potential" is a separate concept, maybe it spans both?
    // User said: "Show thêm cột tiềm năng".
    // For now, adhere to the toggle logic: One view or the other?
    // User image showed "Showing Rejected" button.
    // "Viewing: Rejected" text.
    // I'll stick to: Toggle ON -> Show Rejected. Toggle OFF -> Show New.
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
             {showRejected ? t.viewingRejected : t.viewingNew.replace("Viewing:", t.btnShowRejected)} 
             {/* Note: User wanted to replace "Viewing:..." text with selector. I put button text here. */}
             {/* Actually, user said "Viewing: Rejected" text NEXT to button is wasting space. I removed that text element and put status IN button if I want? */}
             {/* I'll label button "Show Rejected" / "Show New" */}
             {showRejected ? t.btnHideRejected : t.btnShowRejected}
          </Button>

          {/* Column Selector (Replaces the 'Viewing' text area) */}
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
              {visibleColumns.rejectedRound && <TableHead>{t.colRejectedRound}</TableHead>}
              {visibleColumns.potential && <TableHead className="text-center">{t.colPotential}</TableHead>}
              {visibleColumns.summary && <TableHead className="w-[200px]">{t.colSummary}</TableHead>}
              {visibleColumns.actions && <TableHead className="text-right">{t.colActions}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredCandidates.length === 0 ? (
               <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-gray-500">
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
                    {/* User asked to remove Top Match badge */}
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

                   {visibleColumns.rejectedRound && <TableCell className="text-sm text-gray-600">
                      {c.rejectedRound || "-"}
                   </TableCell>}

                   {visibleColumns.potential && <TableCell className="text-center">
                      {c.isPotential && <Check className="h-5 w-5 text-yellow-500 mx-auto" />}
                   </TableCell>}

                   {visibleColumns.summary && <TableCell className="text-xs text-gray-500 max-w-[200px] truncate" title={c.summary}>
                      {c.summary}
                   </TableCell>}

                   {visibleColumns.actions && <TableCell className="text-right">
                      {c.cvLink && (
                        <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                          <a href={c.cvLink} target="_blank" rel="noopener noreferrer">
                            {t.viewCV}
                          </a>
                        </Button>
                      )}
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
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="grid gap-6 py-4">
               {/* Header Info */}
               <div className="flex items-start justify-between border-b pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {selectedCandidate.name}
                        {selectedCandidate.isPotential && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Potential CV</Badge>}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedCandidate.position} • {selectedCandidate.email}</p>
                  </div>
                  <div className="text-right">
                     <div className="text-3xl font-bold text-primary">{selectedCandidate.matchScore}/10</div>
                     <span className="text-xs text-gray-400">AI Match Score</span>
                  </div>
               </div>

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
                     <label className="font-semibold text-gray-700">Status</label>
                     <p className={selectedCandidate.status === "Rejected" ? "text-red-600 font-bold" : "text-gray-900"}>
                        {selectedCandidate.status}
                        {selectedCandidate.rejectedRound && <span className="text-gray-500 font-normal ml-1">({selectedCandidate.rejectedRound})</span>}
                     </p>
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
                       <a href={selectedCandidate.cvLink} target="_blank" rel="noopener noreferrer">Original CV</a>
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
