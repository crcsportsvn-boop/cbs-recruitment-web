
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME = "Jobs"; // Using Jobs Sheet

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

    // 1. Read Jobs Sheet to find row
    let rows: any[] = [];
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:G`,
        });
        rows = response.data.values || [];
    } catch (e) {
        // assume empty if fail
    }

    const rowIndex = rows.findIndex((r) => r[1] === jobCode); // Check Col B
    const stopDate = new Date().toISOString(); 
    
    // Preserve Position ID if exists
    const existingPositionId = rowIndex >= 0 ? rows[rowIndex][0] : "";

    const newRow = [
        existingPositionId, // A: Position ID
        jobCode,            // B: JobCode
        title || (rowIndex >= 0 ? rows[rowIndex][2] : ""), // C: Title
        group || (rowIndex >= 0 ? rows[rowIndex][3] : "HO"), // D: Group
        "Stopped",          // E: Status
        stopDate,           // F: StopDate
        reason              // G: Reason
    ];

    if (rowIndex >= 0) {
        // Update
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

    return NextResponse.json({ success: true, message: `Job ${jobCode} stopped.` });

  } catch (error: any) {
    console.error("Stop Job Error:", error);
    return NextResponse.json(
      { error: "Failed to stop job", details: error.message },
      { status: 500 }
    );
  }
}
