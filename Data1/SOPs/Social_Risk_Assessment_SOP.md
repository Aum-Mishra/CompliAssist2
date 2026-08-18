# Standard Operating Procedure: Social Media Risk Assessment & Triage

**SOP Metadata**
*   **SOP ID**: SOP-RISK-TRIAGE
*   **Version**: 5.0
*   **Effective Date**: 2026-01-01
*   **Review Cycle**: Quarterly
*   **Process Owner**: Head of Operations

---

## 1. Objective and Purpose
To systematically categorize and respond to potential PR crises or brand safety threats.

## 2. Scope
Risk Analysts and Crisis Response Team.

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

### Step 1: Signal Ingestion
**Action**: Monitor real-time dashboards (Sprinklr/Brandwatch) for velocity spikes (>20% above baseline).

> **🛑 Control Gate**: Ensure data source connection status is green.

---

### Step 2: Classification
**Action**: Assign Risk Level:
*   **L1 (Notice)**: Single negative complaint.
*   **L2 (watch)**: 5+ reliable verified users complaining.
*   **L3 (Event)**: Competitor or News outlet coverage.
*   **L4 (Crisis)**: Viral hate speech or legal threat.

> **🛑 Control Gate**: If L3 or L4 -> Trigger PagerDuty for VP of Comms.

---

### Step 3: Investigation
**Action**: Trace origin of the narrative. Is it organic or bot-led (Coordination)?

> **🛑 Control Gate**: Check 'Restricted Entity' list for known botnet actors.

---

### Step 4: Response Formulation
**Action**: Consult 'Curated Internal Decisions' for precedent. Draft response strategy.

> **🛑 Control Gate**: Legal review required for L3+.

---

### Step 5: Execution
**Action**: Deploy approved response or execute 'Dark Mode' (silence).

> **🛑 Control Gate**: Post-action log must include 'Decision Rationale'.

---

## 6. Exception Handling
If any Control Gate fails:
1.  **Stop** the workflow immediately.
2.  Log the error in JIRA (Project: OPS-RISK).
3.  Consult the *Compliance Enforcement Policy* for guidance.
4.  Do not bypass controls under pressure.

## 7. Audit Trail Requirements
Every action in this SOP generates a log entry. The Executor must verify that the 'Action ID' is visible in the dashboard footer before closing the session.
