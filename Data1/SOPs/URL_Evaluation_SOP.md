# Standard Operating Procedure: External Link Safety & Evaluation

**SOP Metadata**
*   **SOP ID**: SOP-SEC-URL
*   **Version**: 5.0
*   **Effective Date**: 2026-01-01
*   **Review Cycle**: Quarterly
*   **Process Owner**: Head of Operations

---

## 1. Objective and Purpose
To prevent posting malicious, phishing, or brand-unsafe links.

## 2. Scope
All staff sharing external links.

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

### Step 1: Automated Scan
**Action**: Paste URL into 'SocialLink Defender'. Checks VirusTotal, Google Safe Browsing, and internal blocklist.

> **🛑 Control Gate**: If highlighted Red -> DO NOT USE.

---

### Step 2: Manual Inspection
**Action**: Open URL in sandboxed 'Disposable Browser'. Verify landing page content matches description.

> **🛑 Control Gate**: Check for excessive pop-ups or 'Clickbait' mechanics.

---

### Step 3: Brand Adjacency
**Action**: Scan landing page for competitor ads or offensive content.

> **🛑 Control Gate**: Page must be 'Clean'.

---

### Step 4: Shortener Usage
**Action**: Only use authorized branded shortener (lnk.social). Do not use bit.ly or tinyurl generic domains.

> **🛑 Control Gate**: Shortener analytics enabled.

---

## 6. Exception Handling
If any Control Gate fails:
1.  **Stop** the workflow immediately.
2.  Log the error in JIRA (Project: OPS-RISK).
3.  Consult the *Compliance Enforcement Policy* for guidance.
4.  Do not bypass controls under pressure.

## 7. Audit Trail Requirements
Every action in this SOP generates a log entry. The Executor must verify that the 'Action ID' is visible in the dashboard footer before closing the session.
