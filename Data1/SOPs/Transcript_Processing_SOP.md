# Standard Operating Procedure: Audio/Video Transcript Processing

**SOP Metadata**
*   **SOP ID**: SOP-DAT-TRANS
*   **Version**: 5.0
*   **Effective Date**: 2026-01-01
*   **Review Cycle**: Quarterly
*   **Process Owner**: Head of Operations

---

## 1. Objective and Purpose
To convert AV media to text for audit and sentiment analysis while protecting privacy.

## 2. Scope
Data Ops.

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

### Step 1: Ingestion
**Action**: Secure upload to S3 Bucket `raw-media-injest`. Encrypted tunnel only.

> **🛑 Control Gate**: Virus scan on file entry.

---

### Step 2: Automated Transcription
**Action**: Trigger AWS Transcribe Job. Language set to 'Auto-Detect'.

> **🛑 Control Gate**: Confidence threshold > 85%.

---

### Step 3: PII Redaction (Automated)
**Action**: Run 'Presidio' PII scrubber on the text output.

> **🛑 Control Gate**: Check for Redaction tags [REDACTED].

---

### Step 4: Human QC
**Action**: Random sampling (10 mins per hour of footage). Verify speakers are correctly identified.

> **🛑 Control Gate**: If Error Rate > 5% -> Reject Batch.

---

### Step 5: Archival
**Action**: Store JSON and PDF transcript in 'Processed' folder. Tag with Campaign ID.

> **🛑 Control Gate**: Retention policy set to 7 years.

---

## 6. Exception Handling
If any Control Gate fails:
1.  **Stop** the workflow immediately.
2.  Log the error in JIRA (Project: OPS-RISK).
3.  Consult the *Compliance Enforcement Policy* for guidance.
4.  Do not bypass controls under pressure.

## 7. Audit Trail Requirements
Every action in this SOP generates a log entry. The Executor must verify that the 'Action ID' is visible in the dashboard footer before closing the session.
