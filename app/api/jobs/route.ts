
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME = "Jobs";

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
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Try to read Jobs sheet
    // If it doesn't exist, this might throw
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:F`,
      });

      const rows = response.data.values || [];
      const jobs = rows.map((row) => ({
        positionId: row[0] || "",
        jobCode: row[1] || "",
        title: row[2] || "",
        group: row[3] || "HO", // Default to HO
        status: row[4] || "Hiring",
        stopDate: row[5] || "",
        reason: row[6] || "",
      }));

      return NextResponse.json({ jobs });
    } catch (readError: any) {
      if (readError.message.includes("Unable to parse range")) {
         // Sheet might not exist
         return NextResponse.json({ jobs: [], warning: "Jobs sheet not found. Please create 'Jobs' tab." });
      }
      throw readError;
    }

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

    // 1. Read existing to find index
    let rows: any[] = [];
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:G`,
        });
        rows = response.data.values || [];
    } catch (e) {
        // Assume empty if fail
    }

    const rowIndex = rows.findIndex((r) => r[1] === jobCode); // Check Column B (Index 1) for JobCode
    
    // We don't have positionId in the POST body? Currently creating new jobs via API might not support it yet unless we add it. 
    // Assuming we want to preserve existing positionId if updating, or empty if new.
    // If updating, get existing row[0].
    
    const existingPositionId = rowIndex >= 0 ? rows[rowIndex][0] : "";
    const displayPositionId = existingPositionId || ""; // Or generate one? For now leave blank or preserve.

    const newRow = [
        displayPositionId, // A: Position ID
        jobCode,           // B: JobCode
        title || (rowIndex >= 0 ? rows[rowIndex][2] : ""), // C: Title
        group || (rowIndex >= 0 ? rows[rowIndex][3] : "HO"), // D: Group
        status !== undefined ? status : (rowIndex >= 0 ? rows[rowIndex][4] : "Hiring"), // E: Status
        stopDate !== undefined ? stopDate : (rowIndex >= 0 ? rows[rowIndex][5] : ""), // F: StopDate
        reason !== undefined ? reason : (rowIndex >= 0 ? rows[rowIndex][6] : "") // G: Reason
    ];

    if (rowIndex >= 0) {
        // Update
        // Row in sheet = rowIndex + 2 (Header = 1, index 0 = row 2)
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A${rowIndex + 2}:G${rowIndex + 2}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });
    } else {
        // Append
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:G`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });
    }

    return NextResponse.json({ success: true, job: { jobCode, status, stopDate } });

  } catch (error: any) {
    console.error("Update Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
