import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { OrgNode, OrgChartMode } from '@/types/org-chart';

export interface DivisionSummaryTableHandle {
  copyTable: () => Promise<boolean>;
}

interface DivisionSummaryTableProps {
  mode: OrgChartMode;
  currentNodes: OrgNode[];
  proposalNodes: OrgNode[];
  activeProposalName?: string;
  onCopiedSuccess?: () => void;
}

interface DivisionDef {
  name: string;
  match: (div: string) => boolean;
}

interface GroupDef {
  groupName: string;
  divisions: DivisionDef[];
}

const STANDARD_GROUPS: GroupDef[] = [
  {
    groupName: 'CMG',
    divisions: [
      { name: 'Dyson', match: d => d.includes('dyson') },
      { name: 'Crocs', match: d => d === 'crocs' },
      { name: 'Matin Kim', match: d => d.includes('matin') }
    ]
  },
  {
    groupName: 'Sports',
    divisions: [
      { name: 'Hoka', match: d => d === 'hoka' },
      { name: 'Supersports', match: d => d === 'supersports' },
      { name: 'Sports Brands', match: d => d.includes('sports brand') },
      { name: 'Marketing', match: d => d === 'marketing' },
      { name: 'Online', match: d => d === 'online' },
      { name: 'Operations', match: d => d.includes('operation') }
    ]
  },
  {
    groupName: "Shared COE's",
    divisions: [
      { name: 'Executive Team', match: d => d.includes('executive') },
      { name: 'Planning', match: d => d.includes('planning') },
      { name: 'Leasing', match: d => d.includes('leasing') },
      { name: 'Projects', match: d => d.includes('project') },
      { name: 'Wholesale', match: d => d.includes('wholesale') },
      { name: 'Finance', match: d => d.includes('finance') },
      { name: 'Human Resources', match: d => d.includes('human resources') || d === 'hr' }
    ]
  }
];

