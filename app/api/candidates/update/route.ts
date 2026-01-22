import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w"; 
const SHEET_NAME = "Datapool";

export async function POST(req: NextRequest) {
  try {
    // 1. Get OAuth tokens from cookie (User Context)
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json(
        { error: "Not authenticated", redirect: "/api/auth/login" },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(tokensCookie.value);
    const { id, updates } = await req.json(); // id is the Row Index (e.g. 2, 3...)

    // 2. Setup OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // 3. Define Column Mapping (Letter to Field)
    // ONLY fields that need to be updated during Process/Reject
    const COLUMN_MAP: Record<string, string> = {
      notes: "AK",         // Column 36 (Moved from Z)
      isPotential: "AA", // Column 26
      status: "AB",      // Column 27
      failureReason: "AC", // Column 28
      testResult: "AD",  // Column 29
      hrInterviewDate: "AE", // New
      interviewDate1: "AF",
      interviewDate2: "AG",
      offerDate: "AH",
      startDate: "AI",
      officialDate: "AJ",
      rejectedRound: "AL", // Column 37 (Moved from AK)
      applyDate: "AM",     // Column 38 (New)
    };

    // 4. Prepare Batch Update
    const dataToUpdate = [];
    
    // We iterate over the 'updates' object keys
    for (const [key, value] of Object.entries(updates)) {
      const colLetter = COLUMN_MAP[key];
      if (colLetter) {
        dataToUpdate.push({
          range: `${SHEET_NAME}!${colLetter}${id}`,
          values: [[value]], 
        });
      }
    }

    if (dataToUpdate.length === 0) {
       return NextResponse.json({ message: "No mappable fields to update" });
    }

    // 5. Execute Batch Update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        data: dataToUpdate,
        valueInputOption: "USER_ENTERED", 
      },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Update Candidate Error:", error);
    // Return detailed error for frontend debugging
    return NextResponse.json(
      { error: error.message || "Failed to update candidate", details: error },
      { status: 500 }
    );
  }
}
