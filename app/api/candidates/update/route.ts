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
    
    // DEBUG: Log what we're updating
    console.log("🔍 Update Request - Row:", id, "Updates:", JSON.stringify(updates));

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
      jobCode: "E",       // Column 5 (Job Code)
      notes: "AK",         // Column 37 (Moved from Z)
      isPotential: "AA", // Column 27
      status: "AB",      // Column 28
      failureReason: "AC", // Column 29
      testResult: "AD",  // Column 30
      hrInterviewDate: "AE", // Column 31
      interviewDate1: "AF", // Column 32
      interviewDate2: "AG", // Column 33
      offerDate: "AH",    // Column 34
      startDate: "AI",    // Column 35
      officialDate: "AJ", // Column 36
      rejectedRound: "AL", // Column 38 (Moved from AK)
      applyDate: "AM",     // Column 39 (New)
    };

    // 4. Prepare Batch Update
    const dataToUpdate = [];
    
    // We iterate over the 'updates' object keys
    for (const [key, value] of Object.entries(updates)) {
      const colLetter = COLUMN_MAP[key];
      if (colLetter) {
        const cellValue = value === null ? "" : value;
        dataToUpdate.push({
          range: `${SHEET_NAME}!${colLetter}${id}`,
          // Use empty string to clear cell (Google Sheets will treat "" as blank)
          values: [[cellValue]], 
        });
        console.log(`  ✏️  ${key} -> ${colLetter}${id} = "${cellValue}"`);
      } else {
        console.log(`  ⚠️  Skipped unmapped field: ${key}`);
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
