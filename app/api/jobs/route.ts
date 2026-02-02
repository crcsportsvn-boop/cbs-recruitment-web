
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID_HO = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME_HO = "Jobs";

// Store Sheet ID from walkthrough - hardcoded fallback
const SPREADSHEET_ID_ST = process.env.GOOGLE_SHEET_ID_ST || "1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs";
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

    // First, check BOTH sheets to find where the job already exists
    let foundInHO = false;
    let foundInST = false;
    let hoRows: any[] = [];
    let stRows: any[] = [];
    let hoRowIndex = -1;
    let stRowIndex = -1;

    // Check HO Sheet
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: `${SHEET_NAME_HO}!A2:G`,
        });
        hoRows = response.data.values || [];
        hoRowIndex = hoRows.findIndex((r) => r[1] === jobCode);
        foundInHO = hoRowIndex >= 0;
    } catch (e) {
        console.warn("Failed to read HO Jobs sheet", e);
    }

    // Check Store Sheet
    if (SPREADSHEET_ID_ST) {
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID_ST,
                range: `${SHEET_NAME_ST}!A2:G`,
            });
            stRows = response.data.values || [];
            stRowIndex = stRows.findIndex((r) => r[1] === jobCode);
            foundInST = stRowIndex >= 0;
        } catch (e) {
            console.warn("Failed to read Store Job sheet", e);
        }
    }

    // Determine target based on where job exists
    let targetSpreadsheetId: string;
    let targetSheetName: string;
    let rows: any[];
    let rowIndex: number;
    let existingGroup: string = "";

    // Debug logging
    console.log("=== Job Update Debug ===");
    console.log("JobCode:", jobCode);
    console.log("Role:", role);
    console.log("Group from request:", group);
    console.log("SPREADSHEET_ID_ST:", SPREADSHEET_ID_ST);
    console.log("Found in HO:", foundInHO, "index:", hoRowIndex);
    console.log("Found in ST:", foundInST, "index:", stRowIndex);
    console.log("ST Rows count:", stRows.length);

    if (foundInST) {
        // Job exists in Store sheet -> update Store
        console.log("Decision: UPDATE STORE (job found in Store sheet)");
        targetSpreadsheetId = SPREADSHEET_ID_ST;
        targetSheetName = SHEET_NAME_ST;
        rows = stRows;
        rowIndex = stRowIndex;
        existingGroup = stRows[stRowIndex]?.[3] || "Store";
    } else if (foundInHO) {
        // Job exists in HO sheet -> update HO
        console.log("Decision: UPDATE HO (job found in HO sheet)");
        targetSpreadsheetId = SPREADSHEET_ID_HO;
        targetSheetName = SHEET_NAME_HO;
        rows = hoRows;
        rowIndex = hoRowIndex;
        existingGroup = hoRows[hoRowIndex]?.[3] || "HO";
    } else {
        // Job doesn't exist anywhere - create new based on role or group
        console.log("Decision: CREATE NEW (job not found anywhere)");
        if (role === "ST_Recruiter" || group === "Store") {
            console.log("Target: STORE (based on role/group)");
            targetSpreadsheetId = SPREADSHEET_ID_ST;
            targetSheetName = SHEET_NAME_ST;
            rows = stRows;
            existingGroup = "Store";
        } else {
            console.log("Target: HO (default)");
            targetSpreadsheetId = SPREADSHEET_ID_HO;
            targetSheetName = SHEET_NAME_HO;
            rows = hoRows;
            existingGroup = "HO";
        }
        rowIndex = -1; // Will append
    }

    console.log("Final target sheet:", targetSheetName, "in", targetSpreadsheetId);
    console.log("=== End Debug ===");

    if (!targetSpreadsheetId) {
        return NextResponse.json({ error: "Target Sheet ID not configured" }, { status: 500 });
    }
    
    const existingPositionId = rowIndex >= 0 ? rows[rowIndex][0] : "";
    const displayPositionId = existingPositionId || ""; 

    const newRow = [
        displayPositionId, // A: Position ID
        jobCode,           // B: JobCode
        title || (rowIndex >= 0 ? rows[rowIndex][2] : ""), // C: Title
        group || existingGroup, // D: Group (Preserve existing or use provided)
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
