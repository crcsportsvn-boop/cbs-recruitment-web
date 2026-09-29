import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { OrgNode, NodeFlag, NodeStatus } from "@/types/org-chart";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID_HO =
  process.env.GOOGLE_SHEET_ID_HO ||
  process.env.GOOGLE_SHEET_ID ||
  "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";

const SHEET_ASIS = "org-asis";
const SHEET_PROPOSE = "org-propose";

const HEADERS = [
  "Position ID",
  "Position Name",
  "Division",
  "Department",
  "Sub Dept",
  "Job Grade",
  "Reports to Position ID",
  "Report to Position Name",
  "Full Name",
  "Nickname",
  "Flags",
  "Status",
  "Custom Label",
  "Group"
];

function getServiceAccountAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
    }
  }

  if (!credentials && process.env.GOOGLE_CLIENT_EMAIL) {
    credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    };
  }

  if (credentials && credentials.client_email) {
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
  }

  return null;
}

function getUserOAuth(req: NextRequest) {
  const tokensCookie = req.cookies.get("google_tokens");
  if (tokensCookie) {
    try {
      const tokens = JSON.parse(tokensCookie.value);
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NODE_ENV === "production"
          ? "https://cbs-recruitment-web.vercel.app/api/auth/callback"
          : "http://localhost:3000/api/auth/callback"
      );
      oauth2Client.setCredentials(tokens);
      return oauth2Client;
    } catch (e) {
      console.warn("Failed to parse user google_tokens cookie:", e);
    }
  }
  return null;
}

function getGoogleAuth(req: NextRequest) {
  // 1. Try user OAuth from cookie
  const userAuth = getUserOAuth(req);
  if (userAuth) return userAuth;

  // 2. Fallback to Service Account
  return getServiceAccountAuth();
}

function parseRowsToNodes(rows: any[][]): OrgNode[] {
  if (!rows || rows.length <= 1) return [];

  const nodes: OrgNode[] = [];
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const id = String(row[0] || "").trim();
    if (!id) continue;

    const title = String(row[1] || "").trim();
    const division = String(row[2] || "").trim();
    const dept = String(row[3] || "").trim();
    const subDept = String(row[4] || "").trim();
    const jobGrade = String(row[5] || "").trim();
    const reportsToId = String(row[6] || "").trim();
    const reportsToTitle = String(row[7] || "").trim();
    const holderName = String(row[8] || "").trim();
    const nickname = String(row[9] || "").trim();
    const rawFlags = String(row[10] || "").trim();
    const rawStatus = String(row[11] || "").trim();
    const customLabel = String(row[12] || "").trim();
    const group = String(row[13] || "Office").trim();

    const flags: NodeFlag[] = rawFlags
      ? (rawFlags.split(",").map(f => f.trim() as NodeFlag))
      : ["VN"];

    const status: NodeStatus = (
      ["active", "vacant", "new_hire", "replace", "highlight"].includes(rawStatus)
        ? rawStatus
        : "active"
    ) as NodeStatus;

    nodes.push({
      id,
      title,
      division: division || "Head Office",
      dept: dept || division || "Head Office",
      subDept: subDept || undefined,
      jobGrade: jobGrade || undefined,
      reportsToId: reportsToId || undefined,
      reportsToTitle: reportsToTitle || undefined,
      holderName: holderName || undefined,
      nickname: nickname || undefined,
      flags,
      status,
      customLabel: customLabel || undefined,
      groupType: group === "Stores" ? "Stores" : group === "Intern" ? "Intern" : "Office"
    });
  }

  return nodes;
}

function nodesToRows(nodes: OrgNode[]): any[][] {
  const rows: any[][] = [HEADERS];
  for (const n of nodes) {
    if (n.isVirtual || n.isSupervisor) continue;

    rows.push([
      n.id || "",
      n.title || "",
      n.division || "",
      n.dept || "",
      n.subDept || "",
      n.jobGrade || "",
      n.reportsToId || "",
      n.reportsToTitle || "",
      n.holderName || "",
      n.nickname || "",
      (n.flags || []).join(","),
      n.status || "active",
      n.customLabel || "",
      n.groupType || "Office"
    ]);
  }
  return rows;
}

