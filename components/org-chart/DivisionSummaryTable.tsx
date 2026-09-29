import React, { useState, useMemo } from 'react';
import { OrgNode, OrgChartMode } from '@/types/org-chart';
import { Copy, Check, Download, Table as TableIcon, Sparkles } from 'lucide-react';

interface DivisionSummaryTableProps {
  mode: OrgChartMode;
  currentNodes: OrgNode[];
  proposalNodes: OrgNode[];
  activeProposalName?: string;
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

export const DivisionSummaryTable: React.FC<DivisionSummaryTableProps> = ({
  mode,
  currentNodes,
  proposalNodes,
  activeProposalName = 'Đề Xuất Hiện Tại'
}) => {
  const [copied, setCopied] = useState(false);

  const isCurrent = mode === 'current';

  // Compute table rows & subtotals dynamically
  const tableData = useMemo(() => {
    const matchedDivNames = new Set<string>();

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

  // Helper to format variance value strictly per user requirements:
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
    return <span className="text-slate-500 font-normal">-</span>;
  };

  // Copy table to clipboard in both TSV (plain text) and HTML formats
  const handleCopyTable = async () => {
    try {
      let tsvText = '';
      let htmlText = '<table border="1" style="border-collapse:collapse;font-family:sans-serif;">';

      if (isCurrent) {
        tsvText += 'Division\tHeadcount\tActive\tVacancy\n';
        htmlText += '<thead><tr style="background:#000;color:#fff;"><th>Division</th><th style="background:#8b0000;">Headcount</th><th style="background:#ff0000;">Active</th><th style="background:#ff0000;">Vacancy</th></tr></thead><tbody>';

        // HO Total
        tsvText += `HO Total\t${tableData.grandTotal.headcount}\t${tableData.grandTotal.active}\t${tableData.grandTotal.vacancy}\n`;
        htmlText += `<tr style="background:#fde2e2;font-weight:bold;"><td>HO Total</td><td align="center">${tableData.grandTotal.headcount}</td><td align="center">${tableData.grandTotal.active}</td><td align="center">${tableData.grandTotal.vacancy}</td></tr>`;

        // Groups & Children
        tableData.groups.forEach(g => {
          tsvText += `${g.groupName}\t${g.headcount}\t${g.active}\t${g.vacancy}\n`;
          htmlText += `<tr style="background:#d9d9d9;font-weight:bold;"><td>${g.groupName}</td><td align="center">${g.headcount}</td><td align="center">${g.active}</td><td align="center">${g.vacancy}</td></tr>`;

          g.rows.forEach(r => {
            tsvText += `\t${r.name}\t${r.headcount}\t${r.active}\t${r.vacancy}\n`;
            htmlText += `<tr><td style="padding-left:24px;">${r.name}</td><td align="center">${r.headcount}</td><td align="center">${r.active}</td><td align="center">${r.vacancy}</td></tr>`;
          });
        });

        htmlText += '</tbody></table>';
      } else {
        tsvText += 'Division\tAs-is HC\tPropose HC\tVariance\n';
        htmlText += '<thead><tr style="background:#000;color:#fff;"><th>Division</th><th style="background:#8b0000;">As-is HC</th><th style="background:#ff0000;">Propose HC</th><th style="background:#ff0000;">Variance</th></tr></thead><tbody>';

        // HO Total
        const gVarText = tableData.grandTotal.variance > 0 ? `+${tableData.grandTotal.variance}` : tableData.grandTotal.variance === 0 ? '-' : `${tableData.grandTotal.variance}`;
        const gVarColor = tableData.grandTotal.variance > 0 ? 'color:#dc2626;' : tableData.grandTotal.variance < 0 ? 'color:#16a34a;' : 'color:#64748b;';
        tsvText += `HO Total\t${tableData.grandTotal.asIsHC}\t${tableData.grandTotal.proposeHC}\t${gVarText}\n`;
        htmlText += `<tr style="background:#fde2e2;font-weight:bold;"><td>HO Total</td><td align="center">${tableData.grandTotal.asIsHC}</td><td align="center">${tableData.grandTotal.proposeHC}</td><td align="center" style="${gVarColor}">${gVarText}</td></tr>`;

        // Groups & Children
        tableData.groups.forEach(g => {
          const varText = g.variance > 0 ? `+${g.variance}` : g.variance === 0 ? '-' : `${g.variance}`;
          const varColor = g.variance > 0 ? 'color:#dc2626;' : g.variance < 0 ? 'color:#16a34a;' : 'color:#64748b;';
          tsvText += `${g.groupName}\t${g.asIsHC}\t${g.proposeHC}\t${varText}\n`;
          htmlText += `<tr style="background:#d9d9d9;font-weight:bold;"><td>${g.groupName}</td><td align="center">${g.asIsHC}</td><td align="center">${g.proposeHC}</td><td align="center" style="${varColor}">${varText}</td></tr>`;

          g.rows.forEach(r => {
            const rVarText = r.variance > 0 ? `+${r.variance}` : r.variance === 0 ? '-' : `${r.variance}`;
            const rVarColor = r.variance > 0 ? 'color:#dc2626;' : r.variance < 0 ? 'color:#16a34a;' : 'color:#64748b;';
            tsvText += `\t${r.name}\t${r.asIsHC}\t${r.proposeHC}\t${rVarText}\n`;
            htmlText += `<tr><td style="padding-left:24px;">${r.name}</td><td align="center">${r.asIsHC}</td><td align="center">${r.proposeHC}</td><td align="center" style="${rVarColor}">${rVarText}</td></tr>`;
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

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy table:', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8 bg-slate-100/90 select-text">
      {/* Top Card Container */}
      <div className="w-full max-w-[680px] bg-white rounded-xl shadow-lg border border-slate-300 p-6 flex flex-col gap-4">
        {/* Title Bar & Actions */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isCurrent
                  ? 'BẢNG TỔNG HỢP ĐỊNH BIÊN HIỆN TẠI'
                  : `BẢNG TỔNG HỢP ĐỀ XUẤT - ${activeProposalName.toUpperCase()}`}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isCurrent
                  ? 'Thống kê Tổng số ghế, Số ghế hoạt động & Số ghế trống theo Khối & Phòng ban'
                  : 'Đối soát số ghế Hiện tại (As-Is), Đề xuất (Propose) và Chênh lệch (Variance)'}
              </p>
            </div>
          </div>

          {/* Copy Table Button */}
          <button
            onClick={handleCopyTable}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title="Sao chép bảng để dán trực tiếp vào Excel hoặc Google Sheets"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép bảng</span>
              </>
            )}
          </button>
        </div>

        {/* The Table */}
        <div className="w-full overflow-x-auto border border-slate-400 rounded-sm">
          <table className="w-full border-collapse text-xs md:text-sm select-text">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-400">
                <th className="bg-[#000000] text-white font-bold text-center px-4 py-2 border-r border-slate-400 w-[240px]">
                  Division
                </th>
                <th className="bg-[#8b0000] text-white font-bold text-center px-4 py-2 border-r border-slate-400 w-[110px]">
                  {isCurrent ? 'Headcount' : 'As-is HC'}
                </th>
                <th className="bg-[#ff0000] text-white font-bold text-center px-4 py-2 border-r border-slate-400 w-[110px]">
                  {isCurrent ? 'Active' : 'Propose HC'}
                </th>
                <th className="bg-[#ff0000] text-white font-bold text-center px-4 py-2 w-[110px]">
                  {isCurrent ? 'Vacancy' : 'Variance'}
                </th>
              </tr>
            </thead>

            <tbody>
              {/* HO Total Row (Pink Background) */}
              <tr className="bg-[#fde2e2] font-bold border-b border-slate-400 text-slate-900">
                <td className="px-4 py-2 border-r border-slate-400 text-left">
                  HO Total
                </td>
                <td className="px-4 py-2 border-r border-slate-400 text-center font-bold">
                  {isCurrent ? tableData.grandTotal.headcount : tableData.grandTotal.asIsHC}
                </td>
                <td className="px-4 py-2 border-r border-slate-400 text-center font-bold">
                  {isCurrent ? tableData.grandTotal.active : tableData.grandTotal.proposeHC}
                </td>
                <td className="px-4 py-2 text-center font-bold">
                  {isCurrent ? tableData.grandTotal.vacancy : formatVariance(tableData.grandTotal.variance)}
                </td>
              </tr>

              {/* Group Subtotals and Children Rows */}
              {tableData.groups.map(group => (
                <React.Fragment key={group.groupName}>
                  {/* Group Subtotal Row (Gray Background) */}
                  <tr className="bg-[#d9d9d9] font-bold border-b border-slate-400 text-slate-900">
                    <td className="px-4 py-2 border-r border-slate-400 text-left">
                      {group.groupName}
                    </td>
                    <td className="px-4 py-2 border-r border-slate-400 text-center font-bold">
                      {isCurrent ? group.headcount : group.asIsHC}
                    </td>
                    <td className="px-4 py-2 border-r border-slate-400 text-center font-bold">
                      {isCurrent ? group.active : group.proposeHC}
                    </td>
                    <td className="px-4 py-2 text-center font-bold">
                      {isCurrent ? group.vacancy : formatVariance(group.variance)}
                    </td>
                  </tr>

                  {/* Child Division Rows */}
                  {group.rows.map(row => (
                    <tr
                      key={row.name}
                      className="bg-white hover:bg-slate-50 border-b border-slate-300 transition-colors"
                    >
                      <td className="pl-8 pr-4 py-1.5 border-r border-slate-300 text-left text-slate-800 font-medium">
                        {row.name}
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300 text-center text-slate-800">
                        {isCurrent ? row.headcount : row.asIsHC}
                      </td>
                      <td className="px-4 py-1.5 border-r border-slate-300 text-center text-slate-800">
                        {isCurrent ? row.active : row.proposeHC}
                      </td>
                      <td className="px-4 py-1.5 text-center text-slate-800">
                        {isCurrent ? row.vacancy : formatVariance(row.variance)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote / Helper tip */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            {isCurrent
              ? '* Dữ liệu được tính toán thời gian thực theo toàn bộ định biên Head Office.'
              : '* Chênh lệch (Variance) = Propose HC - As-is HC (+ đỏ: tăng vị trí, - xanh: giảm vị trí).'}
          </span>
          <span className="italic">Có thể bôi đen chuột để sao chép trực tiếp</span>
        </div>
      </div>
    </div>
  );
};
