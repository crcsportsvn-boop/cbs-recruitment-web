import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

// Configuration
const FOLDER_ID_INPUT = process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID || "1P60dhESnbsmEOEqBP_hl6f_xWn1cgl_8";
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
    const source = formData.get("source") as string;

    if (!file || !filename) {
      return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
    }

    // 1. Authenticate with Google (Drive + Sheets)
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}"),
      scopes: SCOPES,
    });

    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

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
    const currentDate = new Date().toLocaleDateString('en-GB');
    const sheetRow = [
      currentDate,
      jobTitle || "N/A",
      source || "Web App"
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
