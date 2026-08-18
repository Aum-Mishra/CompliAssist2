# Standard Operating Procedure: Reddit Community Engagement Protocol

**SOP Metadata**
*   **SOP ID**: SOP-ENG-REDDIT
*   **Version**: 5.0
*   **Effective Date**: 2026-01-01
*   **Review Cycle**: Quarterly
*   **Process Owner**: Head of Operations

---

## 1. Objective and Purpose
To safely engage with Reddit communities while mitigating backlash and 'brigading' risks.

## 2. Scope
All Community Managers engaging on Reddit.

## 3. Roles and Responsibilities
*   **Executor**: The primary agent performing the task.
*   **Reviewer**: The senior agent validating the output (Four-Eyes Principle).
*   **Accountable**: The manager owning the risk.

## 4. Prerequisites and Tools
*   **Required Access**: VPN (Tier 2), SocialLink Dashboard, 2FA Token.
*   **Software**: Enterprise Browser v88+, Panopticon Agent active.
*   **Reference**: Refer to *Restricted Entities Registry* before starting.

---

## 5. Procedure Lifecycle

### Step 1: Subreddit Vetting
**Action**: Query the subreddit name against the Restricted_Entities_Registry.csv. Manually review the front page for 'Stickied' hostility posts.

> **🛑 Control Gate**: If subreddit listed in Restricted Registry or contains 'Hate Speech' keywords -> ABORT.

---

### Step 2: Account Selection
**Action**: Select a persona account with >500 Karma and >6 months age. Never use a 'fresh' account for brand defense.

> **🛑 Control Gate**: Verify account is not currently 'shadowbanned' using internal tool.

---

### Step 3: Discussion Context Analysis
**Action**: Read the parent thread fully. Use the Sentiment Analysis Tool to gauge thread temperature.

> **🛑 Control Gate**: If Sentiment Score < -0.4 (Hostile) -> DO NOT ENGAGE.

---

### Step 4: Drafting Response
**Action**: Draft response in the SocialLink Sandbox. Ensure transparency (indicate brand affiliation). Avoid 'Corporate Speak'.

> **🛑 Control Gate**: Check content against Brand_Safety_Guidelines.md.

---

### Step 5: Peer Review
**Action**: Submit draft to Senior Moderator queue.

> **🛑 Control Gate**: Reviewer must physically tick 'Approved' in the system.

---

### Step 6: Posting and Monitoring
**Action**: Publish comment. Set a timer for 15, 60, and 120 minutes to check for replies.

> **🛑 Control Gate**: If downvotes > 10 within 15 mins -> DELETE COMMENT.

---

## 6. Exception Handling
If any Control Gate fails:
1.  **Stop** the workflow immediately.
2.  Log the error in JIRA (Project: OPS-RISK).
3.  Consult the *Compliance Enforcement Policy* for guidance.
4.  Do not bypass controls under pressure.

## 7. Audit Trail Requirements
Every action in this SOP generates a log entry. The Executor must verify that the 'Action ID' is visible in the dashboard footer before closing the session.
