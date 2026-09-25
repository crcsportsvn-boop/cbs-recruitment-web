## Git Account Switch Log

Date: 2026-04-24
Project: `cbs-recruitment-web`

### Context

- Original GitHub repo: `https://github.com/dinhsang031/cbs-recruitment-web`
- New GitHub repo: `https://github.com/crcsportsvn-boop/cbs-recruitment-web`
- Reason for switch:
  - Vercel blocked deploys on Hobby/private-repo collaboration rules.
  - The project was reconnected to the new GitHub repo under `crcsportsvn-boop`.

### Git / Repo Changes Made

- Added new remote in clean `main` worktree:
  - remote name: `crcsportsvn-boop`
  - url: `https://github.com/crcsportsvn-boop/cbs-recruitment-web.git`
- Logged this machine into Git Credential Manager for:
  - `dinhsang031`
  - `crcsportsvn-boop`
- Pushed `main` to the new repo successfully.

### Commit Identity Used For New Repo

- Git author for new deploy-trigger commit was changed to:
  - `crcsportsvn-boop <crcsportsvn@gmail.com>`

### Important Branch State

- Clean worktree used for publishing:
  - `C:\Users\ns20372840\.gemini\antigravity-ide-ide\scratch\cbs-recruitment-web-main`
- Original working branch:
  - `test-launching-kanban`
- Important branch history:
  - `origin/test-launching-kanban` contains newer work than old `origin/main`
  - commit `93e0d07`:
    - `fix: withdraw from Hired returns to Offer and clears startDate/officialDate`
- This newer branch was merged into clean `main`.

### Final Published State

- New repo current pushed `main` commit:
  - `f37bc77`
  - message: `Merge newer kanban branch with auto-close when hired`

### Business Logic Added

- When one candidate is marked `Hired`, other active candidates with the same `jobCode` are auto-closed.
- Backend writes:
  - `AB = Rejected`
  - `AC = Closed - Position Filled`
  - `AL = rejected round` based on current stage

### Historical Data Backfill

- Backfill was executed directly against Google Sheets using the provided service account key.
- Result:
  - HO updated candidates: `8`
  - ST updated candidates: `550`

### Notes For Next Session

- If pushing to the new repo again, prefer using the clean worktree:
  - `C:\Users\ns20372840\.gemini\antigravity-ide-ide\scratch\cbs-recruitment-web-main`
- Before making deploy-trigger commits, verify local git author:
  - `git config user.name`
  - `git config user.email`
- For Vercel-related deploy checks, confirm the project is still connected to:
  - `crcsportsvn-boop/cbs-recruitment-web`
- The original repo under `dinhsang031` still exists and is still configured as remote `origin` in some worktrees.
- The `test-launching-kanban` worktree and merged `main` differ only by trivial whitespace at the time of handoff.

