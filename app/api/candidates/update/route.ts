import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME = "Datapool";

// Column Mapping (0-indexed based on A=0, but API uses A1 notation)
// A=0, Z=25, AA=26, AB=27...
const COLUMN_MAP: Record<string, string> = {
  status: "AB",
  failureReason: "AC",
  testResult: "AD",
  interviewDate1: "AE",
  interviewDate2: "AF",
  offerDate: "AG",
  startDate: "AH",
  officialDate: "AI"
};

export async function POST(req: NextRequest) {
  try {
    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Auth 
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

    // 2. Prepare Updates
    const data = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (COLUMN_MAP[key]) {
        data.push({
          range: `${SHEET_NAME}!${COLUMN_MAP[key]}${id}`,
          values: [[value]]
        });
      }
    }

    // Special Logic: If Status is "Screening", update TA Duyệt (Y - 24)
    if (updates.status === "Screening") {
       data.push({
        range: `${SHEET_NAME}!Y${id}`,
        values: [["TRUE"]]
      });
    }

    if (data.length === 0) {
        return NextResponse.json({ success: true, message: "No mappable updates found" });
    }

    // 3. Execute Batch Update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: data
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Update Candidate Error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate", details: error.message },
      { status: 500 }
    );
  }
}