export const DivisionSummaryTable = forwardRef<DivisionSummaryTableHandle, DivisionSummaryTableProps>(({
  mode,
  currentNodes,
  proposalNodes,
  activeProposalName = 'Đề Xuất Hiện Tại',
  onCopiedSuccess
}, ref) => {
  const isCurrent = mode === 'current';

  // Compute table rows & subtotals dynamically
  const tableData = useMemo(() => {
    const computedGroups = STANDARD_GROUPS.map(group => {
      let gHeadcount = 0;
      let gActive = 0;
      let gVacancy = 0;
      let gAsIsHC = 0;
      let gProposeHC = 0;

      const rows = group.divisions.map(div => {
        // As-Is (Current) counts
        const asIsList = currentNodes.filter(
          n => !n.isHidden && div.match((n.division || '').toLowerCase().trim())
        );
        const asIsHC = asIsList.length;
        const asIsVacant = asIsList.filter(
          n => n.status === 'vacant' || (n.nickname || '').toLowerCase() === 'vacant'
        ).length;
        const asIsActive = asIsHC - asIsVacant;

        // Propose counts
        const propList = proposalNodes.filter(
          n => !n.isHidden && div.match((n.division || '').toLowerCase().trim())
        );
        const propHC = propList.length;
        const propVacant = propList.filter(
          n => n.status === 'vacant' || (n.nickname || '').toLowerCase() === 'vacant'
        ).length;
        const propActive = propHC - propVacant;

        const headcount = isCurrent ? asIsHC : propHC;
        const active = isCurrent ? asIsActive : propActive;
        const vacancy = isCurrent ? asIsVacant : propVacant;
        const variance = propHC - asIsHC;

        gHeadcount += headcount;
        gActive += active;
        gVacancy += vacancy;
        gAsIsHC += asIsHC;
        gProposeHC += propHC;

        return {
          name: div.name,
          headcount,
          active,
          vacancy,
          asIsHC,
          proposeHC: propHC,
          variance
        };
      });

      const gVariance = gProposeHC - gAsIsHC;

      return {
        groupName: group.groupName,
        headcount: gHeadcount,
        active: gActive,
        vacancy: gVacancy,
        asIsHC: gAsIsHC,
        proposeHC: gProposeHC,
        variance: gVariance,
        rows
      };
    });

    // Check for any custom divisions not matching standard groups
    const allDivisionsInNodes = new Set<string>();
    [...currentNodes, ...proposalNodes].forEach(n => {
      if (n.division && !n.isHidden) {
        allDivisionsInNodes.add(n.division.trim());
      }
    });

    const otherDivisions: string[] = [];
    allDivisionsInNodes.forEach(divName => {
      const isMatched = STANDARD_GROUPS.some(g =>
        g.divisions.some(d => d.match(divName.toLowerCase().trim()))
      );
      if (!isMatched) {
        otherDivisions.push(divName);
      }
    });

    if (otherDivisions.length > 0) {
      let oHeadcount = 0;
      let oActive = 0;
      let oVacancy = 0;
      let oAsIsHC = 0;
      let oProposeHC = 0;

      const otherRows = otherDivisions.map(divName => {
        const asIsList = currentNodes.filter(
          n => !n.isHidden && (n.division || '').toLowerCase().trim() === divName.toLowerCase().trim()
        );
        const asIsHC = asIsList.length;
        const asIsVacant = asIsList.filter(
          n => n.status === 'vacant' || (n.nickname || '').toLowerCase() === 'vacant'
        ).length;
        const asIsActive = asIsHC - asIsVacant;

        const propList = proposalNodes.filter(
          n => !n.isHidden && (n.division || '').toLowerCase().trim() === divName.toLowerCase().trim()
        );
        const propHC = propList.length;
        const propVacant = propList.filter(
          n => n.status === 'vacant' || (n.nickname || '').toLowerCase() === 'vacant'
        ).length;
        const propActive = propHC - propVacant;

        const headcount = isCurrent ? asIsHC : propHC;
        const active = isCurrent ? asIsActive : propActive;
        const vacancy = isCurrent ? asIsVacant : propVacant;
        const variance = propHC - asIsHC;

        oHeadcount += headcount;
        oActive += active;
        oVacancy += vacancy;
        oAsIsHC += asIsHC;
        oProposeHC += propHC;

        return {
          name: divName,
          headcount,
          active,
          vacancy,
          asIsHC,
          proposeHC: propHC,
          variance
        };
      });

      computedGroups.push({
        groupName: 'Other Divisions',
        headcount: oHeadcount,
        active: oActive,
        vacancy: oVacancy,
        asIsHC: oAsIsHC,
        proposeHC: oProposeHC,
        variance: oProposeHC - oAsIsHC,
        rows: otherRows
      });
    }

    // Grand Total HO
    let totalHeadcount = 0;
    let totalActive = 0;
    let totalVacancy = 0;
    let totalAsIsHC = 0;
    let totalProposeHC = 0;

    computedGroups.forEach(g => {
      totalHeadcount += g.headcount;
      totalActive += g.active;
      totalVacancy += g.vacancy;
      totalAsIsHC += g.asIsHC;
      totalProposeHC += g.proposeHC;
    });

    const totalVariance = totalProposeHC - totalAsIsHC;

    return {
      groups: computedGroups,
      grandTotal: {
        headcount: totalHeadcount,
        active: totalActive,
        vacancy: totalVacancy,
        asIsHC: totalAsIsHC,
        proposeHC: totalProposeHC,
        variance: totalVariance
      }
    };
  }, [currentNodes, proposalNodes, isCurrent]);

  // Helper to format count value in As-Is mode:
  // If = 0, format as '-' in normal gray text
  const formatAsIsCount = (val: number, isBold: boolean = false) => {
    if (val === 0) {
      return <span className="text-slate-400 font-normal">-</span>;
    }
    return <span className={isBold ? 'font-bold' : ''}>{val}</span>;
  };

  // Helper to format variance value in Proposal mode strictly per user rules:
  // > 0: +x in red
  // < 0: -x in green
  // = 0: - in normal text
  const formatVariance = (val: number) => {
    if (val > 0) {
      return <span className="text-[#dc2626] font-bold">+{val}</span>;
    }
    if (val < 0) {
      return <span className="text-[#16a34a] font-bold">-{Math.abs(val)}</span>;
    }
    return <span className="text-slate-400 font-normal">-</span>;
  };

  // Copy table to clipboard in both TSV (plain text) and HTML formats
  const handleCopyTable = async (): Promise<boolean> => {
    try {
      let tsvText = '';
      let htmlText = '<table border="1" style="border-collapse:collapse;font-family:sans-serif;font-size:12px;">';

      if (isCurrent) {
        tsvText += "Division\tHeadcount\tActive\tVacancy\n";
        htmlText += '<thead><tr style="background:#000;color:#fff;"><th>Division</th><th style="background:#8b0000;">Headcount</th><th style="background:#ff0000;">Active</th><th style="background:#ff0000;">Vacancy</th></tr></thead><tbody>';

        // CBS VN's HO Total
        const hcText = tableData.grandTotal.headcount === 0 ? '-' : `${tableData.grandTotal.headcount}`;
        const actText = tableData.grandTotal.active === 0 ? '-' : `${tableData.grandTotal.active}`;
        const vacText = tableData.grandTotal.vacancy === 0 ? '-' : `${tableData.grandTotal.vacancy}`;

        tsvText += `CBS VN's HO Total\t${hcText}\t${actText}\t${vacText}\n`;
        htmlText += `<tr style="background:#fde2e2;font-weight:bold;"><td>CBS VN's HO Total</td><td align="center">${hcText}</td><td align="center">${actText}</td><td align="center">${vacText}</td></tr>`;

        // Groups & Children
        tableData.groups.forEach(g => {
          const gHc = g.headcount === 0 ? '-' : `${g.headcount}`;
          const gAct = g.active === 0 ? '-' : `${g.active}`;
          const gVac = g.vacancy === 0 ? '-' : `${g.vacancy}`;

          tsvText += `  ${g.groupName}\t${gHc}\t${gAct}\t${gVac}\n`;
          htmlText += `<tr style="background:#d9d9d9;font-weight:bold;"><td style="padding-left:16px;">${g.groupName}</td><td align="center">${gHc}</td><td align="center">${gAct}</td><td align="center">${gVac}</td></tr>`;

          g.rows.forEach(r => {
            const rHc = r.headcount === 0 ? '-' : `${r.headcount}`;
            const rAct = r.active === 0 ? '-' : `${r.active}`;
            const rVac = r.vacancy === 0 ? '-' : `${r.vacancy}`;

            tsvText += `    ${r.name}\t${rHc}\t${rAct}\t${rVac}\n`;
            htmlText += `<tr><td style="padding-left:32px;">${r.name}</td><td align="center">${rHc}</td><td align="center">${rAct}</td><td align="center">${rVac}</td></tr>`;
          });
        });

        htmlText += '</tbody></table>';
      } else {
        tsvText += "Division\tAs-is HC\tPropose HC\tVariance\n";
        htmlText += '<thead><tr style="background:#000;color:#fff;"><th>Division</th><th style="background:#8b0000;">As-is HC</th><th style="background:#ff0000;">Propose HC</th><th style="background:#ff0000;">Variance</th></tr></thead><tbody>';

        // CBS VN's HO Total
        const gVarText = tableData.grandTotal.variance > 0 ? `+${tableData.grandTotal.variance}` : tableData.grandTotal.variance === 0 ? '-' : `${tableData.grandTotal.variance}`;
        const gVarColor = tableData.grandTotal.variance > 0 ? 'color:#dc2626;' : tableData.grandTotal.variance < 0 ? 'color:#16a34a;' : 'color:#64748b;';
        tsvText += `CBS VN's HO Total\t${tableData.grandTotal.asIsHC}\t${tableData.grandTotal.proposeHC}\t${gVarText}\n`;
        htmlText += `<tr style="background:#fde2e2;font-weight:bold;"><td>CBS VN's HO Total</td><td align="center">${tableData.grandTotal.asIsHC}</td><td align="center">${tableData.grandTotal.proposeHC}</td><td align="center" style="${gVarColor}">${gVarText}</td></tr>`;

        // Groups & Children
        tableData.groups.forEach(g => {
          const varText = g.variance > 0 ? `+${g.variance}` : g.variance === 0 ? '-' : `${g.variance}`;
          const varColor = g.variance > 0 ? 'color:#dc2626;' : g.variance < 0 ? 'color:#16a34a;' : 'color:#64748b;';
          tsvText += `  ${g.groupName}\t${g.asIsHC}\t${g.proposeHC}\t${varText}\n`;
          htmlText += `<tr style="background:#d9d9d9;font-weight:bold;"><td style="padding-left:16px;">${g.groupName}</td><td align="center">${g.asIsHC}</td><td align="center">${g.proposeHC}</td><td align="center" style="${varColor}">${varText}</td></tr>`;

          g.rows.forEach(r => {
            const rVarText = r.variance > 0 ? `+${r.variance}` : r.variance === 0 ? '-' : `${r.variance}`;
            const rVarColor = r.variance > 0 ? 'color:#dc2626;' : r.variance < 0 ? 'color:#16a34a;' : 'color:#64748b;';
            tsvText += `    ${r.name}\t${r.asIsHC}\t${r.proposeHC}\t${rVarText}\n`;
            htmlText += `<tr><td style="padding-left:32px;">${r.name}</td><td align="center">${r.asIsHC}</td><td align="center">${r.proposeHC}</td><td align="center" style="${rVarColor}">${rVarText}</td></tr>`;
          });
        });

        htmlText += '</tbody></table>';
      }

      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          'text/plain': new Blob([tsvText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' })
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(tsvText);
      }

      if (onCopiedSuccess) onCopiedSuccess();
      return true;
    } catch (err) {
      console.error('Failed to copy table:', err);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    copyTable: handleCopyTable
  }));

  return (
    <div className="w-full h-full flex items-center justify-center p-2 bg-slate-100/70 select-text overflow-hidden">
      {/* Tight Clean Table Box - Exact 100% Fit Viewport Without Scrolling */}
      <div className="w-full max-w-[560px] bg-white border border-slate-400 shadow-md select-text">
        <table className="w-full border-collapse text-[11.5px] leading-tight select-text">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-400 h-7">
              <th className="bg-[#000000] text-white font-bold text-center px-3 py-1 border-r border-slate-400 w-[230px]">
                Division
              </th>
              <th className="bg-[#8b0000] text-white font-bold text-center px-2 py-1 border-r border-slate-400 w-[110px]">
                {isCurrent ? 'Headcount' : 'As-is HC'}
              </th>
              <th className="bg-[#ff0000] text-white font-bold text-center px-2 py-1 border-r border-slate-400 w-[110px]">
                {isCurrent ? 'Active' : 'Propose HC'}
              </th>
              <th className="bg-[#ff0000] text-white font-bold text-center px-2 py-1 w-[110px]">
                {isCurrent ? 'Vacancy' : 'Variance'}
              </th>
            </tr>
          </thead>

          <tbody>
            {/* CBS VN's HO Total Row (Pink Background, Indent 0) */}
            <tr className="bg-[#fde2e2] font-bold border-b border-slate-400 text-slate-900 h-6">
              <td className="pl-3 pr-2 py-[3px] border-r border-slate-400 text-left">
                CBS VN&apos;s HO Total
              </td>
              <td className="px-2 py-[3px] border-r border-slate-400 text-center font-bold">
                {isCurrent ? formatAsIsCount(tableData.grandTotal.headcount, true) : tableData.grandTotal.asIsHC}
              </td>
              <td className="px-2 py-[3px] border-r border-slate-400 text-center font-bold">
                {isCurrent ? formatAsIsCount(tableData.grandTotal.active, true) : tableData.grandTotal.proposeHC}
              </td>
              <td className="px-2 py-[3px] text-center font-bold">
                {isCurrent ? formatAsIsCount(tableData.grandTotal.vacancy, true) : formatVariance(tableData.grandTotal.variance)}
              </td>
            </tr>

            {/* Group Subtotals and Children Rows */}
            {tableData.groups.map(group => (
              <React.Fragment key={group.groupName}>
                {/* Group Subtotal Row (Gray Background, Indent Level 1: pl-6) */}
                <tr className="bg-[#d9d9d9] font-bold border-b border-slate-400 text-slate-900 h-6">
                  <td className="pl-6 pr-2 py-[3px] border-r border-slate-400 text-left">
                    {group.groupName}
                  </td>
                  <td className="px-2 py-[3px] border-r border-slate-400 text-center font-bold">
                    {isCurrent ? formatAsIsCount(group.headcount, true) : group.asIsHC}
                  </td>
                  <td className="px-2 py-[3px] border-r border-slate-400 text-center font-bold">
                    {isCurrent ? formatAsIsCount(group.active, true) : group.proposeHC}
                  </td>
                  <td className="px-2 py-[3px] text-center font-bold">
                    {isCurrent ? formatAsIsCount(group.vacancy, true) : formatVariance(group.variance)}
                  </td>
                </tr>

                {/* Child Division Rows (Indent Level 2: pl-10) */}
                {group.rows.map(row => (
                  <tr
                    key={row.name}
                    className="bg-white hover:bg-slate-50 border-b border-slate-300 transition-colors h-[22px]"
                  >
                    <td className="pl-10 pr-2 py-[2.5px] border-r border-slate-300 text-left text-slate-800 font-medium">
                      {row.name}
                    </td>
                    <td className="px-2 py-[2.5px] border-r border-slate-300 text-center text-slate-800">
                      {isCurrent ? formatAsIsCount(row.headcount) : row.asIsHC}
                    </td>
                    <td className="px-2 py-[2.5px] border-r border-slate-300 text-center text-slate-800">
                      {isCurrent ? formatAsIsCount(row.active) : row.proposeHC}
                    </td>
                    <td className="px-2 py-[2.5px] text-center text-slate-800">
                      {isCurrent ? formatAsIsCount(row.vacancy) : formatVariance(row.variance)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

DivisionSummaryTable.displayName = 'DivisionSummaryTable';
