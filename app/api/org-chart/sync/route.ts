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

/**
 * GET /api/org-chart/sync
 * Reads the latest org-asis and org-propose data from Google Sheet HO
 */
export async function GET(req: NextRequest) {
  try {
    const auth = getGoogleAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Chưa cấu hình xác thực Google Sheets (cần đăng nhập Google hoặc Service Account)" },
        { status: 401 }
      );
    }

    const sheets = google.sheets({ version: "v4", auth });

    // Read both org-asis and org-propose in parallel
    const [asisRes, proposeRes] = await Promise.allSettled([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID_HO,
        range: `'${SHEET_ASIS}'!A:N`
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID_HO,
        range: `'${SHEET_PROPOSE}'!A:N`
      })
    ]);

    const asisRows = asisRes.status === "fulfilled" ? asisRes.value.data.values || [] : [];
    const proposeRows = proposeRes.status === "fulfilled" ? proposeRes.value.data.values || [] : [];

    const asisNodes = parseRowsToNodes(asisRows);
    const proposeNodes = parseRowsToNodes(proposeRows);

    return NextResponse.json({
      success: true,
      spreadsheetId: SPREADSHEET_ID_HO,
      asis: asisNodes,
      propose: proposeNodes,
      hasAsis: asisNodes.length > 0,
      hasPropose: proposeNodes.length > 0
    });
  } catch (error: any) {
    console.error("GET /api/org-chart/sync error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi đọc dữ liệu từ Google Sheets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/org-chart/sync
 * Writes data back to org-asis and/or org-propose in Google Sheet HO
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getGoogleAuth(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Chưa cấu hình xác thực Google Sheets (cần đăng nhập Google hoặc Service Account)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const target: "asis" | "propose" | "both" = body.target || "propose";
    const nodes: OrgNode[] = body.nodes || [];

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json(
        { error: "Danh sách vị trí (nodes) không được để trống" },
        { status: 400 }
      );
    }

    const sheets = google.sheets({ version: "v4", auth });
    const rows = nodesToRows(nodes);

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
            range: `'${SHEET_PROPOSE}'!A:N`
          });
          return sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: `'${SHEET_PROPOSE}'!A1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: rows }
          });
        })()
      );
    }

    await Promise.all(updateTasks);

    return NextResponse.json({
      success: true,
      target,
      count: nodes.length,
      spreadsheetId: SPREADSHEET_ID_HO,
      message: `Đã ghi thành công ${nodes.length} ghế vào Google Sheet HO [${target}]`
    });
  } catch (error: any) {
    console.error("POST /api/org-chart/sync error:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi ghi dữ liệu vào Google Sheets" },
      { status: 500 }
    );
  }
}
