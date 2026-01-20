import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

// Configuration (Should be in env vars, but using defaults as requested)
const FOLDER_ID_INPUT = process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID || "1P60dhESnbsmEOEqBP_hl6f_xWn1cgl_8";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string;

    if (!file || !filename) {
      return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
    }

    // 1. Authenticate with Google Drive
    // Note: In production, store credentials in process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    // For this scaffold, we expect the user to provide the JSON string in env
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}"),
      scopes: SCOPES,
    });

    const drive = google.drive({ version: "v3", auth });

    // 2. Prepare File Stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 3. Upload to Drive
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [FOLDER_ID_INPUT],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, name, webViewLink",
    });

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      link: response.data.webViewLink,
    });

  } catch (error: any) {
    console.error("Upload Error Details:", {
      message: error.message,
      stack: error.stack,
      credentials_exist: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      folder_id: process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID
    });
    
    return NextResponse.json(
      { 
        error: "Upload failed", 
        details: error.message,
        hint: "Check server logs for credential issues." 
      },
      { status: 500 }
    );
  }
}
