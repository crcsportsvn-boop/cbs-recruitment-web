# CBS Recruitment Portal - Project Context & Documentation

> **Status**: Active Development
> **Last Updated**: 2026-01-21
> **OS**: Windows / Next.js Framework
> **Deployment**: Vercel (Production)
> **Environment**: Updates must be made in Vercel Project Settings.

## 1. Project Overview

A web-based Recruitment Portal for CBS Vietnam to manage candidate applications, visualize recruitment pipelines (Kanban), and automate email communications. It connects directly to Google Sheets (as Database) and Google Drive (File Storage).

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Utility-first) + Shadcn UI (Components)
- **Database**: Google Sheets (via `googleapis` v4)
- **File Storage**: Google Drive (via `googleapis` v3)
- **Authentication**: Google OAuth 2.0. **Important**: The application uses the **Logged-in User's Credentials** (via `google_tokens` cookie) to read/write to Sheets. It does **NOT** use a Service Account.

---

## 2. Design System & UI/UX

- **Primary Color**: `#B91C1C` (Tailwind `red-700`) - Reverted from `#EE2E24`.
- **Hover Color**: `#991b1b` (Tailwind `red-800`).
- **Fonts**: Inter / Sans-serif (System default).
- **Key Components**:
  - **KanbanBoard**: Main interactive board for candidate management.
  - **DatapoolTable**: Table view for searching and filtering (New/Rejected).
  - **CandidateInputForm**: Form for manual CV upload and data entry.
  - `components/ui/*`: Reusable atomic components (Buttons, Cards, Dialogs).

---

## 3. Data Architecture (Google Sheets)

### A. Sheet: `Datapool` (Main Database)

Used in `app/api/candidates/route.ts`. Maps candidate data from N8N/Forms.

| Col Index | Excel Col | Field Name     | Description                                                               |
| :-------- | :-------- | :------------- | :------------------------------------------------------------------------ |
| 0         | A         | matchScore     | AI Scoring (0-10)                                                         |
| 1         | B         | timestamp      | Application Time                                                          |
| 2         | C         | positionRaw    | Position Name (Raw)                                                       |
| 3         | D         | source         | Recruitment Source (TopCV, LinkedIn, etc.)                                |
| 4         | E         | jobCode        | Job ID (e.g., HO-001)                                                     |
| 5         | F         | positionId     | Specific Position ID                                                      |
| 6         | G         | fullName       | Candidate Name                                                            |
| 7         | H         | yob            | Year of Birth                                                             |
| 8         | I         | gender         | Gender                                                                    |
| 9         | J         | phone          | Phone Number                                                              |
| 10        | K         | email          | Email Address                                                             |
| 11        | L         | location       | Current Location                                                          |
| 12        | M         | degree         | Degree (Bachelor, etc.)                                                   |
| 13        | N         | education      | School / University                                                       |
| 14        | O         | jobFunction    | **Function / Task**                                                       |
| 19        | T         | skills         | **Skills**                                                                |
| 20        | U         | workHistory    | **Work History / Experience**                                             |
| 21        | V         | summary        | AI Summary                                                                |
| 23        | X         | cvLink         | Google Drive Link to CV                                                   |
| 26        | AA        | isPotential    | **Potential CV** (TRUE/FALSE)                                             |
| 27        | AB        | status         | **Kanban Status**: New, Screening, Interview, Interview2, Offer, Rejected |
| 28        | AC        | failureReason  | Reason for Rejection                                                      |
| 29        | AD        | testResult     | Filtering/Test Result Date                                                |
| 30        | AE        | interviewDate1 | Date/Time for Round 1                                                     |
| 31        | AF        | interviewDate2 | Date/Time for Round 2                                                     |
| 32        | AG        | offerDate      | Date Offer Sent                                                           |
| 35        | AJ        | log            | Operation Logs                                                            |
| 36        | AK        | rejectedRound  | **Round where candidate was rejected**                                    |

### B. Sheet: `User_view` (RBAC & Config)

Used in `app/api/user/route.ts`. Controls permissions.

| Col | Field         | Usage                                                |
| :-- | :------------ | :--------------------------------------------------- |
| A   | Email         | User email (case-insensitive match)                  |
| B   | Role          | `HO_Recruiter`, `Store_Manager`, `Admin`, `Guest`    |
| C   | Upload_Config | Config ID for Upload permissions (e.g. `HO_DEFAULT`) |
| D   | View_Config   | Config ID for View permissions                       |
| E   | DisplayName   | **User Name** for Email Signature                    |
| F   | PhoneNumber   | **User Phone** for Email Signature                   |

---

## 4. Backend Logic & Infrastructure

### Authentication Flow (Corrected Jan 2026)

1.  **Login**: User logs in via Google OAuth.
2.  **Tokens**: Access Token & Refresh Token are stored in `google_tokens` cookie.
3.  **Operations**: All API routes (`GET /candidates`, `POST /candidates/update`) use the **Tokens from the Cookie** to authenticate with Google Sheets API.
4.  **Implication**: The **Logged-in User** must have "Editor" access to the Google Sheet. The app acts _on behalf of_ the user.

### Environment Variables

| Variable                          | Purpose                                                                              |
| :-------------------------------- | :----------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`                | OAuth Client ID                                                                      |
| `GOOGLE_CLIENT_SECRET`            | OAuth Client Secret                                                                  |
| `GOOGLE_SHEET_ID_HO`              | ID of the Master Google Sheet (HO)                                                   |
| `GOOGLE_DRIVE_INPUT_FOLDER_ID_HO` | Drive Folder ID for CV Uploads (HO). Correct ID: `1L23vAO-hvrXPxE-VFTAzGzA0_kyb_wGN` |
| `REDIRECT_URI`                    | OAuth Callback URL (e.g., `https://.../api/auth/callback`)                           |
| `GOOGLE_SERVICE_ACCOUNT_JSON`     | _Deprecated/Not Used for Sheet Writes in current flow_.                              |

### Key API Routes

- `GET /api/candidates`: Fetch all candidates. Uses User Cookie.
- `POST /api/candidates/update`: Update status (Process/Reject). Uses User Cookie.
- `GET /api/user`: Returns User Profile + Role.

---

## 5. Development Guidelines

1.  **Aesthetics**: Always enforce "Premium, Clean, Modern". Use standard Red `#B91C1C`.
2.  **Auth Principle**: Never assume Service Account access. Always check for `google_tokens` cookie in API routes.
3.  **Roles**:
    - **HO_Recruiter**: Full access to `Datapool`.
    - **Store_Manager**: (Future) Restricted view based on Store ID.

## 6. Common Issues & Fixes

- **"Failed to update candidate"**:
  - Check if User (e.g., `dinhsang031@gmail.com`) has **Edit Access** to the Google Sheet.
  - Check if `google_tokens` cookie is present (User might need to logout/login).
- **Rejection Not Saving**:
  - Ensure `rejectedRound` (Col AK) and `isPotential` (Col AA) are editable in the Sheet.
  - Check API response for specific Google Sheets API errors (e.g. "Invalid Value").

---

**Use this file as the primary context for any future code modifications.**
