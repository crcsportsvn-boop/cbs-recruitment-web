import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME = "Datapool";

export async function POST(req: NextRequest) {
  try {
    const { id, status, interviewDate, interviewer } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Auth (Same as other routes)
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

    // 2. Update Status (Column AC - Index 28)
    // Range: Sheet1!AC{id}
    const updates = [];
    
    // Status (AC)
    updates.push({
      range: `${SHEET_NAME}!AC${id}`,
      values: [[status]]
    });

    // Interview Date (AD) - Optional
    if (interviewDate !== undefined) {
      updates.push({
        range: `${SHEET_NAME}!AD${id}`,
        values: [[interviewDate]]
      });
    }

    // Interviewer (AE) - Optional
    if (interviewer !== undefined) {
      updates.push({
        range: `${SHEET_NAME}!AE${id}`,
        values: [[interviewer]]
      });
    }
    
    // TA Duyệt Content? User mentioned "TA Screening (User click tick chọn, update cột TA duyệt nội dung = TRUE)"
    // Looking at GET route: "TA duyệt nội dung" is a column.
    // In Datapool example: "TA duyệt nội dung" is column Y (Index 24)?
    // Let's check GET route again: row[24] is undefined in my map, but row[23] is Link Ho So.
    // Based on User provided list: ... Link Hồ sơ | TA duyệt nội dung | Ghi chú | CV Tiềm năng
    // Link = 23 (X) -> TA Duyệt = 24 (Y) -> Note = 25 (Z) -> Potential = 26 (AA).
    // So if Status is 'Screening', I should also set 'TA duyệt nội dung' (Col Y / 24) to TRUE.
    
    if (status === "Screening") {
       updates.push({
        range: `${SHEET_NAME}!Y${id}`,
        values: [["TRUE"]]
      });
    }

    // Execute Batch Update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updates
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
