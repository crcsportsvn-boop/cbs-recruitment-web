
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

// Configuration
const FOLDER_ID_INPUT = process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID || "1L23vAO-hvrXPxE-VFTAzGzA0_kyb_wGN";
const SPREADSHEET_ID = "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
const SHEET_NAME = "Vị trí tuyển dụng";
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string;
    const jobTitle = formData.get("jobTitle") as string;
    let source = formData.get("source") as string;
    const requirements = formData.get("requirements") as string;

    // Fix "undefined" string issue from frontend
    if (source === "undefined" || !source) source = "Web App";

    if (!file || !filename) {
      return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
    }

    // 1. Get OAuth tokens from cookie
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json(
        { error: "Not authenticated", redirect: "/api/auth/login" },
        { status: 401 }
      );
    }

    const tokens = JSON.parse(tokensCookie.value);

    // 2. Authenticate with Google using OAuth tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NODE_ENV === "production"
        ? "https://cbs-recruitment-web.vercel.app/api/auth/callback"
        : "http://localhost:3000/api/auth/callback"
    );
    
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // 2. Prepare File Stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 3. Upload to N8N monitored folder
    const driveResponse = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [FOLDER_ID_INPUT],  // Upload directly to N8N folder
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, name, webViewLink",
    });

    // 4. Write to Google Sheets (Vị trí tuyển dụng)
    const currentDate = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    
    // Combine Job Title and Requirements for Column B
    const jobInfo = requirements ? `${jobTitle}\n\n${requirements}` : jobTitle;

    const sheetRow = [
      currentDate,      // Column A: Date
      jobInfo || "N/A", // Column B: Job Title + Requirements
      source            // Column C: Source
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [sheetRow],
      },
    });

    return NextResponse.json({
      success: true,
      fileId: driveResponse.data.id,
      link: driveResponse.data.webViewLink,
      sheetUpdated: true,
    });

  } catch (error: any) {
    console.error("Upload Error Details:", {
      message: error.message,
      stack: error.stack,
      credentials_exist: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      folder_id: FOLDER_ID_INPUT,
      spreadsheet_id: SPREADSHEET_ID
    });
    
    return NextResponse.json(
      { 
        error: "Upload failed", 
        details: error.message,
        hint: "Check: 1) Service Account has Editor access to Drive folder, 2) Service Account has Editor access to Sheet" 
      },
      { status: 500 }
    );
  }
}
