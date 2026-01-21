import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const tokensCookie = cookieStore.get("google_tokens")?.value;

    if (!tokensCookie) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const tokens = JSON.parse(tokensCookie);
    const accessToken = tokens.access_token;

    if (!accessToken) {
       return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // 1. Get User Info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    const googleId = userInfo.data.id; // "Extract ID" requested by user

    if (!email) {
       return NextResponse.json({ error: "Could not identify user" }, { status: 400 });
    }

    // 2. Check Permissions in Google Sheet 'User_view'
    // Range: User_view!A:D -> Email, Role, Upload_Config, View_Config

    // Support both Full JSON and Individual Env Vars
    let credentials;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        try {
            credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        } catch (e) {
            console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", e);
        }
    }
    
    // Fallback to individual vars if JSON not present or failed
    if (!credentials) {
        credentials = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Use env var specific for HO Recruiter view
    const spreadsheetIdHO = process.env.GOOGLE_SHEET_ID_HO || process.env.GOOGLE_SHEET_ID || "191CzArhWOeyCeRPHlhSbibMG-q_qfW3k2YUCPLvG06w";
    
    // Placeholder declarations for Store (ST) view as requested
    // const spreadsheetIdST = process.env.GOOGLE_SHEET_ID_ST; 
    // const folderIdInputST = process.env.GOOGLE_DRIVE_INPUT_FOLDER_ID_ST;

    // Default to HO for user checking
    const spreadsheetId = spreadsheetIdHO;

    let role = "Guest";
    let config = {};

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'User_view!A:F',
        });

        const rows = response.data.values;
        if (rows && rows.length > 0) {
            // Find row with matching email (Case insensitive)
            const userRow = rows.find((r) => r[0]?.toString().toLowerCase() === email.toLowerCase());
            
            if (userRow) {
                role = userRow[1] || "User";
                // Capture configs if available (Cols C and D)
                config = {
                    uploadCv: userRow[2] || "DEFAULT",
                    viewKanban: userRow[3] || "DEFAULT",
                    displayName: userRow[4] || userInfo.data.name, // Col E: Name
                    phoneNumber: userRow[5] || "" // Col F: Phone
                };
            }
        }
    } catch (sheetError: any) {
        console.error("Error reading User_view sheet:", sheetError);
        // Return error details to help user debug permissions
        return NextResponse.json({
            authenticated: true,
            user: {
                email,
                id: googleId,
                name: userInfo.data.name,
                picture: userInfo.data.picture,
                role: "Guest",
                config: {},
                debugError: sheetError.message // Return error message to UI
            }
        });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email,
        id: googleId,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
        role,
        config
      }
    });

  } catch (error: any) {
    console.error("API User Error:", error);
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
