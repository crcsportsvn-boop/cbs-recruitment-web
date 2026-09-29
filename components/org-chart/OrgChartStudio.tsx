"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  OrgNode,
  IndirectLink,
  CustomDivider,
  CustomNote,
  ViewTemplate,
  DensityMode,
  VirtualLeader,
  HeadcountSummary,
  OrgProposalState,
  OrgChartMode,
  ProposalChange,
  ProposalJustificationRow,
  N1BoxesConfig,
  DEFAULT_N1_BOXES_CONFIG,
  CustomBoxGroup
} from '@/types/org-chart';
import { AnchorPosition } from './OrgNodeCard';
import { parseOrgChartWorkbook } from '@/lib/org-chart/excel-parser';
import { buildOrgLayout, calculateHeadcountSummary, calculateOrgDiff } from '@/lib/org-chart/graph-builder';
import { exportToPDF, exportToImage, exportProposalExcel, exportProposalJSON, importProposalJSON } from '@/lib/org-chart/export-service';
import { DEFAULT_VIRTUAL_LEADERS, DEFAULT_INDIRECT_LINKS } from '@/lib/org-chart/default-config';
import { DEFAULT_OFFICE_NODES, DEFAULT_OFFICE_DIVISIONS } from '@/lib/org-chart/default-office-data';
import { ProposalToolbar } from './ProposalToolbar';
import { OrgCanvas } from './OrgCanvas';
import { DivisionSummaryTable } from './DivisionSummaryTable';
import { PillarPill, Headcount3YRow } from '@/lib/org-chart/department-blueprints';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Info, Sparkles, GitCompare, Loader2, RotateCcw, Settings, Plus, Pencil } from 'lucide-react';

const PROPOSAL_DRAFT_KEY = 'cbs_org_proposal_draft_v1';

interface OrgChartStudioProps {
  lang?: 'vi' | 'en';
  user?: any;
}

