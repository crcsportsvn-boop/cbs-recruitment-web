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
- **Authentication**: Google OAuth 2.0 (Custom implementation with Cookies)

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
| 23        | X         | cvLink         | Google Drive Link to CV                                                   |
| 27        | AB        | status         | **Kanban Status**: New, Screening, Interview, Interview2, Offer, Rejected |
| 28        | AC        | failureReason  | Reason for Rejection                                                      |
| 29        | AD        | testResult     | Filtering/Test Result Date                                                |
| 30        | AE        | interviewDate1 | Date/Time for Round 1                                                     |
| 31        | AF        | interviewDate2 | Date/Time for Round 2                                                     |
| 32        | AG        | offerDate      | Date Offer Sent                                                           |
| 35        | AJ        | log            | Operation Logs                                                            |

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

### Authentication Flow

1.  **Frontend**: User clicks "Login with Google".
2.  **Route**: `/api/auth/login` -> Redirects to Google OAuth Consent Screen.
3.  **Callback**: `/api/auth/callback` -> Exchanges code for Tokens.
4.  **Storage**: Tokens stored in `httpOnly` cookie named `google_tokens`.
5.  **Validation**: `/api/user` reads cookie -> Fetches Profile (Google) + Role (Sheet).

### Environment Variables

| Variable                          | Purpose                                                                                   |
| :-------------------------------- | :---------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`                | OAuth Client ID                                                                           |
| `GOOGLE_CLIENT_SECRET`            | OAuth Client Secret                                                                       |
| `GOOGLE_SERVICE_ACCOUNT_JSON`     | **CRITICAL**: Full JSON content of Service Account Key (for server-side Sheet operations) |
| `GOOGLE_SHEET_ID_HO`              | ID of the Master Google Sheet (HO)                                                        |
| `GOOGLE_DRIVE_INPUT_FOLDER_ID_HO` | Drive Folder ID for CV Uploads (HO). Correct ID: `1L23vAO-hvrXPxE-VFTAzGzA0_kyb_wGN`      |
| `REDIRECT_URI`                    | OAuth Callback URL (e.g., `http://localhost:3000/api/auth/callback`)                      |

### Drive Folder Configuration

- **HO Recruitment Folder**: `1L23vAO-hvrXPxE-VFTAzGzA0_kyb_wGN`
- **ST Recruitment Folder**: _(Placeholder - Update in Env)_

### Key API Routes

- `GET /api/candidates`: Fetch all candidates (filtered by permissions in future).
- `POST /api/candidates/update`: Update status, log, or interview dates.
- `POST /api/upload`: Multer processing -> Upload to Drive -> Appending to Sheet `Datapool`.
- `GET /api/user`: Returns User Profile + Role + Signature Config.

---

## 5. Development Guidelines

1.  **Aesthetics**: Always enforce "Premium, Clean, Modern". Use standard Red `#B91C1C`.
2.  **Email Templates**: Do **not** use `mailto` for complex formatting (tables/bold). Use `Clipboard API` to generate HTML templates that users can paste into Outlook.
3.  **Roles**:
    - **HO_Recruiter**: Full access to `Datapool`.
    - **Store_Manager**: (Future) Restricted view based on Store ID.
    - **Guest**: Read-only/No access state.

## 6. Common Issues & Fixes

- **"Missing client_email"**: Check `GOOGLE_SERVICE_ACCOUNT_JSON` in `.env`.
- **Email Formatting**: Outlook requires pasted HTML. Use the "Copy Email Template" button feature.
- **Permissions**: Ensure Service Account Email (`...gserviceaccount.com`) is an **Editor** on the Google Sheet and Drive Folder.

---

**Use this file as the primary context for any future code modifications.**
