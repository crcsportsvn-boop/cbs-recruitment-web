
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID_HO = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME_HO = "Jobs";

// Store Sheet ID from walkthrough - hardcoded fallback
const SPREADSHEET_ID_ST = process.env.GOOGLE_SHEET_ID_ST || "1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs";
const SHEET_NAME_ST = "Job";

// Helper to determine user role
async function getUserRole(oauth2Client: any): Promise<string> {
    try {
        // Get user email
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email || "";

        // Use Service Account to read User_view sheet
        let serviceAuth;
        const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (saJson) {
            const creds = JSON.parse(saJson);
            serviceAuth = new google.auth.GoogleAuth({
                credentials: creds,
                scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
            });
        } else {
            serviceAuth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                },
                scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
            });
        }

        const sheets = google.sheets({ version: "v4", auth: serviceAuth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: "User_view!A:B",
        });
        const rows = response.data.values || [];
        const userRow = rows.find((r: any) => r[0]?.toLowerCase() === email.toLowerCase());
        return userRow?.[1] || "Unknown";
    } catch (e) {
        console.error("Failed to get user role:", e);
        return "Unknown";
    }
}

export async function POST(req: NextRequest) {
  try {
    const { jobCode, reason, title, group } = await req.json();

    if (!jobCode || !reason) {
      return NextResponse.json({ error: "Missing jobCode or reason" }, { status: 400 });
    }

    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json(
        { error: "Not authenticated", redirect: "/api/auth/login" },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(tokensCookie.value);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Get user role for routing decision
    const userRole = await getUserRole(oauth2Client);
    console.log("User role:", userRole);

    // Check BOTH sheets to find where the job exists
    let foundInHO = false;
    let foundInST = false;
    let hoRows: any[] = [];
    let stRows: any[] = [];
    let hoRowIndex = -1;
    let stRowIndex = -1;

    // Check HO Sheet
    try {
        console.log("=== STOP JOB DEBUG ===");
        console.log("Looking for jobCode:", jobCode);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID_HO,
            range: `${SHEET_NAME_HO}!A2:G`,
        });
        hoRows = response.data.values || [];
        console.log("HO rows found:", hoRows.length);
        hoRowIndex = hoRows.findIndex((r: any) => r[1] === jobCode);
        foundInHO = hoRowIndex >= 0;
        console.log("Found in HO:", foundInHO);
    } catch (e: any) {
        console.error("Failed to read HO Jobs sheet:", e.message);
    }

    // Check Store Sheet
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID_ST,
            range: `${SHEET_NAME_ST}!A2:G`,
        });
        stRows = response.data.values || [];
        console.log("Store rows found:", stRows.length);
        stRowIndex = stRows.findIndex((r: any) => r[1] === jobCode);
        foundInST = stRowIndex >= 0;
        console.log("Found in Store:", foundInST);
    } catch (e: any) {
        console.error("Failed to read Store Job sheet:", e.message);
    }

    // Determine target based on where job exists
    let targetSpreadsheetId: string;
    let targetSheetName: string;
    let rows: any[];
    let rowIndex: number;
    let existingGroup: string = "";

    if (foundInST) {
        // Job exists in Store sheet -> update Store
        console.log("Decision: Update Store (job found in Store)");
        targetSpreadsheetId = SPREADSHEET_ID_ST;
        targetSheetName = SHEET_NAME_ST;
        rows = stRows;
        rowIndex = stRowIndex;
        existingGroup = stRows[stRowIndex]?.[3] || "Store";
    } else if (foundInHO) {
        // Job exists in HO sheet -> update HO
        console.log("Decision: Update HO (job found in HO)");
        targetSpreadsheetId = SPREADSHEET_ID_HO;
        targetSheetName = SHEET_NAME_HO;
        rows = hoRows;
        rowIndex = hoRowIndex;
        existingGroup = hoRows[hoRowIndex]?.[3] || "HO";
    } else {
        // Job doesn't exist anywhere - use role or group to decide
        console.log("Job not found in any sheet. Checking role/group for new entry...");
        if (userRole === "ST_Recruiter" || group === "Store") {
            console.log("Decision: Create NEW in Store (role:", userRole, "group:", group, ")");
            targetSpreadsheetId = SPREADSHEET_ID_ST;
            targetSheetName = SHEET_NAME_ST;
            rows = stRows;
            existingGroup = "Store";
        } else {
            console.log("Decision: Create NEW in HO (role:", userRole, "group:", group, ")");
            targetSpreadsheetId = SPREADSHEET_ID_HO;
            targetSheetName = SHEET_NAME_HO;
            rows = hoRows;
            existingGroup = "HO";
        }
        rowIndex = -1;
    }

    const stopDate = new Date().toISOString(); 
    const existingPositionId = rowIndex >= 0 ? rows[rowIndex][0] : "";

    const newRow = [
        existingPositionId,
        jobCode,
        title || (rowIndex >= 0 ? rows[rowIndex][2] : ""),
        group || existingGroup,
        "Stopped",
        stopDate,
        reason
    ];

    console.log("Writing to:", targetSheetName, "in", targetSpreadsheetId);

    if (rowIndex >= 0) {
        // Update existing row
        await sheets.spreadsheets.values.update({
            spreadsheetId: targetSpreadsheetId,
            range: `${targetSheetName}!A${rowIndex + 2}:G${rowIndex + 2}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });
    } else {
        // Append new row
        await sheets.spreadsheets.values.append({
            spreadsheetId: targetSpreadsheetId,
            range: `${targetSheetName}!A:G`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });
    }

    return NextResponse.json({ success: true, message: `Job ${jobCode} stopped.` });

  } catch (error: any) {
    console.error("Stop Job Error:", error);
    return NextResponse.json(
      { error: "Failed to stop job", details: error.message },
      { status: 500 }
    );
  }
}