export default function OrgChartStudio({ lang = 'en', user }: OrgChartStudioProps) {
  // Primary Navigation & View States
  const [template, setTemplate] = useState<ViewTemplate>('company_n1');
  const [selectedDivision, setSelectedDivision] = useState<string>('Crocs');
  const [densityMode, setDensityMode] = useState<DensityMode>('full');
  const [showNicknames, setShowNicknames] = useState<boolean>(true);
  const [showSumUpTable, setShowSumUpTable] = useState<boolean>(false);

  // 3-Way Mode: 'current' (As-Is baseline) | 'proposal' (To-Be authoring) | 'diff' (Comparison visual)
  const [mode, setMode] = useState<OrgChartMode>('current');

  // Baseline "Current / As-Is" Store (Loaded from Excel or default seed)
  const [currentNodes, setCurrentNodes] = useState<OrgNode[]>(DEFAULT_OFFICE_NODES);
  const [currentVirtualLeaders, setCurrentVirtualLeaders] = useState<VirtualLeader[]>(DEFAULT_VIRTUAL_LEADERS);
  const [currentIndirect, setCurrentIndirect] = useState<IndirectLink[]>(DEFAULT_INDIRECT_LINKS);
  const [divisions, setDivisions] = useState<string[]>(DEFAULT_OFFICE_DIVISIONS);
  const [totalOfficeCount, setTotalOfficeCount] = useState<number>(DEFAULT_OFFICE_NODES.length);

  // Working "Proposal / To-Be" Store
  const [proposalNodes, setProposalNodes] = useState<OrgNode[]>(() => {
    // Clone baseline nodes for initial proposal state
    return JSON.parse(JSON.stringify(DEFAULT_OFFICE_NODES));
  });
  const [proposalVirtualLeaders, setProposalVirtualLeaders] = useState<VirtualLeader[]>(DEFAULT_VIRTUAL_LEADERS);
  const [proposalIndirect, setProposalIndirect] = useState<IndirectLink[]>(DEFAULT_INDIRECT_LINKS);
  const [dividers, setDividers] = useState<CustomDivider[]>([]);
  const [notes, setNotes] = useState<CustomNote[]>([]);
  const [justificationRows, setJustificationRows] = useState<ProposalJustificationRow[]>([]);

  // Canvas Layout State
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [indirectLinks, setIndirectLinks] = useState<IndirectLink[]>([]);
  const [canvasWidth, setCanvasWidth] = useState<number>(1450);
  const [canvasHeight, setCanvasHeight] = useState<number>(800);
  const [summary, setSummary] = useState<HeadcountSummary>({
    totalSeats: 0,
    occupied: 0,
    vacant: 0,
    newHireBP: 0,
    replacement: 0,
    plannedTotal: 0
  });

  // Collapsible Nodes State
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  // Department Slide Blueprint Elements
  const [pillarPills, setPillarPills] = useState<PillarPill[]>([]);
  const [headcount3Y, setHeadcount3Y] = useState<Headcount3YRow[]>([]);
  const [slideTitle, setSlideTitle] = useState<string>('');
  const [hasCRVShared, setHasCRVShared] = useState<boolean>(false);

  // Interactive 4-Anchor Connection Mode
  const [connectingSource, setConnectingSource] = useState<{ node: OrgNode; anchor: AnchorPosition } | null>(null);

  // Modal State
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editingDivider, setEditingDivider] = useState<CustomDivider | null>(null);
  const [isDividerDialogOpen, setIsDividerDialogOpen] = useState<boolean>(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState<boolean>(false);
  const [noteInputText, setNoteInputText] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Upload Feedback Modal & Loading State
  const [uploadSuccessModal, setUploadSuccessModal] = useState<{
    fileName: string;
    officeCount: number;
    leadersCount: number;
    linksCount: number;
    divisionsCount: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('Đang xử lý...');
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);

  // Multi-proposal state (1 to 5)
  const [activeProposalId, setActiveProposalId] = useState<number>(1);
  const [unlockedProposalCount, setUnlockedProposalCount] = useState<number>(1);
  const [proposalNames, setProposalNames] = useState<Record<number, string>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('cbs_org_proposal_names') : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 1: 'Đề Xuất 1', 2: 'Đề Xuất 2', 3: 'Đề Xuất 3', 4: 'Đề Xuất 4', 5: 'Đề Xuất 5' };
  });
  const [proposalsCache, setProposalsCache] = useState<Record<number, OrgNode[]>>({});

  // Rename Proposal Dialog State
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<string>('');

  // N-1 Box Groups & Text Config State
  const [n1BoxesConfig, setN1BoxesConfig] = useState<N1BoxesConfig>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('cbs_n1_boxes_config') : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_N1_BOXES_CONFIG;
  });
  // Add Box Group Dialog State (N-1)
  const [isAddBoxGroupDialogOpen, setIsAddBoxGroupDialogOpen] = useState<boolean>(false);
  const [newBoxTitle, setNewBoxTitle] = useState<string>('');
  const [newBoxNote, setNewBoxNote] = useState<string>('');
  const [newBoxColor, setNewBoxColor] = useState<'blue' | 'slate' | 'emerald' | 'amber' | 'purple'>('slate');
  const [newBoxWidth, setNewBoxWidth] = useState<number>(380);
  const [newBoxHeight, setNewBoxHeight] = useState<number>(280);

  // Single Box Config Dialog State (per-box editing: brand | ssp | coe | crv | custom box)
  const [isSingleBoxDialogOpen, setIsSingleBoxDialogOpen] = useState<boolean>(false);
  const [editingBoxKey, setEditingBoxKey] = useState<string | null>(null);
  const [singleBoxDraft, setSingleBoxDraft] = useState<{
    title: string;
    note: string;
    width: number;
    height: number;
    color?: 'blue' | 'slate' | 'emerald' | 'amber' | 'purple';
  }>({ title: '', note: '', width: 0, height: 0, color: 'slate' });

  // New Proposal Division Dialog State
  const [isAddDivisionDialogOpen, setIsAddDivisionDialogOpen] = useState<boolean>(false);
  const [newDivisionName, setNewDivisionName] = useState<string>('');
  const [newDivisionHeadTitle, setNewDivisionHeadTitle] = useState<string>('Brand Manager');
  const [newDivisionHeadNickname, setNewDivisionHeadNickname] = useState<string>('');
  const [newDivisionReportsToId, setNewDivisionReportsToId] = useState<string>('');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Compute Diff Changes dynamically between Current and Proposal
  const diffList = useMemo(() => {
    return calculateOrgDiff(currentNodes, proposalNodes);
  }, [currentNodes, proposalNodes]);

  const diffMap = useMemo(() => {
    return new Map(diffList.map(d => [d.nodeId, d]));
  }, [diffList]);

  // Trigger Layout generation based on Active Mode
  const applyLayout = (
    targetMode: OrgChartMode,
    tpl: ViewTemplate,
    activeDiv?: string,
    collapsedSet: Set<string> = collapsedNodeIds,
    overrideNodes?: OrgNode[],
    overrideLeaders?: VirtualLeader[],
    overrideIndirect?: IndirectLink[]
  ) => {
    const isCurrent = targetMode === 'current';
    const activeNodes = overrideNodes ?? (isCurrent ? currentNodes : proposalNodes);
    const activeLeaders = overrideLeaders ?? (isCurrent ? currentVirtualLeaders : proposalVirtualLeaders);
    const activeIndirect = overrideIndirect ?? (isCurrent ? currentIndirect : proposalIndirect);

    const layout = buildOrgLayout(
      tpl,
      activeNodes,
      activeLeaders,
      activeIndirect,
      activeDiv || selectedDivision,
      collapsedSet,
      overrideNodes,
      overrideLeaders,
      overrideIndirect
    );
    setNodes(layout.nodes);
    setIndirectLinks(layout.indirectLinks);
    if (tpl === 'company_n1') {
      setDividers(layout.dividers);
    } else {
      setDividers([]);
    }
    setNotes(layout.notes);
    setCanvasWidth(layout.canvasWidth);
    setCanvasHeight(layout.canvasHeight);
    setSummary(layout.summary);
    setPillarPills(layout.pillarPills || []);
    setHeadcount3Y(layout.headcount3Y || []);
    setSlideTitle(layout.slideTitle || '');
    setHasCRVShared(!!layout.hasCRVShared);
  };

  // Helper to sync nodes back to Google Sheet HO (org-asis, specific org-propose, or both)
  const syncToGoogleSheets = async (
    target: 'asis' | 'propose' | 'both',
    nodesToSync: OrgNode[],
    propId: number = activeProposalId
  ) => {
    try {
      setIsSyncingSheet(true);
      const res = await fetch('/api/org-chart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, proposalId: propId, nodes: nodesToSync })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi ghi dữ liệu lên hệ thống');
      }
      notify('success', `Đã lưu thành công ${nodesToSync.length} vị trí lên hệ thống!`);
      return true;
    } catch (err: any) {
      console.error('syncToGoogleSheets error:', err);
      notify('error', `Lỗi lưu dữ liệu: ${err.message || 'Không thể kết nối'}`);
      return false;
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleSyncGoogleSheet = () => {
    syncToGoogleSheets('propose', proposalNodes, activeProposalId);
  };

  // Switch between Proposal 1 to 5
  const handleSelectProposal = (targetId: number) => {
    if (targetId === activeProposalId && mode === 'proposal') return;

    // Cache current working proposal before switching
    setProposalsCache(prev => ({ ...prev, [activeProposalId]: proposalNodes }));

    const cached = proposalsCache[targetId];
    const targetNodes: OrgNode[] = cached && cached.length > 0 ? cached : JSON.parse(JSON.stringify(currentNodes));

    setActiveProposalId(targetId);
    if (unlockedProposalCount < targetId) {
      setUnlockedProposalCount(targetId);
    }
    setProposalNodes(targetNodes);
    setMode('proposal');

    applyLayout('proposal', template, selectedDivision, collapsedNodeIds, targetNodes);
    notify('info', `Đang làm việc trên ${proposalNames[targetId] || `Đề Xuất ${targetId}`}`);
  };

  // Add next proposal (up to 5)
  const handleAddNewProposal = () => {
    if (unlockedProposalCount >= 5) {
      notify('info', 'Đã đạt tối đa 5 phương án đề xuất.');
      return;
    }
    const nextId = unlockedProposalCount + 1;
    setUnlockedProposalCount(nextId);
    handleSelectProposal(nextId);
    notify('success', `Đã mở ${proposalNames[nextId] || `Đề Xuất ${nextId}`}.`);
  };

  // Open rename dialog for currently active proposal
  const handleOpenRenameDialog = () => {
    setRenameInput(proposalNames[activeProposalId] || `Đề Xuất ${activeProposalId}`);
    setIsRenameDialogOpen(true);
  };

  // Save renamed proposal
  const handleSaveProposalName = () => {
    const trimmed = renameInput.trim();
    if (!trimmed) return;
    const updated = { ...proposalNames, [activeProposalId]: trimmed };
    setProposalNames(updated);
    try {
      localStorage.setItem('cbs_org_proposal_names', JSON.stringify(updated));
    } catch (e) {}
    setIsRenameDialogOpen(false);
    notify('success', `Đã đổi tên Đề Xuất ${activeProposalId} thành "${trimmed}"`);
  };

  // Copy current As-Is baseline into active Proposal
  const handleCopyAsIsToProposal = () => {
    const cloned = JSON.parse(JSON.stringify(currentNodes));
    setProposalNodes(cloned);
    setProposalsCache(prev => ({ ...prev, [activeProposalId]: cloned }));
    applyLayout('proposal', template, selectedDivision, collapsedNodeIds, cloned);
    notify('success', `Đã sao chép toàn bộ cơ cấu Hiện Tại sang ${proposalNames[activeProposalId] || `Đề Xuất ${activeProposalId}`}!`);
  };

  const handleRefreshFromSheet = async () => {
    try {
      setIsSyncingSheet(true);
      const res = await fetch('/api/org-chart/sync');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi đọc dữ liệu từ hệ thống');
      }
      const data = await res.json();
      if (data.success && data.hasAsis) {
        const asisNodes: OrgNode[] = data.asis;
        const proposalsMap: Record<number, OrgNode[]> = data.proposals || {};

        const divSet = new Set<string>();
        asisNodes.forEach(n => {
          if (n.division) divSet.add(n.division);
        });
        const sheetDivisions = Array.from(divSet);

        setCurrentNodes(asisNodes);
        if (sheetDivisions.length > 0) {
          setDivisions(sheetDivisions);
        }
        setTotalOfficeCount(asisNodes.length);

        setProposalsCache(proposalsMap);

        // Find max unlocked proposal from sheets
        let maxUnlocked = 1;
        for (let i = 1; i <= 5; i++) {
          const p = proposalsMap[i];
          if (p && p.length > 0) {
            maxUnlocked = Math.max(maxUnlocked, i);
          }
        }
        setUnlockedProposalCount(maxUnlocked);

        const activeP = proposalsMap[activeProposalId];
        const prop1 = proposalsMap[1];
        const currentActiveNodes: OrgNode[] =
          activeP && activeP.length > 0
            ? activeP
            : (prop1 && prop1.length > 0 ? prop1 : asisNodes);

        setProposalNodes(currentActiveNodes);

        const targetDiv = sheetDivisions.includes(selectedDivision) ? selectedDivision : sheetDivisions[0] || 'Crocs';
        setSelectedDivision(targetDiv);

        applyLayout(
          mode,
          template,
          targetDiv,
          collapsedNodeIds,
          mode === 'current' ? asisNodes : currentActiveNodes
        );

        notify('success', `Đã đồng bộ ${asisNodes.length} vị trí từ hệ thống!`);
      } else {
        notify('info', 'Hệ thống chưa có dữ liệu lưu trữ.');
      }
    } catch (err: any) {
      console.error('Refresh from sheet error:', err);
      notify('error', `Lỗi đồng bộ dữ liệu: ${err.message || 'Không thể kết nối'}`);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Initial layout generation and data restoration on mount (checks Google Sheets HO first, then localStorage)
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      // 1. Try reading live data from Google Sheet HO
      try {
        const res = await fetch('/api/org-chart/sync');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.hasAsis) {
            const asisNodes: OrgNode[] = data.asis;
            const proposalsMap: Record<number, OrgNode[]> = data.proposals || {};

            const divSet = new Set<string>();
            asisNodes.forEach(n => {
              if (n.division) divSet.add(n.division);
            });
            const sheetDivisions = Array.from(divSet);

            setCurrentNodes(asisNodes);
            if (sheetDivisions.length > 0) {
              setDivisions(sheetDivisions);
            }
            setTotalOfficeCount(asisNodes.length);

            setProposalsCache(proposalsMap);

            // Determine how many proposals exist on sheets
            let maxUnlocked = 1;
            for (let i = 1; i <= 5; i++) {
              const p = proposalsMap[i];
              if (p && p.length > 0) {
                maxUnlocked = Math.max(maxUnlocked, i);
              }
            }
            setUnlockedProposalCount(maxUnlocked);

            const prop1 = proposalsMap[1];
            const activeNodes: OrgNode[] = prop1 && prop1.length > 0 ? prop1 : asisNodes;
            setProposalNodes(activeNodes);

            const targetDiv = sheetDivisions.includes(selectedDivision) ? selectedDivision : sheetDivisions[0] || 'Crocs';
            setSelectedDivision(targetDiv);

            applyLayout(
              mode,
              template,
              targetDiv,
              collapsedNodeIds,
              mode === 'current' ? asisNodes : activeNodes
            );
            notify('success', `Đã nạp dữ liệu từ hệ thống (${asisNodes.length} ghế, ${maxUnlocked} đề xuất).`);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not load initial data from Google Sheet HO:', e);
      }

      // 2. Fallback to localStorage draft
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(PROPOSAL_DRAFT_KEY) : null;
        if (saved && isMounted) {
          const draft: OrgProposalState = JSON.parse(saved);
          if (draft && Array.isArray(draft.nodes) && draft.nodes.length > 0) {
            setProposalNodes(draft.nodes);
            if (draft.indirectLinks) setProposalIndirect(draft.indirectLinks);
            if (draft.dividers) setDividers(draft.dividers);
            if (draft.notes) setNotes(draft.notes);
            if (draft.justificationRows) setJustificationRows(draft.justificationRows);
            if (draft.template) setTemplate(draft.template);
            if (draft.selectedDivision) setSelectedDivision(draft.selectedDivision);
            // Keep default mode as 'current' (as-is) per user requirement
            setMode('current');
            applyLayout('current', draft.template || template, draft.selectedDivision || selectedDivision, collapsedNodeIds);
            notify('info', 'Đã nạp bản nháp đề xuất vào bộ nhớ. View mặc định là Hiện Tại (As-Is).');
            return;
          }
        }
      } catch (e) {
        console.warn('Could not restore proposal draft from localStorage:', e);
      }

      // 3. Fallback to seed default layout
      if (isMounted) {
        applyLayout(mode, template, selectedDivision, collapsedNodeIds);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for Escape key to cancel connecting mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectingSource) {
        setConnectingSource(null);
        notify('info', 'Đã hủy thao tác nối đường báo cáo');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectingSource]);

  // Show temporary feedback alerts
  const notify = (type: 'success' | 'info' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  // Switch Active Mode (Current / Proposal / Diff)
  const handleModeChange = (newMode: OrgChartMode) => {
    setMode(newMode);
    applyLayout(newMode, template, selectedDivision, collapsedNodeIds);
    if (newMode === 'current') {
      notify('info', 'Đang xem Cơ cấu Tổ chức Hiện tại (Baseline từ Excel).');
    } else if (newMode === 'proposal') {
      notify('success', 'Chuyển sang Chế độ Đề xuất (Proposal) - Bạn có thể thêm ghế và chỉnh sửa.');
    } else {
      notify('info', `Chế độ So Sánh Diff: Đang làm nổi bật ${diffList.length} vị trí có thay đổi.`);
    }
  };

  // Create or start proposal from current baseline
  const handleCreateProposal = () => {
    setMode('proposal');
    applyLayout('proposal', template, selectedDivision, collapsedNodeIds);
    notify('success', 'Đã mở chế độ lập đề xuất. Bạn có thể thêm ghế mới hoặc điều chỉnh phân cấp!');
  };

  // Handle Excel File Upload (Updates Current baseline!)
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgressText(`Đang đọc file ${file.name}...`);
    try {
      // Yield to the browser/event loop so React renders the loading indicator immediately
      await new Promise(resolve => setTimeout(resolve, 80));

      const buffer = await file.arrayBuffer();

      setUploadProgressText('Đang phân tích dữ liệu nhân sự và các phòng ban...');
      await new Promise(resolve => setTimeout(resolve, 40));

      const parsed = parseOrgChartWorkbook(buffer);

      // 1. Update Current Baseline states
      setCurrentNodes(parsed.nodes);
      setCurrentVirtualLeaders(parsed.virtualLeaders);
      setCurrentIndirect(parsed.indirectLinks);
      if (parsed.divisions.length > 0) {
        setDivisions(parsed.divisions);
      }
      setTotalOfficeCount(parsed.officeRows);

      const targetDiv = parsed.divisions.includes(selectedDivision) ? selectedDivision : parsed.divisions[0] || 'Crocs';
      setSelectedDivision(targetDiv);

      // 2. Reapply layout if currently in 'current' mode
      setUploadProgressText('Đang tính toán sơ đồ tổ chức và hoàn tất cập nhật...');
      await new Promise(resolve => setTimeout(resolve, 40));

      if (mode === 'current') {
        applyLayout(
          'current',
          template,
          targetDiv,
          collapsedNodeIds,
          parsed.nodes,
          parsed.virtualLeaders,
          parsed.indirectLinks
        );
      }

      // Brief delay to allow canvas render to complete before dismissing the loading indicator
      await new Promise(resolve => setTimeout(resolve, 150));

      // 3. Write back ONLY to Google Sheets HO org-asis (keeps propose intact!)
      setUploadProgressText('Đang lưu trữ dữ liệu vào hệ thống...');
      await syncToGoogleSheets('asis', parsed.nodes);

      setIsUploading(false);

      setUploadSuccessModal({
        fileName: file.name,
        officeCount: parsed.officeRows,
        leadersCount: parsed.virtualLeaders.length,
        linksCount: parsed.indirectLinks.length,
        divisionsCount: parsed.divisions.length
      });

      notify('success', `Đã cập nhật cơ cấu Hiện Tại từ file Excel ${file.name} và lưu lên sheet org-asis! Bản Đề Xuất được giữ nguyên.`);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      setIsUploading(false);
      notify('error', 'Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file .xlsm / .xlsx.');
    }
  };

  // Handle Template change (Organization N-1 vs Division)
  const handleTemplateChange = (newTemplate: ViewTemplate) => {
    setTemplate(newTemplate);
    applyLayout(mode, newTemplate, selectedDivision, collapsedNodeIds);
  };

  // Handle Division change
  const handleDivisionChange = (newDivision: string) => {
    setSelectedDivision(newDivision);
    setTemplate('custom_division');
    applyLayout(mode, 'custom_division', newDivision, collapsedNodeIds);
  };

  // Toggle Subtree Expand / Collapse
  const handleToggleCollapse = (nodeId: string) => {
    setCollapsedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      applyLayout(mode, template, selectedDivision, next);
      return next;
    });
  };

  // Helper to detect circular reporting hierarchy
  const isCircularReporting = (targetParentId: string, movingNodeId: string, nodePool: OrgNode[]): boolean => {
    let curr = nodePool.find(n => n.id === targetParentId);
    const visited = new Set<string>();
    while (curr && curr.reportsToId) {
      if (curr.reportsToId === movingNodeId) return true;
      if (visited.has(curr.reportsToId)) break;
      visited.add(curr.reportsToId);
      curr = nodePool.find(n => n.id === curr!.reportsToId);
    }
    return false;
  };

  // Start 4-Anchor Connection
  const handleStartConnect = (node: OrgNode, anchor: AnchorPosition) => {
    if (mode === 'current') {
      notify('info', 'Vui lòng chuyển sang tab Đề xuất (Proposal) để tạo liên kết mới.');
      return;
    }
    setConnectingSource({ node, anchor });
    notify('info', `Đang nối từ [${node.title}] (${anchor}). Nhấp vào ghế đích để liên kết.`);
  };

  // Complete Connection to Target Node
  const handleCompleteConnect = (targetNode: OrgNode) => {
    if (!connectingSource || mode === 'current') return;
    const { node: sourceNode, anchor } = connectingSource;

    if (sourceNode.id === targetNode.id) {
      setConnectingSource(null);
      return;
    }

    if (anchor === 'bottom') {
      // sourceNode is parent, targetNode is child
      if (isCircularReporting(sourceNode.id, targetNode.id, proposalNodes)) {
        notify('error', 'Lỗi lặp vòng: Không thể chọn cấp dưới làm sếp quản lý!');
        setConnectingSource(null);
        return;
      }
      const updated = proposalNodes.map(n =>
        n.id === targetNode.id ? { ...n, reportsToId: sourceNode.id, reportsToTitle: sourceNode.title } : n
      );
      setProposalNodes(updated);
      applyLayout('proposal', template, selectedDivision, collapsedNodeIds);
      notify('success', `Đã liên kết: [${targetNode.title}] báo cáo trực tiếp cho [${sourceNode.title}]`);
    } else if (anchor === 'top') {
      // targetNode is parent, sourceNode is child
      if (isCircularReporting(targetNode.id, sourceNode.id, proposalNodes)) {
        notify('error', 'Lỗi lặp vòng: Không thể chọn cấp dưới làm sếp quản lý!');
        setConnectingSource(null);
        return;
      }
      const updated = proposalNodes.map(n =>
        n.id === sourceNode.id ? { ...n, reportsToId: targetNode.id, reportsToTitle: targetNode.title } : n
      );
      setProposalNodes(updated);
      applyLayout('proposal', template, selectedDivision, collapsedNodeIds);
      notify('success', `Đã liên kết: [${sourceNode.title}] báo cáo trực tiếp cho [${targetNode.title}]`);
    } else {
      const newIndirect: IndirectLink = {
        id: `ind_anchor_${Date.now()}`,
        fromId: sourceNode.id,
        toId: targetNode.id,
        label: 'Tuyến ma trận',
        style: 'dashed'
      };
      setProposalIndirect(prev => [...prev, newIndirect]);
      notify('success', `Đã tạo liên kết ma trận nét đứt giữa [${sourceNode.title}] và [${targetNode.title}]`);
    }

    setConnectingSource(null);
  };

  // Cancel Connection
  const handleCancelConnect = () => {
    setConnectingSource(null);
  };

  // Move Node on Canvas
  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    if (mode === 'current') return;
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, x, y } : n)));
    setProposalNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, x, y } : n)));
  };

  // Move Note on Canvas
  const handleNoteMove = (noteId: string, x: number, y: number) => {
    if (mode === 'current') return;
    setNotes(prev => prev.map(n => (n.id === noteId ? { ...n, x, y } : n)));
  };

  // Move Divider on Canvas
  const handleDividerMove = (dividerId: string, position: number) => {
    if (mode === 'current') return;
    setDividers(prev => prev.map(d => (d.id === dividerId ? { ...d, position } : d)));
  };

  // Update Note Text inline
  const handleNoteChange = (noteId: string, text: string) => {
    setNotes(prev => prev.map(n => (n.id === noteId ? { ...n, text } : n)));
    notify('success', 'Đã cập nhật ghi chú');
  };

  // Toggle Node Status
  const handleNodeToggleStatus = (node: OrgNode) => {
    if (mode === 'current') {
      notify('info', 'Vui lòng chuyển sang tab Đề xuất (Proposal) để chỉnh sửa trạng thái ghế.');
      return;
    }
    const nextStatusMap: Record<string, 'active' | 'new_hire' | 'replace'> = {
      active: 'new_hire',
      new_hire: 'replace',
      replace: 'active',
      vacant: 'new_hire',
      highlight: 'new_hire'
    };

    const nextStatus = nextStatusMap[node.status] || 'active';
    const updated = proposalNodes.map(n =>
      n.id === node.id
        ? {
            ...n,
            status: nextStatus,
            customLabel: nextStatus === 'new_hire' ? 'New Hire BP' : nextStatus === 'replace' ? 'Replace' : undefined
          }
        : n
    );

    setProposalNodes(updated);
    applyLayout(mode, template, selectedDivision, collapsedNodeIds);
  };

  // Delete Node
  const handleNodeDelete = (nodeId: string) => {
    if (mode === 'current') {
      notify('info', 'Không thể xóa ghế trong cơ cấu Hiện tại (Baseline).');
      return;
    }
    const updated = proposalNodes.filter(n => n.id !== nodeId);
    setProposalNodes(updated);
    applyLayout(mode, template, selectedDivision, collapsedNodeIds);
    notify('info', 'Đã gỡ bỏ ghế khỏi sơ đồ đề xuất');
  };

  // Add Proposal Node
  const handleAddNode = (type: 'standard' | 'new_hire' | 'replace') => {
    if (mode === 'current') {
      setMode('proposal');
    }
    const id = `proposal_pos_${Date.now()}`;
    const isNew = type === 'new_hire';
    const isRep = type === 'replace';

    const targetDiv = template === 'company_n1' ? 'Crocs' : selectedDivision || 'Crocs';

    let defaultParent: OrgNode | undefined;
    if (selectedNode && proposalNodes.some(n => n.id === selectedNode.id && !n.isSupervisor)) {
      defaultParent = selectedNode;
    } else {
      defaultParent =
        proposalNodes.find(n => n.division === targetDiv && (n.title.toLowerCase().includes('head') || n.title.toLowerCase().includes('manager'))) ||
        proposalNodes[0];
    }

    const newNode: OrgNode = {
      id,
      title: isNew ? 'Vị Trí Mới (New Hire BP)' : isRep ? 'Vị Trí Thay Thế (Replace)' : 'Vị Trí Mới',
      nickname: isNew ? 'New Hire BP' : isRep ? 'Replace' : 'Nhân Sự Mới',
      division: targetDiv,
      dept: defaultParent?.dept || targetDiv,
      reportsToId: defaultParent ? defaultParent.id : undefined,
      reportsToTitle: defaultParent ? defaultParent.title : undefined,
      flags: ['VN'],
      status: type === 'new_hire' ? 'new_hire' : type === 'replace' ? 'replace' : 'active',
      customLabel: isNew ? 'New Hire BP' : isRep ? 'Replace' : undefined
    };

    const updated = [...proposalNodes, newNode];
    setProposalNodes(updated);
    applyLayout('proposal', template, selectedDivision, collapsedNodeIds);

    setSelectedNode(newNode);
    setIsEditDialogOpen(true);
    notify('success', `Đã thêm vị trí đề xuất [${newNode.title}]!`);
  };

  // Add direct child position under specific parent node
  const handleNodeAddChild = (parentNode: OrgNode) => {
    if (mode === 'current') {
      setMode('proposal');
    }
    const id = `proposal_pos_${Date.now()}`;
    const newNode: OrgNode = {
      id,
      title: 'Vị Trí Mới',
      nickname: 'Nhân Sự Mới',
      division: parentNode.division || selectedDivision || 'Crocs',
      dept: parentNode.dept || parentNode.division || 'Phòng Ban',
      reportsToId: parentNode.id,
      reportsToTitle: parentNode.title,
      flags: ['VN'],
      status: 'new_hire',
      customLabel: 'New Hire BP'
    };

    const updated = [...proposalNodes, newNode];
    setProposalNodes(updated);
    applyLayout('proposal', template, selectedDivision, collapsedNodeIds, updated);

    setSelectedNode(newNode);
    setIsEditDialogOpen(true);
    notify('success', `Đã thêm ghế mới dưới quyền quản lý trực tiếp của [${parentNode.title}]!`);
  };

  // Open Single N-1 Box Group Config
  const handleOpenBoxConfig = (boxKey: string) => {
    setEditingBoxKey(boxKey);
    let title = '';
    let note = '';
    let width = 0;
    let height = 0;
    let color: 'blue' | 'slate' | 'emerald' | 'amber' | 'purple' = 'slate';

    if (boxKey === 'brand') {
      title = 'Khối Thương Hiệu (Brand Organization)';
      note = n1BoxesConfig.brandNote || '';
      width = n1BoxesConfig.brandWidth || 740;
      height = n1BoxesConfig.brandHeight || 380;
      color = 'blue';
    } else if (boxKey === 'ssp') {
      title = 'Khối Supersports (SSP)';
      note = n1BoxesConfig.sspNote || '';
      width = n1BoxesConfig.sspWidth || 200;
      height = n1BoxesConfig.sspHeight || 380;
      color = 'blue';
    } else if (boxKey === 'coe') {
      title = n1BoxesConfig.coeTitle || 'COE & FUNCTIONAL TEAMS (CBS)';
      note = n1BoxesConfig.coeNote || '';
      width = n1BoxesConfig.coeWidth || 610;
      height = n1BoxesConfig.coeHeight || 380;
      color = 'slate';
    } else if (boxKey === 'crv') {
      title = n1BoxesConfig.crvTitle || 'CRV SUPPORTING FUNCTIONS';
      note = n1BoxesConfig.crvNote || '';
      width = n1BoxesConfig.crvWidth || 430;
      height = n1BoxesConfig.crvHeight || 380;
      color = 'slate';
    } else {
      // Custom box group
      const custom = (n1BoxesConfig.customBoxes || []).find(b => b.id === boxKey);
      if (custom) {
        title = custom.title || '';
        note = custom.note || '';
        width = custom.width || 380;
        height = custom.height || 280;
        color = custom.color || 'slate';
      }
    }

    setSingleBoxDraft({ title, note, width, height, color });
    setIsSingleBoxDialogOpen(true);
  };

  // Save Single N-1 Box Group Config
  const handleSaveSingleBox = () => {
    if (!editingBoxKey) return;
    setN1BoxesConfig(prev => {
      const next = { ...prev };
      if (editingBoxKey === 'brand') {
        next.brandNote = singleBoxDraft.note;
        next.brandWidth = singleBoxDraft.width;
        next.brandHeight = singleBoxDraft.height;
      } else if (editingBoxKey === 'ssp') {
        next.sspNote = singleBoxDraft.note;
        next.sspWidth = singleBoxDraft.width;
        next.sspHeight = singleBoxDraft.height;
      } else if (editingBoxKey === 'coe') {
        next.coeTitle = singleBoxDraft.title;
        next.coeNote = singleBoxDraft.note;
        next.coeWidth = singleBoxDraft.width;
        next.coeHeight = singleBoxDraft.height;
      } else if (editingBoxKey === 'crv') {
        next.crvTitle = singleBoxDraft.title;
        next.crvNote = singleBoxDraft.note;
        next.crvWidth = singleBoxDraft.width;
        next.crvHeight = singleBoxDraft.height;
      } else {
        // Custom box group
        next.customBoxes = (next.customBoxes || []).map(b => {
          if (b.id === editingBoxKey) {
            return {
              ...b,
              title: singleBoxDraft.title,
              note: singleBoxDraft.note,
              width: singleBoxDraft.width,
              height: singleBoxDraft.height,
              color: singleBoxDraft.color,
            };
          }
          return b;
        });
      }
      try {
        localStorage.setItem('cbs_n1_boxes_config', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setIsSingleBoxDialogOpen(false);
    notify('success', 'Đã lưu cấu hình ô nhóm thành công!');
  };

  // Handle Box Drag Resize
  const handleBoxResize = (boxKey: string, width: number, height: number) => {
    setN1BoxesConfig(prev => {
      const next = { ...prev };
      if (boxKey === 'brand') {
        next.brandWidth = width;
        next.brandHeight = height;
      } else if (boxKey === 'ssp') {
        next.sspWidth = width;
        next.sspHeight = height;
      } else if (boxKey === 'coe') {
        next.coeWidth = width;
        next.coeHeight = height;
      } else if (boxKey === 'crv') {
        next.crvWidth = width;
        next.crvHeight = height;
      } else {
        next.customBoxes = (next.customBoxes || []).map(b =>
          b.id === boxKey ? { ...b, width, height } : b
        );
      }
      try {
        localStorage.setItem('cbs_n1_boxes_config', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Handle Box Drag Move
  const handleBoxMove = (boxKey: string, x: number, y: number) => {
    setN1BoxesConfig(prev => {
      const next = { ...prev };
      if (boxKey === 'brand') {
        next.brandX = x;
        next.brandY = y;
      } else if (boxKey === 'ssp') {
        next.sspX = x;
        next.sspY = y;
      } else if (boxKey === 'coe') {
        next.coeX = x;
        next.coeY = y;
      } else if (boxKey === 'crv') {
        next.crvX = x;
        next.crvY = y;
      } else {
        next.customBoxes = (next.customBoxes || []).map(b =>
          b.id === boxKey ? { ...b, x, y } : b
        );
      }
      try {
        localStorage.setItem('cbs_n1_boxes_config', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Handle Delete Custom Box Group
  const handleDeleteBox = (boxId: string) => {
    setN1BoxesConfig(prev => {
      const next = {
        ...prev,
        customBoxes: (prev.customBoxes || []).filter(b => b.id !== boxId),
      };
      try {
        localStorage.setItem('cbs_n1_boxes_config', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    notify('success', 'Đã xóa khối ô nhóm thành công!');
  };

  // Open Add Box Group Dialog
  const handleOpenAddBoxGroup = () => {
    setNewBoxTitle('');
    setNewBoxNote('');
    setNewBoxColor('slate');
    setNewBoxWidth(380);
    setNewBoxHeight(280);
    setIsAddBoxGroupDialogOpen(true);
  };

  // Create New Box Group
  const handleCreateBoxGroup = () => {
    const newBox: CustomBoxGroup = {
      id: `box-${Date.now()}`,
      title: newBoxTitle.trim() || 'Khối Nhóm Mới',
      note: newBoxNote.trim() || undefined,
      x: 350,
      y: 350,
      width: Number(newBoxWidth) || 380,
      height: Number(newBoxHeight) || 280,
      color: newBoxColor,
    };

    setN1BoxesConfig(prev => {
      const next = {
        ...prev,
        customBoxes: [...(prev.customBoxes || []), newBox],
      };
      try {
        localStorage.setItem('cbs_n1_boxes_config', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setIsAddBoxGroupDialogOpen(false);
    notify('success', `Đã thêm khối nhóm [${newBox.title}] lên sơ đồ N-1!`);
  };

  // Open Add Division Dialog
  const handleOpenAddDivision = () => {
    setNewDivisionName('');
    setNewDivisionHeadTitle('Brand Manager');
    setNewDivisionHeadNickname('');
    const defaultReports = proposalNodes.find(n => n.title.toLowerCase().includes('ceo') || n.title.toLowerCase().includes('president'));
    setNewDivisionReportsToId(defaultReports ? defaultReports.id : '');
    setIsAddDivisionDialogOpen(true);
  };

  // Create New Proposal Division
  const handleCreateNewDivision = () => {
    const trimmedName = newDivisionName.trim();
    if (!trimmedName) {
      notify('error', 'Vui lòng nhập tên Division mới!');
      return;
    }

    if (mode === 'current') {
      setMode('proposal');
    }

    if (!divisions.includes(trimmedName)) {
      setDivisions(prev => [...prev, trimmedName]);
    }

    const headId = `pos_head_${Date.now()}`;
    const parent = proposalNodes.find(n => n.id === newDivisionReportsToId);
    const newHeadNode: OrgNode = {
      id: headId,
      title: newDivisionHeadTitle.trim() || `Brand Manager ${trimmedName}`,
      nickname: newDivisionHeadNickname.trim() || undefined,
      division: trimmedName,
      dept: trimmedName,
      reportsToId: newDivisionReportsToId || undefined,
      reportsToTitle: parent ? parent.title : undefined,
      flags: ['VN'],
      status: 'new_hire',
      customLabel: 'New Division Head'
    };

    const updated = [...proposalNodes, newHeadNode];
    setProposalNodes(updated);
    setSelectedDivision(trimmedName);
    setTemplate('custom_division');
    applyLayout('proposal', 'custom_division', trimmedName, collapsedNodeIds, updated);
    setIsAddDivisionDialogOpen(false);
    notify('success', `Đã tạo Division đề xuất mới [${trimmedName}]! Bạn có thể thêm các ghế cấp dưới.`);
  };

  // Add Custom Divider
  const handleAddDivider = () => {
    const newDivider: CustomDivider = {
      id: `divider_${Date.now()}`,
      type: 'vertical',
      position: 840,
      labelLeft: 'Brand Organization',
      labelRight: 'Supporting Functions'
    };
    setDividers(prev => [...prev, newDivider]);
    notify('success', 'Đã thêm vạch ngăn phân vùng. Bạn có thể kéo thả để định vị.');
  };

  // Add Custom Note
  const handleAddNote = () => {
    setIsAddNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteInputText.trim()) return;
    const newNote: CustomNote = {
      id: `note_${Date.now()}`,
      text: noteInputText,
      x: 240,
      y: 480,
      isBox: true
    };
    setNotes(prev => [...prev, newNote]);
    setNoteInputText('');
    setIsAddNoteDialogOpen(false);
    notify('success', 'Đã thêm thẻ ghi chú lên canvas');
  };

  // Export handlers
  const handleExportExcel = () => {
    notify('info', 'Đang tạo bảng tính Excel đề xuất kèm sheet Diff và Thuyết minh...');
    try {
      exportProposalExcel(
        proposalNodes,
        summary,
        diffList,
        justificationRows,
        `CBS_Org_Proposal_${template}_${selectedDivision || 'HO'}.xlsx`
      );
      notify('success', 'Xuất file Excel kế hoạch đề xuất thành công!');
    } catch (err) {
      console.error(err);
      notify('error', 'Lỗi xuất file Excel');
    }
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    notify('info', 'Đang tạo tài liệu PDF A4 khổ ngang sắc nét...');
    try {
      await exportToPDF(canvasRef.current, `CBS_Org_Chart_${template}.pdf`, 'a4');
      notify('success', 'Xuất file PDF A4 thành công!');
    } catch (err) {
      console.error(err);
      notify('error', 'Lỗi xuất PDF A4');
    }
  };

  const handleExportPDFA3 = async () => {
    if (!canvasRef.current) return;
    notify('info', 'Đang tạo tài liệu PDF A3 khổ rộng cho phòng ban lớn...');
    try {
      await exportToPDF(canvasRef.current, `CBS_Org_Chart_${template}_A3.pdf`, 'a3');
      notify('success', 'Xuất file PDF A3 khổ rộng thành công!');
    } catch (err) {
      console.error(err);
      notify('error', 'Lỗi xuất PDF A3');
    }
  };

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    notify('info', 'Đang tạo ảnh Ultra-HD PNG (300 DPI) để chèn vào PowerPoint...');
    try {
      await exportToImage(canvasRef.current, `CBS_Org_Chart_${template}.png`);
      notify('success', 'Xuất ảnh PNG Ultra-HD thành công!');
    } catch (err) {
      console.error(err);
      notify('error', 'Lỗi xuất file ảnh');
    }
  };

  // Automatically persist proposal changes to localStorage so user edits are never lost
  useEffect(() => {
    if (mode !== 'proposal') return;

    const timer = setTimeout(() => {
      try {
        const state: OrgProposalState = {
          template,
          selectedDivision,
          nodes: proposalNodes,
          indirectLinks: proposalIndirect,
          dividers,
          notes,
          densityMode,
          showNicknames,
          showSumUpTable,
          showSharedSidebar: true,
          zoomLevel: 1,
          activeMode: mode,
          justificationRows,
          n1BoxesConfig
        };
        localStorage.setItem(PROPOSAL_DRAFT_KEY, JSON.stringify(state));
      } catch (e) {
        // ignore storage quota issues
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [proposalNodes, proposalIndirect, dividers, notes, justificationRows, mode, template, selectedDivision, densityMode, showNicknames, showSumUpTable, n1BoxesConfig]);

  const handleSaveDraft = async () => {
    const state: OrgProposalState = {
      template,
      selectedDivision,
      nodes: proposalNodes,
      indirectLinks: proposalIndirect,
      dividers,
      notes,
      densityMode,
      showNicknames,
      showSumUpTable,
      showSharedSidebar: true,
      zoomLevel: 1,
      activeMode: mode,
      justificationRows,
      n1BoxesConfig
    };
    try {
      localStorage.setItem(PROPOSAL_DRAFT_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    notify('success', 'Đã lưu phương án lên hệ thống thành công!');
    await syncToGoogleSheets('propose', proposalNodes, activeProposalId);
  };

  const handleLoadDraft = async (file: File) => {
    try {
      const state = await importProposalJSON(file);
      setTemplate(state.template);
      if (state.selectedDivision) setSelectedDivision(state.selectedDivision);
      setProposalNodes(state.nodes);
      setProposalIndirect(state.indirectLinks);
      setDividers(state.dividers || []);
      setNotes(state.notes || []);
      setDensityMode(state.densityMode || 'full');
      setShowNicknames(state.showNicknames ?? true);
      setShowSumUpTable(state.showSumUpTable ?? false);
      if (state.justificationRows) setJustificationRows(state.justificationRows);
      if (state.activeMode) setMode(state.activeMode);
      if (state.n1BoxesConfig) setN1BoxesConfig(state.n1BoxesConfig);

      try {
        localStorage.setItem(PROPOSAL_DRAFT_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }

      applyLayout(state.activeMode || 'proposal', state.template, state.selectedDivision, new Set());
      notify('success', 'Đã nạp bản nháp đề xuất thành công và lưu vào bộ nhớ!');
    } catch (err) {
      notify('error', 'File bản nháp không hợp lệ');
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(PROPOSAL_DRAFT_KEY);
    } catch (e) {
      // ignore
    }
    setCollapsedNodeIds(new Set());
    const resetProposal = JSON.parse(JSON.stringify(currentNodes));
    setProposalNodes(resetProposal);
    applyLayout(mode, template, selectedDivision, new Set());
    notify('info', 'Đã đặt lại bố cục và xóa bản nháp lưu tạm');
  };

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Top Banner Alert */}
      {alertMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-xs font-semibold shadow-xs animate-in slide-in-from-top-2 duration-200 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : alertMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-300'
              : 'bg-blue-50 text-blue-800 border border-blue-300'
          }`}
        >
          {alertMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : alertMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Scientific Redesigned Toolbar */}
      <ProposalToolbar
        mode={mode}
        onModeChange={handleModeChange}
        onCreateProposal={handleCreateProposal}
        template={template}
        onTemplateChange={handleTemplateChange}
        divisions={divisions}
        selectedDivision={selectedDivision}
        onDivisionChange={handleDivisionChange}
        densityMode={densityMode}
        onDensityModeChange={setDensityMode}
        showNicknames={showNicknames}
        onToggleNicknames={() => setShowNicknames(prev => !prev)}
        showSumUpTable={showSumUpTable}
        onToggleSumUpTable={() => setShowSumUpTable(prev => !prev)}
        onFileUpload={handleFileUpload}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onExportPDFA3={handleExportPDFA3}
        onExportPNG={handleExportPNG}
        onSaveDraft={handleSaveDraft}
        onLoadDraft={handleLoadDraft}
        onAddNode={handleAddNode}
        onAddDivider={handleAddDivider}
        onAddNote={handleAddNote}
        onReset={handleReset}
        totalOfficeRecords={totalOfficeCount}
        isUploading={isUploading}
        isSyncingSheet={isSyncingSheet}
        onSyncGoogleSheet={handleSyncGoogleSheet}
        onRefreshFromSheet={handleRefreshFromSheet}
        activeProposalId={activeProposalId}
        unlockedProposalCount={unlockedProposalCount}
        proposalNames={proposalNames}
        onSelectProposal={handleSelectProposal}
        onAddNewProposal={handleAddNewProposal}
        onOpenRenameDialog={handleOpenRenameDialog}
        onCopyAsIsToProposal={handleCopyAsIsToProposal}
        onAddBoxGroup={handleOpenAddBoxGroup}
        onOpenAddDivision={handleOpenAddDivision}
      />

      {/* Main Interactive Canvas Viewport */}
      <div className="flex-1 w-full p-2 overflow-hidden flex flex-col">
        {template === 'division_summary' ? (
          <DivisionSummaryTable
            mode={mode}
            currentNodes={currentNodes}
            proposalNodes={proposalNodes}
            activeProposalName={proposalNames[activeProposalId] || `Đề Xuất ${activeProposalId}`}
          />
        ) : (
          <OrgCanvas
            nodes={nodes}
            indirectLinks={indirectLinks}
            dividers={dividers}
            notes={notes}
            template={template}
            selectedDivision={selectedDivision}
            pillarPills={pillarPills}
            headcount3Y={headcount3Y}
            slideTitle={slideTitle}
            hasCRVShared={hasCRVShared}
            densityMode={densityMode}
            showNicknames={showNicknames}
            showSumUpTable={showSumUpTable}
            onToggleSumUpTable={() => setShowSumUpTable(prev => !prev)}
            summary={summary}
            mode={mode}
            diffMap={diffMap}
            connectingSource={connectingSource}
            onStartConnect={handleStartConnect}
            onCompleteConnect={handleCompleteConnect}
            onCancelConnect={handleCancelConnect}
            onToggleCollapse={handleToggleCollapse}
            onNodeMove={handleNodeMove}
            onNodeSelect={node => {
              if (mode === 'current') return;
              setSelectedNode(node);
              setIsEditDialogOpen(true);
            }}
            onNodeDelete={handleNodeDelete}
            onNodeToggleStatus={handleNodeToggleStatus}
            onNoteMove={handleNodeMove}
            onNoteChange={handleNoteChange}
            onNoteDelete={noteId => setNotes(prev => prev.filter(n => n.id !== noteId))}
            onDividerMove={handleDividerMove}
            onDividerEdit={divider => {
              if (mode === 'current') return;
              setEditingDivider(divider);
              setIsDividerDialogOpen(true);
            }}
            onDividerDelete={divId => setDividers(prev => prev.filter(d => d.id !== divId))}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            selectedNodeId={selectedNode?.id}
            canvasRef={canvasRef}
            n1BoxesConfig={n1BoxesConfig}
            onOpenBoxConfig={handleOpenBoxConfig}
            onBoxResize={handleBoxResize}
            onBoxMove={handleBoxMove}
            onDeleteBox={handleDeleteBox}
            onNodeAddChild={handleNodeAddChild}
          />
        )}
      </div>

      {/* Excel Uploading / Processing Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="relative mb-4 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-100">
                <Loader2 className="w-7 h-7 text-[#B91C1C] animate-spin" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Đang Nạp Dữ Liệu Excel
            </h3>
            <p className="text-xs text-slate-600 mb-3 min-h-[1.5rem] font-medium">
              {uploadProgressText}
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#B91C1C] h-full w-2/3 rounded-full animate-pulse" />
            </div>
            <span className="text-[11px] text-slate-400 mt-3">
              Hệ thống đang kiểm tra danh sách ghế và vẽ lại sơ đồ...
            </span>
          </div>
        </div>
      )}

      {/* Excel Upload Confirmation Dialog */}
      {uploadSuccessModal && (
        <Dialog open={!!uploadSuccessModal} onOpenChange={() => setUploadSuccessModal(null)}>
          <DialogContent className="sm:max-w-md bg-white border-2 border-emerald-500 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
                <DialogTitle className="text-base font-bold">
                  Nạp Dữ Liệu Excel Thành Công!
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-600 pt-1">
                Đã cập nhật cơ cấu tổ chức Hiện tại (Baseline) từ file <strong>{uploadSuccessModal.fileName}</strong>:
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Ghế Head Office:</span>
                <span className="text-base font-bold text-slate-900">{uploadSuccessModal.officeCount} Ghế</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Lãnh đạo khu vực:</span>
                <span className="text-base font-bold text-blue-700">{uploadSuccessModal.leadersCount} Lãnh đạo</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-slate-500 font-medium">Tuyến ma trận:</span>
                <span className="text-base font-bold text-slate-900">{uploadSuccessModal.linksCount} Tuyến</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-slate-500 font-medium">Phòng ban (Divisions):</span>
                <span className="text-base font-bold text-emerald-700">{uploadSuccessModal.divisionsCount} Khối</span>
              </div>
              <div className="col-span-2 mt-2 bg-emerald-100/70 border border-emerald-300 rounded p-2 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã tự động lưu trữ dữ liệu vào hệ thống an toàn.</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs w-full cursor-pointer"
                onClick={() => setUploadSuccessModal(null)}
              >
                Khám Phá Sơ Đồ Ngay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Node Edit / Reporting Relationship Modal with Cycle Prevention */}
      {selectedNode && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>Chỉnh Sửa Ghế & Tuyến Báo Cáo Đề Xuất</span>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2 text-xs w-full">
              <div className="grid gap-1">
                <Label htmlFor="node-title" className="font-semibold text-slate-700">Chức Danh Vị Trí (Position Title)</Label>
                <Input
                  id="node-title"
                  value={selectedNode.title || ''}
                  onChange={e => setSelectedNode({ ...selectedNode, title: e.target.value })}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              {/* Reports To Selector with Cycle Prevention */}
              <div className="grid gap-1 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <Label htmlFor="node-reports-to" className="font-bold text-slate-900">
                  Báo Cáo Trực Tiếp Cho (Sếp Quản Lý Trực Tiếp)
                </Label>
                <select
                  id="node-reports-to"
                  value={selectedNode.reportsToId || ''}
                  onChange={e => {
                    const parentId = e.target.value;
                    if (parentId && isCircularReporting(parentId, selectedNode.id, proposalNodes)) {
                      notify('error', 'Không thể chọn vị trí cấp dưới làm người quản lý (lỗi lặp vòng chu trình)!');
                      return;
                    }
                    const parent = proposalNodes.find(n => n.id === parentId);
                    setSelectedNode({
                      ...selectedNode,
                      reportsToId: parentId || undefined,
                      reportsToTitle: parent ? parent.title : undefined
                    });
                  }}
                  className="w-full border border-slate-300 rounded-md text-xs py-1.5 px-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                >
                  <option value="">(Không có / Vị trí đứng đầu - Root)</option>
                  {proposalNodes
                    .filter(n => n.id !== selectedNode.id)
                    .map(n => (
                      <option key={n.id} value={n.id}>
                        {n.title} {n.nickname ? `(${n.nickname})` : ''} - {n.division || 'HO'}
                      </option>
                    ))}
                </select>
                <span className="text-[10.5px] text-slate-500">
                  Hệ thống tự động vẽ lại đường kết nối phân cấp khi bạn thay đổi cấp quản lý.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="node-nick" className="font-semibold text-slate-700">Tên Nhân Sự / Nickname</Label>
                  <Input
                    id="node-nick"
                    value={selectedNode.nickname || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, nickname: e.target.value })}
                    className="h-8 text-xs font-medium"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="node-status" className="font-semibold text-slate-700">Trạng Thái Đề Xuất</Label>
                  <Select
                    value={selectedNode.status}
                    onValueChange={(val: any) => setSelectedNode({ ...selectedNode, status: val })}
                  >
                    <SelectTrigger id="node-status" className="h-8 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active">Hiện Hữu (Active)</SelectItem>
                      <SelectItem value="new_hire">Tuyển Mới BP (Màu Xanh)</SelectItem>
                      <SelectItem value="replace">Thay Thế (Màu Đỏ)</SelectItem>
                      <SelectItem value="vacant">Ghế Trống (Nét Đứt)</SelectItem>
                      <SelectItem value="highlight">Nổi Bật (Màu Vàng)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="node-dept" className="font-semibold text-slate-700">Phòng Ban / Khối</Label>
                  <Input
                    id="node-dept"
                    value={selectedNode.dept || selectedNode.division || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, dept: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="node-tag" className="font-semibold text-slate-700">Huy Hiệu Ghi Chú</Label>
                  <Input
                    id="node-tag"
                    placeholder="ví dụ: New Hire Q4/2026"
                    value={selectedNode.customLabel || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, customLabel: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => {
                  handleNodeDelete(selectedNode.id);
                  setIsEditDialogOpen(false);
                }}
              >
                Gỡ Vị Trí
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer flex items-center gap-1 font-semibold"
                  onClick={() => {
                    const updated = proposalNodes.map(n => (n.id === selectedNode.id ? selectedNode : n));
                    if (!updated.some(n => n.id === selectedNode.id)) {
                      updated.push(selectedNode);
                    }
                    setProposalNodes(updated);
                    handleNodeAddChild(selectedNode);
                  }}
                  title="Thêm một vị trí mới báo cáo trực tiếp cho ghế này"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Thêm Ghế Cấp Dưới</span>
                </Button>
                <Button
                  size="sm"
                  className="text-xs bg-[#B91C1C] hover:bg-red-800 text-white font-semibold shadow-xs cursor-pointer"
                  onClick={() => {
                    const updated = proposalNodes.map(n => (n.id === selectedNode.id ? selectedNode : n));
                    if (!updated.some(n => n.id === selectedNode.id)) {
                      updated.push(selectedNode);
                    }
                    setProposalNodes(updated);
                    applyLayout(mode, template, selectedDivision, collapsedNodeIds);
                    setIsEditDialogOpen(false);
                    notify('success', `Đã lưu cập nhật cho ghế [${selectedNode.title}]`);
                  }}
                >
                  Lưu Thay Đổi
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Divider Edit Dialog */}
      {editingDivider && (
        <Dialog open={isDividerDialogOpen} onOpenChange={setIsDividerDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Chỉnh Sửa Nhãn Vạch Phân Cách
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="div-left" className="font-semibold text-slate-700">Tiêu đề bên trái</Label>
                <Input
                  id="div-left"
                  value={editingDivider.labelLeft || ''}
                  onChange={e => setEditingDivider({ ...editingDivider, labelLeft: e.target.value })}
                  placeholder="ví dụ: Khối Thương Hiệu"
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="div-right" className="font-semibold text-slate-700">Tiêu đề bên phải</Label>
                <Input
                  id="div-right"
                  value={editingDivider.labelRight || ''}
                  onChange={e => setEditingDivider({ ...editingDivider, labelRight: e.target.value })}
                  placeholder="ví dụ: Khối Chức Năng Hỗ Trợ"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => {
                  setDividers(prev => prev.filter(d => d.id !== editingDivider.id));
                  setIsDividerDialogOpen(false);
                }}
              >
                Xóa Vạch
              </Button>
              <Button
                size="sm"
                className="text-xs bg-[#B91C1C] hover:bg-red-800 text-white font-semibold cursor-pointer"
                onClick={() => {
                  setDividers(prev => prev.map(d => (d.id === editingDivider.id ? editingDivider : d)));
                  setIsDividerDialogOpen(false);
                  notify('success', 'Đã lưu vạch ngăn phân cách');
                }}
              >
                Lưu Thay Đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Custom Note Dialog */}
      <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Thêm Thẻ Ghi Chú Lên Sơ Đồ
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <Label htmlFor="note-content" className="text-xs font-semibold text-slate-700">
              Nội dung ghi chú
            </Label>
            <Input
              id="note-content"
              value={noteInputText}
              onChange={e => setNoteInputText(e.target.value)}
              placeholder="ví dụ: Đề xuất chuyển giao quyền quản lý từ Q4/2026..."
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddNoteDialogOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNote}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
            >
              Thêm Ghi Chú
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Working Proposal Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Đổi Tên Đề Xuất #{activeProposalId}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Đặt tên mô tả cho phương án đề xuất để dễ phân biệt (lưu trên sheet org-propose{activeProposalId > 1 ? activeProposalId : ''}).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <Label htmlFor="proposal-rename-input" className="text-xs font-semibold text-slate-700">
              Tên đề xuất
            </Label>
            <Input
              id="proposal-rename-input"
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              placeholder="ví dụ: Đề Xuất 1: Tối ưu khối Vận Hành"
              className="text-xs font-semibold"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveProposalName();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              className="text-xs cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProposalName}
              className="text-xs bg-[#B91C1C] hover:bg-red-800 text-white font-semibold cursor-pointer"
            >
              Lưu Tên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Box Group Dialog (N-1) */}
      <Dialog open={isAddBoxGroupDialogOpen} onOpenChange={setIsAddBoxGroupDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-purple-700">
              <Plus className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">
                Thêm Khối Box Group Mới (N-1)
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Tạo thêm một khối hộp trực quan trên sơ đồ N-1 để phân nhóm các vị trí.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2 text-xs">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-slate-700">Tiêu đề khối nhóm:</Label>
              <Input
                value={newBoxTitle}
                onChange={e => setNewBoxTitle(e.target.value)}
                className="text-xs bg-white h-8 font-semibold"
                placeholder="ví dụ: REGIONAL RETAIL OPERATIONS, ..."
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-slate-700">Ghi chú ở đáy khối (tùy chọn):</Label>
              <Input
                value={newBoxNote}
                onChange={e => setNewBoxNote(e.target.value)}
                className="text-xs bg-white h-8 italic"
                placeholder="ví dụ: Reporting to Regional Operations Director..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-slate-700">Màu sắc viền và nền khối:</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'slate', name: 'Xám', bg: 'bg-slate-100 border-slate-300 text-slate-700' },
                  { id: 'blue', name: 'Xanh biển', bg: 'bg-blue-50 border-blue-300 text-blue-700' },
                  { id: 'emerald', name: 'Xanh lá', bg: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
                  { id: 'amber', name: 'Vàng cam', bg: 'bg-amber-50 border-amber-300 text-amber-700' },
                  { id: 'purple', name: 'Tím', bg: 'bg-purple-50 border-purple-300 text-purple-700' },
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setNewBoxColor(c.id as any)}
                    className={`py-1 px-1.5 text-center text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${c.bg} ${
                      newBoxColor === c.id ? 'ring-2 ring-purple-600 ring-offset-1 font-bold' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] font-semibold text-slate-600">Chiều rộng (px):</Label>
                <Input
                  type="number"
                  value={newBoxWidth}
                  onChange={e => setNewBoxWidth(Number(e.target.value) || 0)}
                  className="text-xs bg-white h-8"
                  placeholder="380"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] font-semibold text-slate-600">Chiều cao (px):</Label>
                <Input
                  type="number"
                  value={newBoxHeight}
                  onChange={e => setNewBoxHeight(Number(e.target.value) || 0)}
                  className="text-xs bg-white h-8"
                  placeholder="280"
                />
              </div>
              <span className="col-span-2 text-[10.5px] text-slate-500 italic mt-0.5">
                Sau khi tạo, rê chuột vào khối để xuất hiện nút 3 gạch ở góc trên để di chuyển, và biểu tượng mũi tên ở góc dưới để co giãn kích thước.
              </span>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 border-t pt-3 border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddBoxGroupDialogOpen(false)}
              className="text-xs cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateBoxGroup}
              className="text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer"
            >
              Tạo Khối Box
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Box Group Edit Dialog (Individual Box Customization) */}
      <Dialog open={isSingleBoxDialogOpen} onOpenChange={setIsSingleBoxDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-purple-700">
              <Settings className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">
                {editingBoxKey === 'brand' && 'Chỉnh Sửa Khối Thương Hiệu (Brand)'}
                {editingBoxKey === 'ssp' && 'Chỉnh Sửa Khối Supersports (SSP)'}
                {editingBoxKey === 'coe' && 'Chỉnh Sửa Khối COE Supporting Function'}
                {editingBoxKey === 'crv' && 'Chỉnh Sửa Khối CRV Supporting Function'}
                {editingBoxKey && !['brand', 'ssp', 'coe', 'crv'].includes(editingBoxKey) && 'Chỉnh Sửa Khối Box Group'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Chỉnh sửa thông tin và kích thước cho riêng ô khối này trên sơ đồ N-1.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2 text-xs">
            {editingBoxKey && (editingBoxKey === 'coe' || editingBoxKey === 'crv' || !['brand', 'ssp'].includes(editingBoxKey)) && (
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold text-slate-700">Tiêu đề ô nhóm:</Label>
                <Input
                  value={singleBoxDraft.title}
                  onChange={e => setSingleBoxDraft(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xs bg-white h-8 font-semibold"
                  placeholder="Tiêu đề khối..."
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-slate-700">Nội dung ghi chú dưới đáy ô:</Label>
              <Input
                value={singleBoxDraft.note}
                onChange={e => setSingleBoxDraft(prev => ({ ...prev, note: e.target.value }))}
                className="text-xs bg-white h-8"
                placeholder="Nhập ghi chú cho ô này..."
              />
            </div>

            {/* Color picker for custom boxes */}
            {editingBoxKey && !['brand', 'ssp', 'coe', 'crv'].includes(editingBoxKey) && (
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-semibold text-slate-700">Màu sắc khối:</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'slate', name: 'Xám', bg: 'bg-slate-100 border-slate-300 text-slate-700' },
                    { id: 'blue', name: 'Xanh biển', bg: 'bg-blue-50 border-blue-300 text-blue-700' },
                    { id: 'emerald', name: 'Xanh lá', bg: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
                    { id: 'amber', name: 'Vàng cam', bg: 'bg-amber-50 border-amber-300 text-amber-700' },
                    { id: 'purple', name: 'Tím', bg: 'bg-purple-50 border-purple-300 text-purple-700' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSingleBoxDraft(prev => ({ ...prev, color: c.id as any }))}
                      className={`py-1 px-1.5 text-center text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${c.bg} ${
                        singleBoxDraft.color === c.id ? 'ring-2 ring-purple-600 ring-offset-1 font-bold' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] font-semibold text-slate-600">Chiều rộng (px):</Label>
                <Input
                  type="number"
                  value={singleBoxDraft.width || ''}
                  onChange={e => setSingleBoxDraft(prev => ({ ...prev, width: Number(e.target.value) || 0 }))}
                  className="text-xs bg-white h-8"
                  placeholder="Chiều rộng"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] font-semibold text-slate-600">Chiều cao (px):</Label>
                <Input
                  type="number"
                  value={singleBoxDraft.height || ''}
                  onChange={e => setSingleBoxDraft(prev => ({ ...prev, height: Number(e.target.value) || 0 }))}
                  className="text-xs bg-white h-8"
                  placeholder="Chiều cao"
                />
              </div>
              <span className="col-span-2 text-[10.5px] text-slate-500 italic mt-0.5">
                Mẹo: Bạn có thể rê chuột vào khối trên sơ đồ để dùng biểu tượng 3 gạch di chuyển hoặc kéo góc mũi tên để đổi kích thước trực quan.
              </span>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 border-t pt-3 border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSingleBoxDialogOpen(false)}
              className="text-xs cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveSingleBox}
              className="text-xs bg-[#B91C1C] hover:bg-red-800 text-white font-bold cursor-pointer"
            >
              Lưu Thay Đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Proposal Division Dialog */}
      <Dialog open={isAddDivisionDialogOpen} onOpenChange={setIsAddDivisionDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-700">
              <Plus className="w-5 h-5" />
              <DialogTitle className="text-base font-bold">
                Tạo Division Đề Xuất Mới (Proposal)
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Thêm một phòng ban hoặc nhãn hàng mới vào kế hoạch tổ chức đề xuất.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2 text-xs">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-slate-700">Tên Division / Nhãn hàng mới:</Label>
              <Input
                value={newDivisionName}
                onChange={e => setNewDivisionName(e.target.value)}
                className="text-xs bg-white h-8 font-semibold"
                placeholder="ví dụ: Matin Kim, MLB, On Running, ..."
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-slate-700">Chức danh vị trí đứng đầu (Head / Brand Manager):</Label>
              <Input
                value={newDivisionHeadTitle}
                onChange={e => setNewDivisionHeadTitle(e.target.value)}
                className="text-xs bg-white h-8"
                placeholder="ví dụ: Brand Manager, Head of Division"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-semibold text-slate-700">Tên nhân sự / Nickname (tùy chọn):</Label>
              <Input
                value={newDivisionHeadNickname}
                onChange={e => setNewDivisionHeadNickname(e.target.value)}
                className="text-xs bg-white h-8"
                placeholder="ví dụ: Vincent, Linh, ..."
              />
            </div>

            <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <Label className="text-xs font-semibold text-slate-700">Báo cáo trực tiếp cho:</Label>
              <select
                value={newDivisionReportsToId}
                onChange={e => setNewDivisionReportsToId(e.target.value)}
                className="w-full border border-slate-300 rounded-md text-xs py-1.5 px-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="">(Không có / Vị trí độc lập)</option>
                {proposalNodes
                  .filter(n => n.title.toLowerCase().includes('ceo') || n.title.toLowerCase().includes('head') || n.title.toLowerCase().includes('president') || n.title.toLowerCase().includes('vp') || n.title.toLowerCase().includes('gm'))
                  .map(n => (
                    <option key={n.id} value={n.id}>
                      {n.title} {n.nickname ? `(${n.nickname})` : ''} - {n.division || 'HO'}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 border-t pt-3 border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddDivisionDialogOpen(false)}
              className="text-xs cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateNewDivision}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Tạo Division Mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
