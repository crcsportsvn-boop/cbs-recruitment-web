
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID_HO = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME_HO = "Jobs";

const SPREADSHEET_ID_ST = process.env.GOOGLE_SHEET_ID_ST || "";
const SHEET_NAME_ST = "Job"; // User specified singular "Job"

// Helper to determine role (duplicated to avoid external deps issues)
async function getUserRole(
    oauth2Client: any, 
    req: NextRequest
  ): Promise<{ role: string; email: string }> {
    try {
      // 1. Get user email
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email || "";
  
      // 2. Check role in User_view sheet using Service Account
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
        spreadsheetId: SPREADSHEET_ID_HO, // User_view is always in HO Sheet
        range: "User_view!A:B",
      });
  
      const rows = response.data.values || [];
      const userRow = rows.find((r) => r[0]?.toString().toLowerCase() === email.toLowerCase());
      
      const role = userRow ? (userRow[1] || "User") : "Guest";
      return { role, email };
  
    } catch (error) {
      console.error("Role Check Error", error);
      return { role: "Guest", email: "" };
    }
}

async function fetchJobsFromSheet(auth: any, spreadsheetId: string, sheetName: string, defaultGroup: string) {
    const sheets = google.sheets({ version: "v4", auth });
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A2:F`,
        });

        const rows = response.data.values || [];
        return rows.map((row) => ({
            positionId: row[0] || "",
            jobCode: row[1] || "",
            title: row[2] || "",
            group: row[3] || defaultGroup,
            status: row[4] || "Hiring",
            stopDate: row[5] || "",
            reason: row[6] || "",
        }));
    } catch (error: any) {
        console.warn(`Failed to fetch jobs from ${sheetName}:`, error.message);
        return [];
    }
}

export async function GET(req: NextRequest) {
  try {
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const tokens = JSON.parse(tokensCookie.value);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    const { role } = await getUserRole(oauth2Client, req);

    let allJobs: any[] = [];
    const isStore = role === "ST_Recruiter";
    const isManager = role === "Manager"; // Manager sees all
    const isHO = role === "HO_Recruiter";

    // HO or Manager -> Fetch HO Jobs
    if (isHO || isManager || (!isStore && !isHO)) { // Default to HO if unknown
         const hoJobs = await fetchJobsFromSheet(oauth2Client, SPREADSHEET_ID_HO, SHEET_NAME_HO, "HO");
         allJobs = [...allJobs, ...hoJobs];
    }

    // Store or Manager -> Fetch Store Jobs
    if (isStore || isManager) {
        if (SPREADSHEET_ID_ST) {
            const stJobs = await fetchJobsFromSheet(oauth2Client, SPREADSHEET_ID_ST, SHEET_NAME_ST, "Store");
            allJobs = [...allJobs, ...stJobs];
        } else {
            console.warn("ST_Recruiter or Manager detected but SPREADSHEET_ID_ST not set");
        }
    }

    return NextResponse.json({ jobs: allJobs });

  } catch (error: any) {
    console.error("Fetch Jobs Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { jobCode, title, group, status, stopDate, reason } = await req.json();

    if (!jobCode) {
      return NextResponse.json({ error: "Missing jobCode" }, { status: 400 });
    }

    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const tokens = JSON.parse(tokensCookie.value);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    const { role } = await getUserRole(oauth2Client, req);

    let targetSpreadsheetId = SPREADSHEET_ID_HO;
    let targetSheetName = SHEET_NAME_HO;

    // Routing Logic
    if (role === "ST_Recruiter") {
        targetSpreadsheetId = SPREADSHEET_ID_ST;
        targetSheetName = SHEET_NAME_ST;
    } else if (role === "Manager") {
        // Check group to decide destination
        if (group === "Store" || jobCode.startsWith("ST")) {
             targetSpreadsheetId = SPREADSHEET_ID_ST;
             targetSheetName = SHEET_NAME_ST;
        }
    }

    if (!targetSpreadsheetId) {
        return NextResponse.json({ error: "Target Sheet ID not configured" }, { status: 500 });
    }

    // 1. Read existing to find index
    let rows: any[] = [];
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: targetSpreadsheetId,
            range: `${targetSheetName}!A2:G`,
        });
        rows = response.data.values || [];
    } catch (e) {
        // Assume empty if fail
    }

    const rowIndex = rows.findIndex((r) => r[1] === jobCode); // Check Column B (Index 1) for JobCode
    
    const existingPositionId = rowIndex >= 0 ? rows[rowIndex][0] : "";
    const displayPositionId = existingPositionId || ""; 

    const newRow = [
        displayPositionId, // A: Position ID
        jobCode,           // B: JobCode
        title || (rowIndex >= 0 ? rows[rowIndex][2] : ""), // C: Title
        group || (rowIndex >= 0 ? rows[rowIndex][3] : (role === "ST_Recruiter" ? "Store" : "HO")), // D: Group (Default based on role if missing)
        status !== undefined ? status : (rowIndex >= 0 ? rows[rowIndex][4] : "Hiring"), // E: Status
        stopDate !== undefined ? stopDate : (rowIndex >= 0 ? rows[rowIndex][5] : ""), // F: StopDate
        reason !== undefined ? reason : (rowIndex >= 0 ? rows[rowIndex][6] : "") // G: Reason
    ];

    if (rowIndex >= 0) {
        // Update
        // Row in sheet = rowIndex + 2 (Header = 1, index 0 = row 2)
        await sheets.spreadsheets.values.update({
            spreadsheetId: targetSpreadsheetId,
            range: `${targetSheetName}!A${rowIndex + 2}:G${rowIndex + 2}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });
    } else {
        // Append
        await sheets.spreadsheets.values.append({
            spreadsheetId: targetSpreadsheetId,
            range: `${targetSheetName}!A:G`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });
    }

    return NextResponse.json({ success: true, job: { jobCode, status, stopDate }, target: targetSheetName });

  } catch (error: any) {
    console.error("Update Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
