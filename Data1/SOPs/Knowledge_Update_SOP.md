# Standard Operating Procedure: Knowledge Base Maintenance & Depreciation

**SOP Metadata**
*   **SOP ID**: SOP-OPS-KNOW
*   **Version**: 5.0
*   **Effective Date**: 2026-01-01
*   **Review Cycle**: Quarterly
*   **Process Owner**: Head of Operations

---

## 1. Objective and Purpose
To keep the 'Internal Compliance Assistant' brain accurate and current.

## 2. Scope
Knowledge Managers.

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

### Step 1: Trigger Event
**Action**: New Policy release, Algorithm change on Platform, or Internal Decision made.

> **🛑 Control Gate**: Ticket created in JIRA.

---

### Step 2: Drafting Update
**Action**: Clone the relevant Markdown file. Apply changes. Add 'Version History' entry.

> **🛑 Control Gate**: Use Semantic Versioning.

---

### Step 3: Validation
**Action**: Run the 'Helper' bot in staging mode. Ask test questions to verify new answer logic.

> **🛑 Control Gate**: Bot must not hallucinate old answer.

---

### Step 4: Approval
**Action**: Submit PR (Pull Request) to Compliance Team.

> **🛑 Control Gate**: Merge only after CCO approval.

---

### Step 5: Broadcast
**Action**: Notify team via Slack #announcements.

> **🛑 Control Gate**: Read-receipts required.

---

## 6. Exception Handling
If any Control Gate fails:
1.  **Stop** the workflow immediately.
2.  Log the error in JIRA (Project: OPS-RISK).
3.  Consult the *Compliance Enforcement Policy* for guidance.
4.  Do not bypass controls under pressure.

## 7. Audit Trail Requirements
Every action in this SOP generates a log entry. The Executor must verify that the 'Action ID' is visible in the dashboard footer before closing the session.
