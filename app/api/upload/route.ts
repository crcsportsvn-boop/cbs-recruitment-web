import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

// Configuration
const FOLDER_ID_INPUT_HO =
  process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID_HO ||
  "1L23vAO-hvrXPxE-VFTAzGzA0_kyb_wGN";
const SPREADSHEET_ID_HO =
  process.env.GOOGLE_SHEET_ID_HO ||
  "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
  
const FOLDER_ID_INPUT_ST = process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID_ST || "1SDb4cW8taRLfJ2uxClijyYysJI6l3SSk";
const SPREADSHEET_ID_ST = process.env.GOOGLE_SHEET_ID_ST || "1GvIdlI4VTa0h4UeRjh6YjKV_SmhOU8OSbwSGGlvGTRs";

const SHEET_NAME = "Vị trí tuyển dụng";
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/userinfo.email", 
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
      return NextResponse.json(
        { error: "Missing file or filename" },
        { status: 400 },
      );
    }

    // 1. Get OAuth tokens from cookie
    const tokensCookie = req.cookies.get("google_tokens");
    if (!tokensCookie) {
      return NextResponse.json(
        { error: "Not authenticated", redirect: "/api/auth/login" },
        { status: 401 },
      );
    }

    const tokens = JSON.parse(tokensCookie.value);

    // 2. Authenticate with Google using OAuth tokens (as User)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NODE_ENV === "production"
        ? "https://cbs-recruitment-web.vercel.app/api/auth/callback"
        : "http://localhost:3000/api/auth/callback",
    );

    oauth2Client.setCredentials(tokens);

    // 2.1 Get User Email
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email || "";

    // 2.2 Determine Role (using Service Account to read User_view)
    let role = "Guest";
    let targetFolderId = FOLDER_ID_INPUT_HO;
    let targetSpreadsheetId = SPREADSHEET_ID_HO;

    try {
        let credentials;
        if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        try {
            credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        } catch (e) {
            console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", e);
        }
        }

        if (!credentials) {
        credentials = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        };
        }

        const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheetsAdmin = google.sheets({ version: "v4", auth });
        const response = await sheetsAdmin.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID_HO,
        range: "User_view!A:B",
        });

        const rows = response.data.values || [];
        const userRow = rows.find((r) => r[0]?.toString().toLowerCase() === email.toLowerCase());
        
        if (userRow) {
            role = userRow[1] || "User";
        }
    } catch (roleError) {
        console.error("Failed to determine role from User_view, defaulting to HO", roleError);
    }

    // 2.3 Switch Destination based on Role
    if (role === "ST_Recruiter") {
        targetFolderId = FOLDER_ID_INPUT_ST;
        targetSpreadsheetId = SPREADSHEET_ID_ST;
        // Fallback for ST if IDs are missing (should not happen if config is correct)
        if (!targetFolderId || !targetSpreadsheetId) { 
            console.warn("ST_Recruiter detected but missing ST config, falling back to HO");
            targetFolderId = FOLDER_ID_INPUT_HO;
            targetSpreadsheetId = SPREADSHEET_ID_HO;
        }
    }

    console.log(`Uploading for ${email} (${role}) to Sheet: ${targetSpreadsheetId}, Folder: ${targetFolderId}`);

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // 2. Parse Job Code & Position ID from jobTitle
    // Format: "Position Name (JobCode_PositionID)"
    const jobCodeRegex = /\(([^_]+)_([^)]+)\)/;
    const match = jobTitle.match(jobCodeRegex);

    let jobCode = "";
    let positionId = "";
    let cleanPosition = jobTitle;

    if (match && match[1] && match[2]) {
      jobCode = match[1].trim();
      positionId = match[2].trim();
      // Remove (JobCode_PositionID) from position name
      cleanPosition = jobTitle.replace(/\s*\([^)]+\)\s*/, "").trim();
    }

    // 3. Clean and format Skills/Requirements for filename
    // Remove special characters that are invalid in filenames
    const cleanSkills = requirements 
      ? requirements
          .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename chars
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .trim()
          .substring(0, 100) // Limit length to 100 chars
      : "N/A";

    // 4. Generate new filename with format:
    // [Date] - [Position] (JobCode_PositionID) - [Source] - [Skills] - [OriginalFilename]
    const currentDate = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY
    const fileExtension = filename.substring(filename.lastIndexOf("."));
    const baseFilename = filename.substring(0, filename.lastIndexOf("."));

    let newFilename: string;
    if (jobCode && positionId) {
      // Full format with all metadata including Skills
      newFilename = `${currentDate} - ${cleanPosition} (${jobCode}_${positionId}) - ${source} - ${cleanSkills} - ${baseFilename}${fileExtension}`;
    } else {
      // Fallback if no job code found
      newFilename = `${currentDate} - ${cleanPosition} - ${source} - ${cleanSkills} - ${baseFilename}${fileExtension}`;
    }

    // 4. Prepare File Stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 5. Upload to N8N monitored folder with NEW filename
    const driveResponse = await drive.files.create({
      requestBody: {
        name: newFilename, // Use renamed file
        parents: [targetFolderId], // Use dynamic folder ID
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, name, webViewLink",
    });

    // 6. Write to Google Sheets (Vị trí tuyển dụng)
    // Combine Job Title and Requirements for Column B (Inline format)
    const jobInfo = requirements ? `${jobTitle} - ${requirements}` : jobTitle;

    const sheetRow = [
      currentDate, // Column A: Date
      jobInfo || "N/A", // Column B: Job Title + Requirements
      source, // Column C: Source
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: targetSpreadsheetId, // Use dynamic sheet ID
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [sheetRow],
      },
    });

    return NextResponse.json({
      success: true,
      fileId: driveResponse.data.id,
      link: driveResponse.data.webViewLink,
      sheetUpdated: true,
      target: role === "ST_Recruiter" ? "Store" : "HO"
    });
  } catch (error: any) {
    console.error("Upload Error Details:", {
      message: error.message,
      stack: error.stack,
      credentials_exist: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      folder_id: FOLDER_ID_INPUT_HO,
      spreadsheet_id: SPREADSHEET_ID_HO,
    });

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message,
        hint: "Check: 1) Service Account has Editor access to Drive folder, 2) Service Account has Editor access to Sheet",
      },
      { status: 500 },
    );
  }
}

