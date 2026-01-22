import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w"; 
const SHEET_NAME = "Datapool";

export async function POST(req: NextRequest) {
  try {
    // 1. Get OAuth tokens (User Context)
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokens = JSON.parse(tokensCookie.value);
    const { jobCode, reason } = await req.json();

    if (!jobCode || !reason) {
        return NextResponse.json({ error: "Missing jobCode or reason" }, { status: 400 });
    }

    // 2. Setup OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // 3. Read Job Codes (Column E)
    // Range E2:E to skip header
    const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!E2:E`,
    });

    const rows = readRes.data.values || [];
    
    // 4. Find matching rows
    // 4. Find matching rows
    const dataToUpdate: { range: string; values: string[][] }[] = [];
    const updateValue = `Stock - ${reason}`;

    rows.forEach((row, index) => {
        // row[0] is the value of Column E
        if (row[0] && row[0].toString().trim() === jobCode.toString().trim()) {
            // Row Index calculation:
            // Valid data starts at Row 2.
            // Array index 0 -> Row 2
            // Array index N -> Row N+2
            const rowIndex = index + 2; 
            
            // Column Z (Notes) is 25th letter (A=0 ... Z=25) ?? 
            // Wait, Z is the 26th letter.
            // A=1, Z=26.
            // Wait, in A1 notation, Z is just 'Z'.
            
            dataToUpdate.push({
                range: `${SHEET_NAME}!Z${rowIndex}`,
                values: [[updateValue]]
            });
        }
    });

    if (dataToUpdate.length === 0) {
        return NextResponse.json({ message: "No candidates found for this Job Code" });
    }

    // 5. Execute Batch Update
    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            data: dataToUpdate,
            valueInputOption: "USER_ENTERED"
        }
    });

    return NextResponse.json({ success: true, count: dataToUpdate.length });

  } catch (error: any) {
    console.error("Stop Job Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to stop job" },
      { status: 500 }
    );
  }
}
