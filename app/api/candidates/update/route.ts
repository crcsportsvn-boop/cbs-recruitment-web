import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';

// Sheet Configuration - Support both HO and Store
const SPREADSHEET_ID_HO = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SPREADSHEET_ID_ST = process.env.GOOGLE_SHEET_ID_ST || "";
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
    const { id, updates, dataSource, sheetId } = await req.json();
    
    // Determine which sheet to update
    // Priority: sheetId (exact) > dataSource (lookup) > default HO
    let targetSheetId = SPREADSHEET_ID_HO;
    
    if (sheetId) {
      // Frontend sent exact sheet ID
      targetSheetId = sheetId;
    } else if (dataSource === "ST" && SPREADSHEET_ID_ST) {
      // Use Store sheet
      targetSheetId = SPREADSHEET_ID_ST;
    } else if (dataSource === "HO") {
      targetSheetId = SPREADSHEET_ID_HO;
    }
    
    // DEBUG: Log what we're updating
    console.log(`🔍 Update Request - Sheet: ${dataSource || 'HO'}, Row: ${id}, Updates:`, JSON.stringify(updates));

    // 2. Setup OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // 3. Define Column Mapping (Letter to Field)
    const COLUMN_MAP: Record<string, string> = {
      jobCode: "E",
      additionalDetails: "Z",  // Column Z — Additional Details for rejection
      notes: "AK",
      isPotential: "AA",
      status: "AB",
      failureReason: "AC",
      testResult: "AD",
      hrInterviewDate: "AE",
      interviewDate1: "AF",
      interviewDate2: "AG",
      offerDate: "AH",
      startDate: "AI",
      officialDate: "AJ",
      rejectedRound: "AL",
      applyDate: "AM",
    };

    // 4. Prepare Batch Update
    const dataToUpdate = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const colLetter = COLUMN_MAP[key];
      if (colLetter) {
        const cellValue = value === null ? "" : value;
        dataToUpdate.push({
          range: `${SHEET_NAME}!${colLetter}${id}`,
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

    // 5. Execute Batch Update on the correct sheet
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: targetSheetId,
      requestBody: {
        data: dataToUpdate,
        valueInputOption: "USER_ENTERED", 
      },
    });

    console.log(`✅ Updated ${dataToUpdate.length} fields on ${dataSource || 'HO'} sheet`);
    return NextResponse.json({ success: true, dataSource: dataSource || 'HO' });

  } catch (error: any) {
    console.error("Update Candidate Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update candidate", details: error },
      { status: 500 }
    );
  }
}
