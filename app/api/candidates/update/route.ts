import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { id, updates } = await req.json();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // Explicitly check Environment Variable for Sheet ID
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
    const SHEET_NAME = "Datapool";

    // Column Mapping per User Request
    // Status: AB
    // Failure Reason: AC
    // Potential: AA
    // Rejected Round: AK (Included as per previous logic, ensuring it maps if sent)
    // Dates/Other fields preserved
    const COLUMN_MAP: Record<string, string> = {
      isPotential: "AA",   // Column 26
      status: "AB",        // Column 27
      failureReason: "AC", // Column 28
      testResult: "AD",    // Column 29
      interviewDate1: "AE",
      interviewDate2: "AF",
      offerDate: "AG",
      interviewer: "AI",
      rejectedRound: "AK", // Restored to enable persistence of rejection round
      log: "AJ"
    };

    const data = [];

    // ID is expected to be the Row Number directly (e.g. "2", "3")
    for (const [key, value] of Object.entries(updates)) {
      if (COLUMN_MAP[key]) {
        data.push({
          range: `${SHEET_NAME}!${COLUMN_MAP[key]}${id}`,
          values: [[value]],
        });
      }
    }

    if (data.length === 0) {
      return NextResponse.json({ message: "No mappable columns found to update" });
    }

    // Use batchUpdate with USER_ENTERED to handle types (booleans, numbers, strings) correctly
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: data,
      },
    });

    return NextResponse.json({ success: true, updatedCells: data.length });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
}
