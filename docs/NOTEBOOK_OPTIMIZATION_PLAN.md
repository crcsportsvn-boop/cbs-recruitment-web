# NotebookLM Optimization Plan

## CBS Recruitment Web - Vibe Coding Workflow Enhancement

> **Objective:** Optimize NotebookLM sources to maximize effectiveness for the "Plan in Browser → Execute in Antigravity" workflow.

---

## 📊 Current State Analysis

### Existing Sources (14 total)

✅ **Project Core:**

- `PROJECT_CONTEXT.md` - Tech stack, auth flow, design system
- `PLAN_DATA_STRUCTURE.md` - Google Sheets schema (39 columns)
- `app/api/candidates/route.ts` - Candidate data fetching logic
- `app/api/user/route.ts (Context)` - RBAC and user profile
- `app/api/jobs/route.ts (Context)` - Job management
- `components/KanbanBoard.tsx (Summary)` - UI state management
- `n8n-workflow-guide.md` - CV filename parsing logic

✅ **Skills (7 total):**

- `senior-fullstack` - Architecture & scaffolding
- `nextjs-best-practices` - App Router patterns
- `tailwind-design-system` - Design tokens
- `clean-code` - Pragmatic standards
- `n8n-node-configuration` - Automation expertise
- `hr-pro` - Hiring & compliance
- `email-sequence` - Professional communications

---

## 🎯 Identified Gaps

### Critical Missing Documentation

1. **User Guide (HUONG_DAN_SU_DUNG.md)** - 455 lines
   - **Why Critical:** Contains complete workflow explanations for all features
   - **Content:** Login → Input → Datapool → Kanban → Reports → Job Management
   - **Value for AI:** Understands user expectations and feature interactions
   - **Use Cases:**
     - "How should the Rehire modal behave?"
     - "What's the correct flow for stopping a job?"

2. **QA Checklist (QA_CHECKLIST.md)** - 150 lines
   - **Why Critical:** Defines quality standards and test scenarios
   - **Content:** 9 test categories (Auth, Input, Kanban, Datapool, Rehire, Reports, etc.)
   - **Value for AI:** Knows what to test after implementing features
   - **Use Cases:**
     - "What should I verify after adding a new status column?"
     - "How do I ensure the drag-and-drop works correctly?"

3. **Roles & Permissions (PLAN_ROLES_AND_PERMISSIONS.md)** - 45 lines
   - **Why Critical:** RBAC logic and future Store Manager view
   - **Content:** Current state (HO_Recruiter), planned features (Store view)
   - **Value for AI:** Understands access control requirements
   - **Use Cases:**
     - "How should Store Managers see different data?"
     - "What environment variables control permissions?"

4. **Agent Rules (AGENT_RULES.md)** - 14 lines
   - **Why Critical:** Git workflow automation rules
   - **Content:** When to auto-commit vs. manual commit
   - **Value for AI:** Knows deployment and versioning expectations
   - **Use Cases:**
     - "Should I push this documentation change?"
     - "When do I need to run git commit?"

### Additional Valuable Files

5. **CHANGELOG.md** - Historical context of major changes
6. **HUONG_DAN_THEM_USER.md** - User management procedures
7. **QUY_TRINH_QUAN_LY_TAI_KHOAN.md** - Account management workflow

---

## 📋 Proposed Changes

### Phase 1: Add Critical Documentation (High Priority)

| File                            | Size  | Why Add                    | Expected Impact                           |
| ------------------------------- | ----- | -------------------------- | ----------------------------------------- |
| `HUONG_DAN_SU_DUNG.md`          | 27KB  | Complete feature reference | ⭐⭐⭐⭐⭐ AI understands all user flows  |
| `QA_CHECKLIST.md`               | 6.6KB | Testing standards          | ⭐⭐⭐⭐⭐ AI knows verification steps    |
| `PLAN_ROLES_AND_PERMISSIONS.md` | 2.4KB | RBAC logic                 | ⭐⭐⭐⭐ AI handles permissions correctly |
| `AGENT_RULES.md`                | 619B  | Git automation             | ⭐⭐⭐ AI follows deployment rules        |

**Total Addition:** ~37KB (4 files)

### Phase 2: Enhance Existing Sources (Medium Priority)

**Update `PROJECT_CONTEXT.md`:**

- Add section on "Common Pitfalls" (e.g., Cookie auth vs Service Account)
- Include environment variable reference table
- Add troubleshooting guide for typical errors

**Update `n8n-workflow-guide.md`:**

- Add examples of successful vs. failed filename formats
- Include error handling scenarios

### Phase 3: Optional Enhancements (Low Priority)

- Add `CHANGELOG.md` for historical context
- Add `HUONG_DAN_THEM_USER.md` for user management procedures
- Consider creating a "Quick Reference" summary (1-page cheat sheet)

---

## 🎨 Optimization Strategy

### Current Sources: Keep or Refine?

| Source                | Status      | Recommendation                |
| --------------------- | ----------- | ----------------------------- |
| Skills (7 files)      | ✅ Keep All | Already condensed, high value |
| API Context (3 files) | ✅ Keep     | Core logic reference          |
| Component Summary     | ✅ Keep     | UI state management           |
| Workflow Guide        | ✅ Keep     | N8N integration               |
| Data Structure        | ✅ Keep     | Database schema               |
| Project Context       | 🔄 Enhance  | Add troubleshooting section   |

### Recommended Final Structure (18 sources)

**Core Project (8):**

1. PROJECT_CONTEXT.md (Enhanced)
2. PLAN_DATA_STRUCTURE.md
3. HUONG_DAN_SU_DUNG.md (NEW)
4. QA_CHECKLIST.md (NEW)
5. PLAN_ROLES_AND_PERMISSIONS.md (NEW)
6. AGENT_RULES.md (NEW)
7. n8n-workflow-guide.md
8. API & Component summaries (3 files)

**Skills (7):**

- All existing skills retained

**Total:** 18 sources (~50KB text)

---

## ✅ Implementation Steps

1. **Add User Guide** → Enables AI to understand complete feature workflows
2. **Add QA Checklist** → Ensures AI knows testing requirements
3. **Add Roles/Permissions** → Clarifies RBAC logic for future features
4. **Add Agent Rules** → Defines git automation behavior
5. **Update PROJECT_CONTEXT** → Add troubleshooting and env var reference
6. **Test Workflow** → Ask NotebookLM sample questions to verify improvements

---

## 🎯 Expected Outcomes

### Before Optimization:

- AI knows **technical implementation** (code, APIs, data structure)
- AI knows **best practices** (skills)
- AI **lacks context** on user workflows and testing standards

### After Optimization:

- ✅ AI understands **complete user journeys** (Login → Hire)
- ✅ AI knows **quality standards** (what to test)
- ✅ AI respects **operational rules** (git, permissions)
- ✅ AI can **troubleshoot** common issues
- ✅ AI provides **end-to-end guidance** (Plan → Code → Test → Deploy)

---

## 📝 Next Steps

1. **User Review:** Approve this plan
2. **Execute Addition:** Add 4 critical files to NotebookLM
3. **Verify:** Test with sample questions
4. **Iterate:** Refine based on real usage

**Estimated Time:** 10-15 minutes to add all sources
**Estimated Impact:** 🚀 Transforms NotebookLM from "code assistant" to "project co-pilot"
