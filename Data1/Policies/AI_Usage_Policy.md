# Global Artificial Intelligence Usage Policy

**Document Control Information**

| Attribute | Detail |
| :--- | :--- |
| **Document ID** | POL-AI-001 |
| **Version** | 2.4.0 (Enterprise Release) |
| **Classification** | **INTERNAL CONFIDENTIAL** |
| **Owner** | Legal & Compliance Directorate |
| **Last Review** | 2026-02-10 |
| **Next Review Due** | 2026-05-10 |
| **Applicability** | Global (All Operating Regions) |

> **binding Authority**: This document constitutes mandatory policy. Deviations require written authorization from the Chief Compliance Officer (CCO). Failure to adhere may result in disciplinary action, up to and including termination of employment and legal prosecution.

---

## Table of Contents

1. [Purpose and Policy Statement](#section-1)
2. [Scope of Application](#section-2)
3. [Authorized Tooling Registry](#section-3)
4. [Human-in-the-Loop (HITL) Mandate](#section-4)
5. [Prohibited Use Cases](#section-5)
6. [Input Data Hygiene](#section-6)
7. [Output Verification Standards](#section-7)
8. [Operational Clause 8: Edge Case Handling](#section-8)
9. [Operational Clause 9: Edge Case Handling](#section-9)
10. [Operational Clause 10: Edge Case Handling](#section-10)
11. [Operational Clause 11: Edge Case Handling](#section-11)
12. [Operational Clause 12: Edge Case Handling](#section-12)
13. [Operational Clause 13: Edge Case Handling](#section-13)
14. [Operational Clause 14: Edge Case Handling](#section-14)
15. [Operational Clause 15: Edge Case Handling](#section-15)
16. [Operational Clause 16: Edge Case Handling](#section-16)
17. [Operational Clause 17: Edge Case Handling](#section-17)
18. [Operational Clause 18: Edge Case Handling](#section-18)
19. [Operational Clause 19: Edge Case Handling](#section-19)

---

## 1. Purpose and Policy Statement <a name='section-1'></a>

This policy establishes the **sole** authorized framework for the deployment, utilization, and monitoring of Artificial Intelligence (AI) systems within SocialLink Enterprise.

The organization recognizes AI as a force multiplier but acknowledges significant risks related to **Data Leakage**, **Intellectual Property (IP) Contamination**, and **Reputational Hallucination**. Therefore, a 'Zero Trust' approach is applied to all generative models.

## 2. Scope of Application <a name='section-2'></a>

**In Scope:**
*   All Large Language Models (LLMs) (e.g., GPT-4, Claude, Gemini).
*   Image Generation Models (e.g., Midjourney, DALL-E, Stable Diffusion).
*   Code Assistance Tools (e.g., Copilot).
*   Automated Sentiment Analysis Engines.

**Out of Scope:**
*   Pre-approved heuristic algorithms (e.g., rigid rule-based chatbots).
*   Standard spell-checkers (non-generative).

## 3. Authorized Tooling Registry <a name='section-3'></a>

Personnel may ONLY utilize tools explicitly whitelisted in the **Technical Governance Register**. Usage of 'Shadow AI' (unapproved external tools) is a critical security violation.

| Tool Category | Authorized Instance | Data Classification Allowed |
| :--- | :--- | :--- |
| Text Generation | Enterprise-GPT (Azure Tenant) | Up to 'Confidential' |
| Image Generation | Adobe Firefly (Enterprise) | 'Public' Marketing Assets Only |
| Code Assist | GitHub Copilot (Business) | Internal Source Code |
| Public Chatbots | ChatGPT Free / Consumer | **STRICTLY PROHIBITED** |

## 4. Human-in-the-Loop (HITL) Mandate <a name='section-4'></a>

**Policy Rule 4.1**: No AI-generated content may be published to a public-facing platform without explicit human review and approval.

**Policy Rule 4.2**: The reviewing human agent assumes full liability for the content's accuracy, tone, and compliance.

**Policy Rule 4.3**: 'Blind Publishing' (automating posting directly from LLM output) is technically blocked and policy-prohibited.

## 5. Prohibited Use Cases <a name='section-5'></a>

The following actions are strictly forbidden:
1.  **PII Injection**: Inputting client Personally Identifiable Information (PII) into any model.
2.  **Legal Drafting**: Using AI to generate binding legal contracts without Counsel review.
3.  **Medical/Financial Advice**: Generating advice that requires professional licensure.
4.  **Deepfakes**: Creating non-consensual or deceptive synthetic media of real persons.

## 6. Input Data Hygiene <a name='section-6'></a>

Before prompting an AI model, data must be sanitized. 

*   **Sanitization Procedure**: Remove names, account numbers, addresses, and internal project code names.
*   **Prompt Engineering**: Prompts must include 'Role-Constraint' instructions (e.g., 'Do not hallucinate facts. If unknown, state unknown.').

## 7. Output Verification Standards <a name='section-7'></a>

All AI outputs must pass the **FACTS** checks:
*   **F**actual Accuracy: Verify claims against primary sources.
*   **A**lignment: Check against Brand Safety Guidelines.
*   **C**ompliance: Scan for Restricted Entity mentions.
*   **T**one: Ensure empathy and professionalism.
*   **S**afety: Check for hidden bias or toxicity.

## 8. Operational Clause 8: Edge Case Handling <a name='section-8'></a>

**Clause 8.1**: In the event of Scenario 8, the operator must strictly adhere to the fallback protocol defined in SOP-AI-8.
**Clause 8.2**: Logs of this interaction must be preserved for 16 months in the immutable audit trail.

## 9. Operational Clause 9: Edge Case Handling <a name='section-9'></a>

**Clause 9.1**: In the event of Scenario 9, the operator must strictly adhere to the fallback protocol defined in SOP-AI-9.
**Clause 9.2**: Logs of this interaction must be preserved for 18 months in the immutable audit trail.

## 10. Operational Clause 10: Edge Case Handling <a name='section-10'></a>

**Clause 10.1**: In the event of Scenario 10, the operator must strictly adhere to the fallback protocol defined in SOP-AI-10.
**Clause 10.2**: Logs of this interaction must be preserved for 20 months in the immutable audit trail.

## 11. Operational Clause 11: Edge Case Handling <a name='section-11'></a>

**Clause 11.1**: In the event of Scenario 11, the operator must strictly adhere to the fallback protocol defined in SOP-AI-11.
**Clause 11.2**: Logs of this interaction must be preserved for 22 months in the immutable audit trail.

## 12. Operational Clause 12: Edge Case Handling <a name='section-12'></a>

**Clause 12.1**: In the event of Scenario 12, the operator must strictly adhere to the fallback protocol defined in SOP-AI-12.
**Clause 12.2**: Logs of this interaction must be preserved for 24 months in the immutable audit trail.

## 13. Operational Clause 13: Edge Case Handling <a name='section-13'></a>

**Clause 13.1**: In the event of Scenario 13, the operator must strictly adhere to the fallback protocol defined in SOP-AI-13.
**Clause 13.2**: Logs of this interaction must be preserved for 26 months in the immutable audit trail.

## 14. Operational Clause 14: Edge Case Handling <a name='section-14'></a>

**Clause 14.1**: In the event of Scenario 14, the operator must strictly adhere to the fallback protocol defined in SOP-AI-14.
**Clause 14.2**: Logs of this interaction must be preserved for 28 months in the immutable audit trail.

## 15. Operational Clause 15: Edge Case Handling <a name='section-15'></a>

**Clause 15.1**: In the event of Scenario 15, the operator must strictly adhere to the fallback protocol defined in SOP-AI-15.
**Clause 15.2**: Logs of this interaction must be preserved for 30 months in the immutable audit trail.

## 16. Operational Clause 16: Edge Case Handling <a name='section-16'></a>

**Clause 16.1**: In the event of Scenario 16, the operator must strictly adhere to the fallback protocol defined in SOP-AI-16.
**Clause 16.2**: Logs of this interaction must be preserved for 32 months in the immutable audit trail.

## 17. Operational Clause 17: Edge Case Handling <a name='section-17'></a>

**Clause 17.1**: In the event of Scenario 17, the operator must strictly adhere to the fallback protocol defined in SOP-AI-17.
**Clause 17.2**: Logs of this interaction must be preserved for 34 months in the immutable audit trail.

## 18. Operational Clause 18: Edge Case Handling <a name='section-18'></a>

**Clause 18.1**: In the event of Scenario 18, the operator must strictly adhere to the fallback protocol defined in SOP-AI-18.
**Clause 18.2**: Logs of this interaction must be preserved for 36 months in the immutable audit trail.

## 19. Operational Clause 19: Edge Case Handling <a name='section-19'></a>

**Clause 19.1**: In the event of Scenario 19, the operator must strictly adhere to the fallback protocol defined in SOP-AI-19.
**Clause 19.2**: Logs of this interaction must be preserved for 38 months in the immutable audit trail.

