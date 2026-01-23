# Agent Operational Rules

## Git Workflows

1. **Feature Changes & Code Updates**:
   - When implementing new features, fixing bugs, or modifying code logic:
     - Execute the changes.
     - **MUST** automatically commit and push to the repository (`git add .`, `git commit`, `git push`).

2. **Documentation & Non-functional Updates**:
   - When updating documentation (MD files), fixing typos, or making non-code changes requested by the user:
     - Execute the changes (write to files).
     - **DO NOT** push to git automatically. Leave the changes staged or local unless explicitly asked to push.
