# Standard Operating Procedure: Content Drafting and AI Augmentation

**SOP Metadata**
*   **SOP ID**: SOP-CRE-DRAFT
*   **Version**: 5.0
*   **Effective Date**: 2026-01-01
*   **Review Cycle**: Quarterly
*   **Process Owner**: Head of Operations

---

## 1. Objective and Purpose
To create high-quality, compliant content using approved tools and workflows.

## 2. Scope
Content Creators and Copywriters.

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

### Step 1: Concept Approval
**Action**: Review Campaign Knowledge Base for approved themes. Do not deviate from the Creative Brief.

> **🛑 Control Gate**: Theme matches 'Approved' campaign list.

---

### Step 2: Drafting (Manual/AI)
**Action**: If using AI, use ONLY Enterprise-GPT. Prompt must include: 'Tone: Professional, Friendly'.

> **🛑 Control Gate**: No PII in AI Prompt (Auto-blocked by DLP).

---

### Step 3: Compliance Linter
**Action**: Run text through the Internal Linter Tool. Checks for: Banned words, Competitor names, Unverified claims.

> **🛑 Control Gate**: Linter Score must be 100% Pass.

---

### Step 4: Visual Verification
**Action**: Ensure images have alt-text. Ensure no unauthorized IP (logos, faces) in background.

> **🛑 Control Gate**: Reverse Image Search check passed.

---

### Step 5: Final Approval
**Action**: Route to Client Portal.

> **🛑 Control Gate**: Client digital signature received.

---

## 6. Exception Handling
If any Control Gate fails:
1.  **Stop** the workflow immediately.
2.  Log the error in JIRA (Project: OPS-RISK).
3.  Consult the *Compliance Enforcement Policy* for guidance.
4.  Do not bypass controls under pressure.

## 7. Audit Trail Requirements
Every action in this SOP generates a log entry. The Executor must verify that the 'Action ID' is visible in the dashboard footer before closing the session.