function getProposalSheetName(proposalId: number | string = 1): string {
  const num = Number(proposalId) || 1;
  if (num <= 1) return "org-propose";
  return `org-propose${num}`;
}

/**
 * GET /api/org-chart/sync
 * Reads org-asis and all available proposal sheets (org-propose, org-propose2..5) from Google Sheet HO
 */
export async function GET(req: NextRequest) {
  try {
    const auth = getGoogleAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Chưa cấu hình xác thực hệ thống lưu trữ (cần đăng nhập Google hoặc Service Account)" },
        { status: 401 }
      );
    }

    const sheets = google.sheets({ version: "v4", auth });

    // Read org-asis and all 5 proposal sheets in parallel
    const sheetRanges = [
      { key: "asis", range: `'${SHEET_ASIS}'!A:N` },
      { key: "1", range: `'org-propose'!A:N` },
      { key: "2", range: `'org-propose2'!A:N` },
      { key: "3", range: `'org-propose3'!A:N` },
      { key: "4", range: `'org-propose4'!A:N` },
      { key: "5", range: `'org-propose5'!A:N` }
    ];

    const results = await Promise.allSettled(
      sheetRanges.map(r =>
        sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID_HO,
          range: r.range
        })
      )
    );

    const asisResult = results[0];
    const asisRows = asisResult && asisResult.status === "fulfilled" ? asisResult.value.data.values || [] : [];
    const asisNodes = parseRowsToNodes(asisRows);

    const proposalsMap: Record<number, OrgNode[]> = {};
    for (let i = 1; i <= 5; i++) {
      const res = results[i];
      const rows = res && res.status === "fulfilled" ? res.value.data.values || [] : [];
      proposalsMap[i] = parseRowsToNodes(rows);
    }

    const proposalParam = Number(req.nextUrl.searchParams.get("proposal")) || 1;
    const activeProposeNodes = proposalsMap[proposalParam] || proposalsMap[1] || [];

    return NextResponse.json({
      success: true,
      spreadsheetId: SPREADSHEET_ID_HO,
      asis: asisNodes,
      propose: activeProposeNodes,
      proposals: proposalsMap,
      hasAsis: asisNodes.length > 0,
      hasPropose: activeProposeNodes.length > 0,
      activeProposalId: proposalParam
    });
  } catch (error: any) {
    console.error("GET /api/org-chart/sync error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi đọc dữ liệu từ hệ thống" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/org-chart/sync
 * Writes data back to org-asis and/or specific org-propose (1..5) in Google Sheet HO
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getGoogleAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Chưa cấu hình xác thực hệ thống lưu trữ (cần đăng nhập Google hoặc Service Account)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const target: "asis" | "propose" | "both" = body.target || "propose";
    const proposalId: number = Number(body.proposalId) || 1;
    const nodes: OrgNode[] = body.nodes || [];

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json(
        { error: "Danh sách vị trí (nodes) không được để trống" },
        { status: 400 }
      );
    }

    const sheets = google.sheets({ version: "v4", auth });
    const rows = nodesToRows(nodes);

    const targetProposalSheet = getProposalSheetName(proposalId);
    const updateTasks: Promise<any>[] = [];

    if (target === "asis" || target === "both") {
      updateTasks.push(
        (async () => {
          // Clear existing data then write all rows
          await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: `'${SHEET_ASIS}'!A:N`
          });
          return sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: `'${SHEET_ASIS}'!A1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: rows }
          });
        })()
      );
    }

    if (target === "propose" || target === "both") {
      updateTasks.push(
        (async () => {
          await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: `'${targetProposalSheet}'!A:N`
          });
          return sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: `'${targetProposalSheet}'!A1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: rows }
          });
        })()
      );
    }

    await Promise.all(updateTasks);

    const targetSheetLabel = target === "asis" ? SHEET_ASIS : targetProposalSheet;

    return NextResponse.json({
      success: true,
      target,
      proposalId,
      sheetName: targetSheetLabel,
      count: nodes.length,
      spreadsheetId: SPREADSHEET_ID_HO,
      message: `Đã ghi thành công ${nodes.length} ghế lên hệ thống`
    });
  } catch (error: any) {
    console.error("POST /api/org-chart/sync error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi ghi dữ liệu lên hệ thống" },
      { status: 500 }
    );
  }
}
