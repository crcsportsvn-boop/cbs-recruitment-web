"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

export interface CandidateData {
  id: number;
  dataSource?: "HO" | "ST";
  sheetId?: string;
  matchScore: string;
  timestamp?: string;
  positionRaw: string;
  source?: string;
  jobCode?: string;
  positionId?: string;
  fullName: string;
  yob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  location?: string;
  degree?: string;
  education?: string;
  jobFunction?: string;
  skills?: string;
  certification?: string;
  workHistory?: string;
  summary?: string;
  matchReason?: string;
  cvLink?: string;
  notes?: string;
  isPotential?: boolean;
  status: string;
  failureReason?: string;
  testResult?: string;
  hrInterviewDate?: string;
  interviewDate1?: string;
  interviewDate2?: string;
  offerDate?: string;
  startDate?: string;
  officialDate?: string;
  rejectedRound?: string;
  rejectedReason?: string;
  applyDate?: string;
  [key: string]: any;
}

export interface JobData {
  positionId?: string;
  jobCode: string;
  title?: string;
  group?: string;
  status: string;
  stopDate?: string;
  reason?: string;
}

interface RecruitmentContextType {
  candidates: CandidateData[];
  setCandidates: React.Dispatch<React.SetStateAction<CandidateData[]>>;
  jobs: JobData[];
  jobMap: Record<string, JobData>;
  setJobs: React.Dispatch<React.SetStateAction<JobData[]>>;
  loading: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  refreshData: (forceSync?: boolean) => Promise<void>;
  updateCandidateInCache: (id: number | string, updates: any) => void;
  updateJobInCache: (jobCode: string, updates: Partial<JobData>) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | null>(null);

export function RecruitmentProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const hasInitialFetched = useRef(false);

  const jobMap = useMemo(() => {
    const map: Record<string, JobData> = {};
    jobs.forEach((j) => {
      if (j.jobCode) {
        map[j.jobCode] = j;
      }
    });
    return map;
  }, [jobs]);

  const refreshData = useCallback(
    async (forceSync = false) => {
      if (!user) return;
      try {
        if (forceSync) {
          setIsSyncing(true);
        } else {
          setLoading(true);
        }

        const syncParam = forceSync ? `?sync=1&t=${Date.now()}` : "";
        const [candRes, jobRes] = await Promise.all([
          fetch(`/api/candidates${syncParam}`),
          fetch(`/api/jobs${syncParam}`),
        ]);

        if (candRes.ok) {
          const candData = await candRes.json();
          if (candData.candidates && Array.isArray(candData.candidates)) {
            setCandidates(candData.candidates);
          }
        }

        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.jobs && Array.isArray(jobData.jobs)) {
            setJobs(jobData.jobs);
          }
        }

        setLastSynced(new Date());
      } catch (err) {
        console.error("Failed to load recruitment data:", err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [user],
  );

  // Initial fetch once when user is authenticated
  useEffect(() => {
    if (user && !hasInitialFetched.current) {
      hasInitialFetched.current = true;
      refreshData(false);
    }
  }, [user, refreshData]);

  const updateCandidateInCache = useCallback(
    (id: number | string, updates: any) => {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id.toString() === id.toString() ? { ...c, ...updates } : c,
        ),
      );
    },
    [],
  );

  const updateJobInCache = useCallback(
    (jobCode: string, updates: Partial<JobData>) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.jobCode === jobCode ? { ...j, ...updates } : j,
        ),
      );
    },
    [],
  );

  return (
    <RecruitmentContext.Provider
      value={{
        candidates,
        setCandidates,
        jobs,
        jobMap,
        setJobs,
        loading,
        isSyncing,
        lastSynced,
        refreshData,
        updateCandidateInCache,
        updateJobInCache,
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
}

export function useRecruitmentData() {
  const ctx = useContext(RecruitmentContext);
  if (!ctx) {
    throw new Error(
      "useRecruitmentData must be used within a RecruitmentProvider",
    );
  }
  return ctx;
}
