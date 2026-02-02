import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

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

    return rows.map((row, index) => ({
      id: index + 2,
      dataSource, // NEW: Track which sheet this came from
      sheetId: spreadsheetId, // NEW: For update routing
      matchScore: row[0],
      timestamp: row[1],
      positionRaw: row[2],
      source: row[3],
      jobCode: row[4],
      positionId: row[5],
      fullName: row[6],
      yob: row[7],
      gender: row[8],
      phone: row[9],
      email: row[10],
      location: row[11],
      degree: row[12],
      education: row[13],
      jobFunction: row[18],
      skills: row[19],
      certification: row[20],
      workHistory: row[17],
      summary: row[21],
      matchReason: row[22],
      cvLink: row[23],
      notes: row[36],
      isPotential: row[26] === "TRUE",
      status: row[27] || "New",
      failureReason: row[28],
      testResult: row[29],
      hrInterviewDate: row[30],
      interviewDate1: row[31],
      interviewDate2: row[32],
      offerDate: row[33],
      startDate: row[34],
      officialDate: row[35],
      rejectedRound: row[37],
      applyDate: row[38],
    }));
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

    // Reverse to show latest first
    return NextResponse.json({
      candidates: allCandidates.reverse(),
      sources: sources.map((s) => s.type), // Tell frontend which sources were fetched
    });
  } catch (error: any) {
    console.error("Fetch Candidates Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates", details: error.message },
      { status: 500 },
    );
  }
}
