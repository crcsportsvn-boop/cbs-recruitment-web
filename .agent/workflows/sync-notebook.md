---
description: Sync project context and development progress to NotebookLM
---

// turbo-all

# Sync to NotebookLM Workflow

Use this workflow whenever a significant feature is completed, the data structure changes, or project guidelines are updated. This ensures the NotebookLM "Brain" stays synchronized with the actual codebase.

## Steps

1. Read the latest project context and data structure files:
   - `view_file` on `c:\Users\ns20372840\.gemini\antigravity\scratch\cbs-recruitment-web\.agent\PROJECT_CONTEXT.md`
   - `view_file` on `c:\Users\ns20372840\.gemini\antigravity\scratch\cbs-recruitment-web\docs\PLAN_DATA_STRUCTURE.md`

2. Synchronize to NotebookLM `6c46738a-f9ae-48f5-96b6-fe9e5a9366f8`:
   - Update `PROJECT_CONTEXT.md` source using `mcp_notebooklm-mcp-server_notebook_add_text`.
   - Update `PLAN_DATA_STRUCTURE.md` source using `mcp_notebooklm-mcp-server_notebook_add_text`.
   - Add/Update any new critical API routes or components created in the recent session.

3. Verify Sync:
   - Use `mcp_notebooklm-mcp-server_notebook_get` to confirm the sources are updated with latest timestamps/content.

4. Inform the User:
   - Provide a summary of what was updated in the Notebook "knowledge base".
