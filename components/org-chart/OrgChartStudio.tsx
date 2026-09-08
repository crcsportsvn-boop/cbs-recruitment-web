"use client";

import React, { useState, useEffect, useRef } from 'react';
import { OrgNode, IndirectLink, CustomDivider, CustomNote, ViewTemplate, DensityMode, VirtualLeader, HeadcountSummary, OrgProposalState } from '@/types/org-chart';
import { AnchorPosition } from './OrgNodeCard';
import { parseOrgChartWorkbook } from '@/lib/org-chart/excel-parser';
import { buildOrgLayout, calculateHeadcountSummary } from '@/lib/org-chart/graph-builder';
import { exportToPDF, exportToImage, exportProposalJSON, importProposalJSON } from '@/lib/org-chart/export-service';
import { DEFAULT_VIRTUAL_LEADERS, DEFAULT_INDIRECT_LINKS } from '@/lib/org-chart/default-config';
import { DEFAULT_OFFICE_NODES, DEFAULT_OFFICE_DIVISIONS } from '@/lib/org-chart/default-office-data';
import { ProposalToolbar } from './ProposalToolbar';
import { OrgCanvas } from './OrgCanvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface OrgChartStudioProps {
  lang?: 'vi' | 'en';
  user?: any;
}

export default function OrgChartStudio({ lang = 'en', user }: OrgChartStudioProps) {
  // Primary State
  const [template, setTemplate] = useState<ViewTemplate>('company_n1');
  const [selectedDivision, setSelectedDivision] = useState<string>('Crocs');
  const [densityMode, setDensityMode] = useState<DensityMode>('full');
  const [showNicknames, setShowNicknames] = useState<boolean>(true);
  const [showSumUpTable, setShowSumUpTable] = useState<boolean>(true);

  // Data Store (Pre-seeded with real 201 Office nodes & 16 divisions)
  const [rawNodes, setRawNodes] = useState<OrgNode[]>(DEFAULT_OFFICE_NODES);
  const [virtualLeaders, setVirtualLeaders] = useState<VirtualLeader[]>(DEFAULT_VIRTUAL_LEADERS);
  const [customIndirect, setCustomIndirect] = useState<IndirectLink[]>(DEFAULT_INDIRECT_LINKS);
  const [divisions, setDivisions] = useState<string[]>(DEFAULT_OFFICE_DIVISIONS);
  const [totalOfficeCount, setTotalOfficeCount] = useState<number>(DEFAULT_OFFICE_NODES.length);

  // Positioned Layout State
  const [nodes, setNodes] = useState<OrgNode[]>([]);
  const [indirectLinks, setIndirectLinks] = useState<IndirectLink[]>([]);
  const [dividers, setDividers] = useState<CustomDivider[]>([]);
  const [notes, setNotes] = useState<CustomNote[]>([]);
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

  // Trigger Layout generation
  const applyLayout = (
    tpl: ViewTemplate,
    rNodes: OrgNode[],
    vLeaders: VirtualLeader[],
    indLinks: IndirectLink[],
    div?: string,
    collapsedSet: Set<string> = collapsedNodeIds
  ) => {
    const layout = buildOrgLayout(tpl, rNodes, vLeaders, indLinks, div, collapsedSet);
    setNodes(layout.nodes);
    setIndirectLinks(layout.indirectLinks);
    setDividers(layout.dividers);
    setNotes(layout.notes);
    setCanvasWidth(layout.canvasWidth);
    setCanvasHeight(layout.canvasHeight);
    setSummary(layout.summary);
  };

  // Initial layout generation on mount
  useEffect(() => {
    applyLayout(template, rawNodes, virtualLeaders, customIndirect, selectedDivision, collapsedNodeIds);
  }, []);

  // Listen for Escape key to cancel connecting mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectingSource) {
        setConnectingSource(null);
        notify('info', 'Connection cancelled');
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

  // Handle Excel File Upload
  const handleFileUpload = async (file: File) => {
    try {
      notify('info', `Reading ${file.name}...`);
      const buffer = await file.arrayBuffer();
      const parsed = parseOrgChartWorkbook(buffer);

      setRawNodes(parsed.nodes);
      setVirtualLeaders(parsed.virtualLeaders);
      setCustomIndirect(parsed.indirectLinks);
      if (parsed.divisions.length > 0) {
        setDivisions(parsed.divisions);
      }
      setTotalOfficeCount(parsed.officeRows);

      const targetDiv = parsed.divisions.includes(selectedDivision) ? selectedDivision : parsed.divisions[0] || 'Crocs';
      setSelectedDivision(targetDiv);

      applyLayout(template, parsed.nodes, parsed.virtualLeaders, parsed.indirectLinks, targetDiv, collapsedNodeIds);

      setUploadSuccessModal({
        fileName: file.name,
        officeCount: parsed.officeRows,
        leadersCount: parsed.virtualLeaders.length,
        linksCount: parsed.indirectLinks.length,
        divisionsCount: parsed.divisions.length
      });

      notify('success', `Workbook uploaded successfully!`);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      notify('error', 'Failed to read Excel workbook. Please verify the .xlsm / .xlsx file format.');
    }
  };

  // Handle Template change (Organization N-1 vs Division)
  const handleTemplateChange = (newTemplate: ViewTemplate) => {
    setTemplate(newTemplate);
    applyLayout(newTemplate, rawNodes, virtualLeaders, customIndirect, selectedDivision, collapsedNodeIds);
  };

  // Handle Division change (Single source of truth)
  const handleDivisionChange = (newDivision: string) => {
    setSelectedDivision(newDivision);
    setTemplate('custom_division');
    applyLayout('custom_division', rawNodes, virtualLeaders, customIndirect, newDivision, collapsedNodeIds);
    notify('info', `Switched to Division: ${newDivision}`);
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
      applyLayout(template, rawNodes, virtualLeaders, customIndirect, selectedDivision, next);
      return next;
    });
  };

  // Start 4-Anchor Connection
  const handleStartConnect = (node: OrgNode, anchor: AnchorPosition) => {
    setConnectingSource({ node, anchor });
    notify(
      'info',
      `Connecting from [${node.title}] (${anchor} port). Click on target position to link line.`
    );
  };

  // Complete Connection to Target Node
  const handleCompleteConnect = (targetNode: OrgNode) => {
    if (!connectingSource) return;
    const { node: sourceNode, anchor } = connectingSource;

    if (sourceNode.id === targetNode.id) {
      setConnectingSource(null);
      return;
    }

    if (anchor === 'bottom') {
      const updatedNodes = nodes.map(n =>
        n.id === targetNode.id
          ? { ...n, reportsToId: sourceNode.id, reportsToTitle: sourceNode.title }
          : n
      );
      setNodes(updatedNodes);
      notify('success', `Direct report linked: ${targetNode.title} -> reports to ${sourceNode.title}`);
    } else if (anchor === 'top') {
      const updatedNodes = nodes.map(n =>
        n.id === sourceNode.id
          ? { ...n, reportsToId: targetNode.id, reportsToTitle: targetNode.title }
          : n
      );
      setNodes(updatedNodes);
      notify('success', `Direct report linked: ${sourceNode.title} -> reports to ${targetNode.title}`);
    } else {
      const newIndirect: IndirectLink = {
        id: `ind_anchor_${Date.now()}`,
        fromId: sourceNode.id,
        toId: targetNode.id,
        label: 'Indirect Report',
        style: 'dashed'
      };
      setIndirectLinks(prev => [...prev, newIndirect]);
      notify('success', `Matrix indirect link connected between ${sourceNode.title} and ${targetNode.title}`);
    }

    setConnectingSource(null);
  };

  // Cancel Connection
  const handleCancelConnect = () => {
    setConnectingSource(null);
  };

  // Move Node on Canvas
  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    setNodes(prev =>
      prev.map(n => (n.id === nodeId ? { ...n, x, y } : n))
    );
  };

  // Move Note on Canvas
  const handleNoteMove = (noteId: string, x: number, y: number) => {
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, x, y } : n))
    );
  };

  // Move Divider on Canvas
  const handleDividerMove = (dividerId: string, position: number) => {
    setDividers(prev =>
      prev.map(d => (d.id === dividerId ? { ...d, position } : d))
    );
  };

  // Update Note Text inline
  const handleNoteChange = (noteId: string, text: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, text } : n))
    );
    notify('success', 'Note updated');
  };

  // Toggle Node Status (Active -> New Hire -> Replace -> Active)
  const handleNodeToggleStatus = (node: OrgNode) => {
    const nextStatusMap: Record<string, 'active' | 'new_hire' | 'replace'> = {
      active: 'new_hire',
      new_hire: 'replace',
      replace: 'active',
      vacant: 'new_hire',
      highlight: 'new_hire'
    };

    const nextStatus = nextStatusMap[node.status] || 'active';
    const updatedNodes = nodes.map(n =>
      n.id === node.id
        ? {
            ...n,
            status: nextStatus,
            customLabel: nextStatus === 'new_hire' ? 'New Hire BP' : nextStatus === 'replace' ? 'Replace' : undefined
          }
        : n
    );

    const isDivView = template !== 'company_n1';
    setNodes(updatedNodes);
    setSummary(calculateHeadcountSummary(updatedNodes, isDivView, selectedDivision));
  };

  // Delete Node
  const handleNodeDelete = (nodeId: string) => {
    const updated = nodes.filter(n => n.id !== nodeId);
    const isDivView = template !== 'company_n1';
    setNodes(updated);
    setSummary(calculateHeadcountSummary(updated, isDivView, selectedDivision));
    notify('info', 'Position removed from chart');
  };

  // Add Proposal Node
  const handleAddNode = (type: 'standard' | 'new_hire' | 'replace') => {
    const id = `proposal_pos_${Date.now()}`;
    const isNew = type === 'new_hire';
    const isRep = type === 'replace';

    const defaultParent = nodes.find(n => n.id.includes('PRES') || n.id.includes('HEAD') || n.id.includes('CRO')) || nodes[0];

    const newNode: OrgNode = {
      id,
      title: isNew ? 'Brand Manager (New Hire)' : isRep ? 'Marketing Specialist (Replace)' : 'New Position',
      nickname: isNew ? 'New Hire BP' : isRep ? 'Replace' : 'Name',
      reportsToId: defaultParent ? defaultParent.id : undefined,
      reportsToTitle: defaultParent ? defaultParent.title : undefined,
      flags: ['VN'],
      status: type === 'new_hire' ? 'new_hire' : type === 'replace' ? 'replace' : 'active',
      customLabel: isNew ? 'New Hire BP' : isRep ? 'Replace' : undefined,
      x: 380,
      y: 280,
      width: 185,
      height: 72
    };

    const updated = [...nodes, newNode];
    const isDivView = template !== 'company_n1';
    setNodes(updated);
    setSummary(calculateHeadcountSummary(updated, isDivView, selectedDivision));
    setSelectedNode(newNode);
    setIsEditDialogOpen(true);
    notify('success', 'New proposal position added! Configure reporting hierarchy below.');
  };

  // Add Custom Divider
  const handleAddDivider = () => {
    const newDivider: CustomDivider = {
      id: `divider_${Date.now()}`,
      type: 'vertical',
      position: 820,
      labelLeft: 'Brand Organization',
      labelRight: 'Supporting Functions'
    };
    setDividers(prev => [...prev, newDivider]);
    notify('success', 'Divider added! Drag the handle to reposition or edit labels.');
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
    notify('success', 'Custom note added to canvas');
  };

  // Export handlers
  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    notify('info', 'Generating high-resolution A4 Landscape PDF...');
    try {
      await exportToPDF(canvasRef.current, `CBS_Org_Chart_${template}.pdf`);
      notify('success', 'PDF exported successfully!');
    } catch (err) {
      console.error(err);
      notify('error', 'Error exporting PDF');
    }
  };

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    notify('info', 'Generating Ultra-HD PNG (300 DPI)...');
    try {
      await exportToImage(canvasRef.current, `CBS_Org_Chart_${template}.png`);
      notify('success', 'PNG exported successfully!');
    } catch (err) {
      console.error(err);
      notify('error', 'Error exporting image');
    }
  };

  const handleSaveDraft = () => {
    const state: OrgProposalState = {
      template,
      selectedDivision,
      nodes,
      indirectLinks,
      dividers,
      notes,
      densityMode,
      showNicknames,
      showSumUpTable,
      showSharedSidebar: true,
      zoomLevel: 1
    };
    exportProposalJSON(state, `CBS_Org_Proposal_${template}.cbsorg`);
    notify('success', 'Proposal draft saved (.cbsorg)!');
  };

  const handleLoadDraft = async (file: File) => {
    try {
      const state = await importProposalJSON(file);
      setTemplate(state.template);
      if (state.selectedDivision) setSelectedDivision(state.selectedDivision);
      setNodes(state.nodes);
      setIndirectLinks(state.indirectLinks);
      setDividers(state.dividers || []);
      setNotes(state.notes || []);
      setDensityMode(state.densityMode || 'full');
      setShowNicknames(state.showNicknames ?? true);
      setShowSumUpTable(state.showSumUpTable ?? true);
      const isDivView = state.template !== 'company_n1';
      setSummary(calculateHeadcountSummary(state.nodes, isDivView, state.selectedDivision));
      notify('success', 'Proposal draft loaded successfully!');
    } catch (err) {
      notify('error', 'Invalid proposal draft file');
    }
  };

  const handleReset = () => {
    setCollapsedNodeIds(new Set());
    applyLayout(template, rawNodes, virtualLeaders, customIndirect, selectedDivision, new Set());
    notify('info', 'Layout reset to defaults');
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : alertMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <Info className="w-4 h-4 text-blue-600" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Toolbar */}
      <ProposalToolbar
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
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        onSaveDraft={handleSaveDraft}
        onLoadDraft={handleLoadDraft}
        onAddNode={handleAddNode}
        onAddDivider={handleAddDivider}
        onAddNote={handleAddNote}
        onReset={handleReset}
        totalOfficeRecords={totalOfficeCount}
      />

      {/* Main Interactive Canvas with 4 Connection Anchors and Collapsible Hierarchy */}
      <OrgCanvas
        nodes={nodes}
        indirectLinks={indirectLinks}
        dividers={dividers}
        notes={notes}
        template={template}
        selectedDivision={selectedDivision}
        densityMode={densityMode}
        showNicknames={showNicknames}
        showSumUpTable={showSumUpTable}
        onToggleSumUpTable={() => setShowSumUpTable(prev => !prev)}
        summary={summary}
        connectingSource={connectingSource}
        onStartConnect={handleStartConnect}
        onCompleteConnect={handleCompleteConnect}
        onCancelConnect={handleCancelConnect}
        onToggleCollapse={handleToggleCollapse}
        onNodeMove={handleNodeMove}
        onNodeSelect={node => {
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
          setEditingDivider(divider);
          setIsDividerDialogOpen(true);
        }}
        onDividerDelete={divId => setDividers(prev => prev.filter(d => d.id !== divId))}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        selectedNodeId={selectedNode?.id}
        canvasRef={canvasRef}
      />

      {/* Excel Upload Success Confirmation Dialog */}
      {uploadSuccessModal && (
        <Dialog open={!!uploadSuccessModal} onOpenChange={() => setUploadSuccessModal(null)}>
          <DialogContent className="sm:max-w-md bg-white border-2 border-emerald-500 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
                <DialogTitle className="text-base font-bold">
                  Excel Upload Succeeded!
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-600 pt-1">
                Data loaded from <strong>{uploadSuccessModal.fileName}</strong>:
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Head Office Positions:</span>
                <span className="text-base font-bold text-slate-900">{uploadSuccessModal.officeCount} Seats</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">Regional Leaders:</span>
                <span className="text-base font-bold text-blue-700">{uploadSuccessModal.leadersCount} Leaders</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-slate-500 font-medium">Matrix Indirect Links:</span>
                <span className="text-base font-bold text-slate-900">{uploadSuccessModal.linksCount} Links</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-slate-500 font-medium">Divisions Detected:</span>
                <span className="text-base font-bold text-emerald-700">{uploadSuccessModal.divisionsCount} Divisions</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs w-full"
                onClick={() => setUploadSuccessModal(null)}
              >
                View Org Chart Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Node Edit / Reporting Relationship Modal */}
      {selectedNode && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">
                Edit Position & Reporting Hierarchy
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="node-title" className="font-semibold text-slate-700">Position Title</Label>
                <Input
                  id="node-title"
                  value={selectedNode.title || ''}
                  onChange={e => setSelectedNode({ ...selectedNode, title: e.target.value })}
                  className="h-8 text-xs font-medium"
                />
              </div>

              {/* Reports To Selector (Direct Manager / Parent Node) */}
              <div className="grid gap-1 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <Label htmlFor="node-reports-to" className="font-bold text-slate-900">
                  Reports To (Direct Manager / Parent Position)
                </Label>
                <select
                  id="node-reports-to"
                  value={selectedNode.reportsToId || ''}
                  onChange={e => {
                    const parentId = e.target.value;
                    const parent = nodes.find(n => n.id === parentId);
                    setSelectedNode({
                      ...selectedNode,
                      reportsToId: parentId || undefined,
                      reportsToTitle: parent ? parent.title : undefined
                    });
                  }}
                  className="border border-slate-300 rounded-md text-xs py-1.5 px-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                >
                  <option value="">(None / Root Position)</option>
                  {nodes
                    .filter(n => n.id !== selectedNode.id)
                    .map(n => (
                      <option key={n.id} value={n.id}>
                        {n.title} {n.nickname ? `(${n.nickname})` : ''} - {n.division || 'HO'}
                      </option>
                    ))}
                </select>
                <span className="text-[10.5px] text-slate-500">
                  Selecting a manager automatically updates the solid reporting line.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="node-nick" className="font-semibold text-slate-700">Nickname / Display Name</Label>
                  <Input
                    id="node-nick"
                    value={selectedNode.nickname || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, nickname: e.target.value })}
                    className="h-8 text-xs font-medium"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="node-status" className="font-semibold text-slate-700">Proposal Status</Label>
                  <Select
                    value={selectedNode.status}
                    onValueChange={(val: any) => setSelectedNode({ ...selectedNode, status: val })}
                  >
                    <SelectTrigger id="node-status" className="h-8 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active">Active (Current)</SelectItem>
                      <SelectItem value="new_hire">New Hire BP (Green)</SelectItem>
                      <SelectItem value="replace">Replace (Red)</SelectItem>
                      <SelectItem value="vacant">Vacant (Dashed)</SelectItem>
                      <SelectItem value="highlight">Highlight (Yellow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="node-dept" className="font-semibold text-slate-700">Department / Brand</Label>
                  <Input
                    id="node-dept"
                    value={selectedNode.dept || selectedNode.division || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, dept: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="node-tag" className="font-semibold text-slate-700">Proposal Badge Tag</Label>
                  <Input
                    id="node-tag"
                    placeholder="e.g. New Hire 2027"
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
                className="text-xs text-red-600 hover:bg-red-50"
                onClick={() => {
                  handleNodeDelete(selectedNode.id);
                  setIsEditDialogOpen(false);
                }}
              >
                Delete Position
              </Button>
              <Button
                size="sm"
                className="text-xs bg-[#B91C1C] hover:bg-red-800 text-white font-semibold shadow-xs"
                onClick={() => {
                  const updated = nodes.map(n => (n.id === selectedNode.id ? selectedNode : n));
                  const isDivView = template !== 'company_n1';
                  setNodes(updated);
                  setSummary(calculateHeadcountSummary(updated, isDivView, selectedDivision));
                  setIsEditDialogOpen(false);
                  notify('success', 'Position hierarchy updated');
                }}
              >
                Save Changes
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
                Edit Divider Labels
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="div-left" className="font-semibold text-slate-700">Left Column Label</Label>
                <Input
                  id="div-left"
                  value={editingDivider.labelLeft || ''}
                  onChange={e => setEditingDivider({ ...editingDivider, labelLeft: e.target.value })}
                  placeholder="e.g. Brand Organization"
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="div-right" className="font-semibold text-slate-700">Right Column Label</Label>
                <Input
                  id="div-right"
                  value={editingDivider.labelRight || ''}
                  onChange={e => setEditingDivider({ ...editingDivider, labelRight: e.target.value })}
                  placeholder="e.g. Supporting Functions"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-600 hover:bg-red-50"
                onClick={() => {
                  setDividers(prev => prev.filter(d => d.id !== editingDivider.id));
                  setIsDividerDialogOpen(false);
                  notify('info', 'Divider deleted');
                }}
              >
                Delete Divider
              </Button>
              <Button
                size="sm"
                className="text-xs bg-[#B91C1C] hover:bg-red-800 text-white font-semibold shadow-xs"
                onClick={() => {
                  setDividers(prev => prev.map(d => (d.id === editingDivider.id ? editingDivider : d)));
                  setIsDividerDialogOpen(false);
                  notify('success', 'Divider labels updated');
                }}
              >
                Save
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
              Add Custom Note
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <Label htmlFor="note-text" className="text-xs font-semibold text-slate-700">
              Note Content (Multi-line supported)
            </Label>
            <textarea
              id="note-text"
              rows={4}
              placeholder="- Matin Kim&#10;- Headcount for Havaianas (5 HCs)"
              value={noteInputText}
              onChange={e => setNoteInputText(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsAddNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs bg-[#B91C1C] hover:bg-red-800 text-white font-semibold shadow-xs"
              onClick={handleSaveNote}
            >
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
