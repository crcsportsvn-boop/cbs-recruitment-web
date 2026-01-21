import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID_HO || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w"; // Datapool ID
const SHEET_NAME = "Datapool"; // Sheet chứa kết quả N8N

export async function GET(req: NextRequest) {
  try {
    // 1. Get OAuth tokens from cookie
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json(
        { error: "Not authenticated", redirect: "/api/auth/login" },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(tokensCookie.value);

    // 2. Auth with Google
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // 3. Read Data from Datapool Sheet
    // Read from A2 to AI (Column 34)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:AK`, 
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
       return NextResponse.json({ candidates: [] });
    }

    // 4. Map Data to Object
    const candidates = rows.map((row, index) => ({
      id: index + 2, // Row Index
      matchScore: row[0],
      timestamp: row[1],
      positionRaw: row[2],
      source: row[3],
      jobCode: row[4],
      positionId: row[5],
      fullName: row[6],
      yob: row[7],
      gender: row[8],
      phone: row[9],
      email: row[10],
      location: row[11],
      degree: row[12], // Col M
      education: row[13], // Col N - School
      jobFunction: row[14], // Col O
      skills: row[19], // Col T
      workHistory: row[20], // Col U
      summary: row[21],
      matchReason: row[22],
      cvLink: row[23],
      notes: row[25], // Z
      isPotential: row[26] === "TRUE", // AA
      status: row[27] || "New", // AB: Kết quả (Status)
      failureReason: row[28], // AC
      testResult: row[29], // AD
      interviewDate1: row[30], // AE
      interviewDate2: row[31], // AF
      offerDate: row[32], // AG
      startDate: row[33], // AH
      officialDate: row[34], // AI
      log: row[35], // AJ
      rejectedRound: row[36] // AK
    }));

    // Reverse to show latest first
    return NextResponse.json({ candidates: candidates.reverse() });

  } catch (error: any) {
    console.error("Fetch Candidates Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates", details: error.message },
      { status: 500 }
    );
  }
}
