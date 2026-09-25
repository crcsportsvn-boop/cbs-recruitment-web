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
  ProposalJustificationRow
} from '@/types/org-chart';
import { AnchorPosition } from './OrgNodeCard';
import { parseOrgChartWorkbook } from '@/lib/org-chart/excel-parser';
import { buildOrgLayout, calculateHeadcountSummary, calculateOrgDiff } from '@/lib/org-chart/graph-builder';
import { exportToPDF, exportToImage, exportProposalExcel, exportProposalJSON, importProposalJSON } from '@/lib/org-chart/export-service';
import { DEFAULT_VIRTUAL_LEADERS, DEFAULT_INDIRECT_LINKS } from '@/lib/org-chart/default-config';
import { DEFAULT_OFFICE_NODES, DEFAULT_OFFICE_DIVISIONS } from '@/lib/org-chart/default-office-data';
import { ProposalToolbar } from './ProposalToolbar';
import { OrgCanvas } from './OrgCanvas';
import { PillarPill, Headcount3YRow } from '@/lib/org-chart/department-blueprints';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Info, Sparkles, GitCompare } from 'lucide-react';

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
  const [mode, setMode] = useState<OrgChartMode>('proposal');

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

  // Upload Feedback Modal
  const [uploadSuccessModal, setUploadSuccessModal] = useState<{
    fileName: string;
    officeCount: number;
    leadersCount: number;
    linksCount: number;
    divisionsCount: number;
  } | null>(null);

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
    collapsedSet: Set<string> = collapsedNodeIds
  ) => {
    const isCurrent = targetMode === 'current';
    const activeNodes = isCurrent ? currentNodes : proposalNodes;
    const activeLeaders = isCurrent ? currentVirtualLeaders : proposalVirtualLeaders;
    const activeIndirect = isCurrent ? currentIndirect : proposalIndirect;

    const layout = buildOrgLayout(tpl, activeNodes, activeLeaders, activeIndirect, activeDiv || selectedDivision, collapsedSet);
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

  // Initial layout generation and draft restoration on mount
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(PROPOSAL_DRAFT_KEY) : null;
      if (saved) {
        const draft: OrgProposalState = JSON.parse(saved);
        if (draft && Array.isArray(draft.nodes) && draft.nodes.length > 0) {
          setProposalNodes(draft.nodes);
          if (draft.indirectLinks) setProposalIndirect(draft.indirectLinks);
          if (draft.dividers) setDividers(draft.dividers);
          if (draft.notes) setNotes(draft.notes);
          if (draft.justificationRows) setJustificationRows(draft.justificationRows);
          if (draft.template) setTemplate(draft.template);
          if (draft.selectedDivision) setSelectedDivision(draft.selectedDivision);
          if (draft.densityMode) setDensityMode(draft.densityMode);
          if (draft.activeMode) setMode(draft.activeMode);

          applyLayout(draft.activeMode || mode, draft.template || template, draft.selectedDivision || selectedDivision, collapsedNodeIds);
          notify('info', 'Đã khôi phục dữ liệu bản nháp đề xuất đã lưu trước đó.');
          return;
        }
      }
    } catch (e) {
      console.warn('Could not restore proposal draft from localStorage:', e);
    }

    applyLayout(mode, template, selectedDivision, collapsedNodeIds);
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
    try {
      notify('info', `Đang đọc file ${file.name}...`);
      const buffer = await file.arrayBuffer();
      const parsed = parseOrgChartWorkbook(buffer);

      // 1. Update Current Baseline
      setCurrentNodes(parsed.nodes);
      setCurrentVirtualLeaders(parsed.virtualLeaders);
      setCurrentIndirect(parsed.indirectLinks);
      if (parsed.divisions.length > 0) {
        setDivisions(parsed.divisions);
      }
      setTotalOfficeCount(parsed.officeRows);

      const targetDiv = parsed.divisions.includes(selectedDivision) ? selectedDivision : parsed.divisions[0] || 'Crocs';
      setSelectedDivision(targetDiv);

      // 2. Clone to Proposal working copy
      const clonedProposal = JSON.parse(JSON.stringify(parsed.nodes));
      setProposalNodes(clonedProposal);
      setProposalVirtualLeaders(parsed.virtualLeaders);
      setProposalIndirect(parsed.indirectLinks);

      // Reapply layout
      applyLayout(mode, template, targetDiv, collapsedNodeIds);

      setUploadSuccessModal({
        fileName: file.name,
        officeCount: parsed.officeRows,
        leadersCount: parsed.virtualLeaders.length,
        linksCount: parsed.indirectLinks.length,
        divisionsCount: parsed.divisions.length
      });

      notify('success', `Đã cập nhật cơ cấu Hiện tại (Current) từ file Excel ${file.name}!`);
    } catch (err: any) {
      console.error('File parsing failed:', err);
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

  // Add Custom Divider
  const handleAddDivider = () => {
    const newDivider: CustomDivider = {
      id: `divider_${Date.now()}`,
      type: 'vertical',
      position: 840,
      labelLeft: 'Khối Thương Hiệu (Brands)',
      labelRight: 'Khối Chức Năng Hỗ Trợ (Supporting Functions)'
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
          justificationRows
        };
        localStorage.setItem(PROPOSAL_DRAFT_KEY, JSON.stringify(state));
      } catch (e) {
        // ignore storage quota issues
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [proposalNodes, proposalIndirect, dividers, notes, justificationRows, mode, template, selectedDivision, densityMode, showNicknames, showSumUpTable]);

  const handleSaveDraft = () => {
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
      justificationRows
    };
    try {
      localStorage.setItem(PROPOSAL_DRAFT_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    exportProposalJSON(state, `CBS_Org_Proposal_${template}.cbsorg`);
    notify('success', 'Đã lưu bản nháp đề xuất vào bộ nhớ trình duyệt và tải file (.cbsorg)!');
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
      />

      {/* Main Interactive Canvas Viewport */}
      <div className="flex-1 w-full p-2 overflow-hidden flex flex-col">
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
        onNoteMove={handleNoteMove}
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
      />
      </div>

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
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>Chỉnh Sửa Ghế & Tuyến Báo Cáo Đề Xuất</span>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2 text-xs">
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
                  className="border border-slate-300 rounded-md text-xs py-1.5 px-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
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

            <DialogFooter className="flex justify-between sm:justify-between">
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
    </div>
  );
}
