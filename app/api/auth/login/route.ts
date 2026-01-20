import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const REDIRECT_URI = process.env.NODE_ENV === "production"
  ? "https://cbs-recruitment-web.vercel.app/api/auth/callback"
  : "http://localhost:3000/api/auth/callback";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets"
];

export async function GET(req: NextRequest) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  return NextResponse.redirect(authUrl);
}
