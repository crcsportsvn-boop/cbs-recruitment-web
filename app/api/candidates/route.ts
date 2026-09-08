import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';

// Sheet Configuration
const SPREADSHEET_ID_HO =
  process.env.GOOGLE_SHEET_ID_HO ||
  "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SPREADSHEET_ID_ST = process.env.GOOGLE_SHEET_ID_ST || "";
const SHEET_NAME = "Datapool";

// Helper: Get user role from /api/user logic
async function getUserRole(
  req: NextRequest,
): Promise<{ role: string; email: string }> {
  try {
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) return { role: "Guest", email: "" };

    const tokens = JSON.parse(tokensCookie.value);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials(tokens);

    // Get user email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || "";

    // Check role in User_view sheet
    let credentials;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      } catch (e) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", e);
      }
    }

    if (!credentials) {
      credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      };
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID_HO,
      range: "User_view!A:B",
    });

    const rows = response.data.values || [];
    const userRow = rows.find(
      (r) => r[0]?.toString().toLowerCase() === email.toLowerCase(),
    );

    return {
      role: userRow ? userRow[1] || "User" : "Guest",
      email,
    };
  } catch (error) {
    console.error("getUserRole error:", error);
    return { role: "Guest", email: "" };
  }
}

// Helper: Fetch candidates from a specific sheet
async function fetchFromSheet(
  oauth2Client: any,
  spreadsheetId: string,
  dataSource: "HO" | "ST",
): Promise<any[]> {
  if (!spreadsheetId) return [];

  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:AM`,
    });

    const rows = response.data.values || [];

    return rows.map((row, index) => {
      const cand: any = {
        id: index + 2,
        dataSource, // Track which sheet this came from
        sheetId: spreadsheetId, // For update routing
        matchScore: row[0] ? String(row[0]).trim() : "0",
        timestamp: row[1] ? String(row[1]).trim() : "",
        positionRaw: row[2] ? String(row[2]).trim() : "",
        source: row[3] ? String(row[3]).trim() : "",
        jobCode: row[4] ? String(row[4]).trim() : "",
        positionId: row[5] ? String(row[5]).trim() : "",
        fullName: row[6] ? String(row[6]).trim() : "",
        isPotential: row[26] === "TRUE",
        status: (row[27] && String(row[27]).trim()) || "New",
      };

      // Only attach optional fields if non-empty to optimize payload size
      if (row[7]) cand.yob = String(row[7]).trim();
      if (row[8]) cand.gender = String(row[8]).trim();
      if (row[9]) cand.phone = String(row[9]).trim();
      if (row[10]) cand.email = String(row[10]).trim();
      if (row[11]) cand.location = String(row[11]).trim();
      if (row[12]) cand.degree = String(row[12]).trim();
      if (row[13]) cand.education = String(row[13]).trim();
      if (row[17]) cand.workHistory = String(row[17]).trim();
      if (row[18]) cand.jobFunction = String(row[18]).trim();
      if (row[19]) cand.skills = String(row[19]).trim();
      if (row[20]) cand.certification = String(row[20]).trim();
      if (row[21]) cand.summary = String(row[21]).trim();
      if (row[22]) cand.matchReason = String(row[22]).trim();
      if (row[23]) cand.cvLink = String(row[23]).trim();
      if (row[28]) cand.failureReason = String(row[28]).trim();
      if (row[29]) cand.testResult = String(row[29]).trim();
      if (row[30]) cand.hrInterviewDate = String(row[30]).trim();
      if (row[31]) cand.interviewDate1 = String(row[31]).trim();
      if (row[32]) cand.interviewDate2 = String(row[32]).trim();
      if (row[33]) cand.offerDate = String(row[33]).trim();
      if (row[34]) cand.startDate = String(row[34]).trim();
      if (row[35]) cand.officialDate = String(row[35]).trim();
      if (row[36]) cand.notes = String(row[36]).trim();
      if (row[37]) cand.rejectedRound = String(row[37]).trim();
      if (row[38]) cand.applyDate = String(row[38]).trim();

      return cand;
    });
  } catch (error: any) {
    console.error(`Error fetching from ${dataSource} sheet:`, error.message);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Get OAuth tokens from cookie
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json(
        { error: "Not authenticated", redirect: "/api/auth/login" },
        { status: 401 },
      );
    }

    const tokens = JSON.parse(tokensCookie.value);

    // 2. Auth with Google
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials(tokens);

    // 3. Get user role to determine data sources
    const { role } = await getUserRole(req);
    console.log(`📊 Fetching candidates for role: ${role}`);

    // 4. Determine which sheets to fetch based on role
    const sources: { type: "HO" | "ST"; sheetId: string }[] = [];

    if (role === "HO_Recruiter") {
      // HO users only see HO data
      sources.push({ type: "HO", sheetId: SPREADSHEET_ID_HO });
    } else if (role === "ST_Recruiter") {
      // Store users only see Store data
      if (SPREADSHEET_ID_ST) {
        sources.push({ type: "ST", sheetId: SPREADSHEET_ID_ST });
      }
    } else if (role === "Manager") {
      // Manager sees combined view from both sources
      sources.push({ type: "HO", sheetId: SPREADSHEET_ID_HO });
      if (SPREADSHEET_ID_ST) {
        sources.push({ type: "ST", sheetId: SPREADSHEET_ID_ST });
      }
    } else {
      // Guest or unknown role - default to HO (existing behavior)
      sources.push({ type: "HO", sheetId: SPREADSHEET_ID_HO });
    }

    // 5. Parallel fetch from all sources
    const fetchPromises = sources.map((src) =>
      fetchFromSheet(oauth2Client, src.sheetId, src.type),
    );
    const results = await Promise.all(fetchPromises);

    // 6. Combine and sort by timestamp (latest first)
    const allCandidates = results.flat();
    allCandidates.sort((a, b) => {
      // Sort by ID descending (latest entries have higher IDs per sheet)
      // For combined view, interleave by keeping original order then reversing
      return 0; // Keep fetch order
    });

    // Check if sync/force-refresh was requested
    const isSync = req.nextUrl.searchParams.get("sync") === "1";
    const cacheControl = isSync 
      ? "no-store, no-cache, must-revalidate"
      : "private, max-age=120, stale-while-revalidate=300";

    // Reverse to show latest first
    return NextResponse.json(
      {
        candidates: allCandidates.reverse(),
        sources: sources.map((s) => s.type), // Tell frontend which sources were fetched
      },
      {
        headers: {
          "Cache-Control": cacheControl,
        },
      },
    );
  } catch (error: any) {
    console.error("Fetch Candidates Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates", details: error.message },
      { status: 500 },
    );
  }
}
