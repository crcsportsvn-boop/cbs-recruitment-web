import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w"; // Cùng spreadsheet với upload
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
    // Giả định đọc từ A2:AD (A1 là header)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:AD`, // Đọc rộng ra để lấy hết các cột
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
       return NextResponse.json({ candidates: [] });
    }

    // 4. Map Data to Object
    const candidates = rows.map((row) => ({
      matchScore: row[0],
      timestamp: row[1],
      positionRaw: row[2], // Vị trí ứng tuyển (có thể cần clean)
      source: row[3],
      fullName: row[6],
      yob: row[7],
      gender: row[8],
      phone: row[9],
      email: row[10],
      location: row[11],
      summary: row[21], // Tóm tắt
      matchReason: row[22], // Sự phù hợp
      cvLink: row[23],
      isPotential: row[26] === "TRUE" // CV Tiềm năng
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
