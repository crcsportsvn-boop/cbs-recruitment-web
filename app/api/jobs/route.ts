
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
        jobCode: row[0] || "",
        title: row[1] || "",
        group: row[2] || "HO", // Default to HO
        status: row[3] || "Hiring",
        stopDate: row[4] || "",
        reason: row[5] || "",
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
            range: `${SHEET_NAME}!A2:F`,
        });
        rows = response.data.values || [];
    } catch (e) {
        // Assume empty if fail
    }

    const rowIndex = rows.findIndex((r) => r[0] === jobCode);
    const newRow = [
        jobCode,
        title || (rowIndex >= 0 ? rows[rowIndex][1] : ""),
        group || (rowIndex >= 0 ? rows[rowIndex][2] : "HO"),
        status !== undefined ? status : (rowIndex >= 0 ? rows[rowIndex][3] : "Hiring"),
        stopDate !== undefined ? stopDate : (rowIndex >= 0 ? rows[rowIndex][4] : ""),
        reason !== undefined ? reason : (rowIndex >= 0 ? rows[rowIndex][5] : "")
    ];

    if (rowIndex >= 0) {
        // Update
        // Row in sheet = rowIndex + 2 (Header = 1, index 0 = row 2)
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A${rowIndex + 2}:F${rowIndex + 2}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });
    } else {
        // Append
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
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
