# Cybersecurity Control Framework

**Technical Specification Document**
*   **Classification**: RESTRICTED (Engineering Only)
*   **System Owner**: CTO
*   **Last Update**: 2026-02-01

---

## 1. Authentication & Authorization
**1.1 IdP**: Okta is the single source of truth for identity.
**1.2 MFA**: FIDO2 hardware keys (YubiKey) required for Production access.
**1.3 RBAC**: Access is granted on 'Least Privilege'. 'Bot' service accounts cannot login interactively.

## 2. Data Protection
**2.1 Encryption**: All database volumes are encrypted with AWS KMS CMKs. Keys are rotated every 90 days.
**2.2 Masking**: PII is masked on the fly in the UI (e.g., `user@email.com` -> `u***@email.com`) unless the user has 'DPO' role.

## 3. Audit Logging
**3.1 SIEM**: All logs are shipped to Splunk. Alerts are configured for 'Mass Export' attempts and 'Admin Privilege Escalation'.

