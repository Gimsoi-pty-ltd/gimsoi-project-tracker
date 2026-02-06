# Client Data Definition & Classification Policy

## 1. Purpose
This document defines "Client Data" for the Project Tracker application. All engineering and DevOps activities must adhere to these classifications to ensure data privacy and security (GDPR/POPIA compliance).

## 2. Data Classification Levels

We categorize data into three levels: **Public**, **Internal**, and **Restricted**.

### Level 1: Public
Information intended for public consumption.
* **Examples:** Marketing landing pages, Public API documentation, Status pages.
* **Risk:** Low (Reputational damage if defaced).

### Level 2: Internal (Business Confidential)
Information that is proprietary to the platform or the customer's workflow but is not sensitive PII.
* **Examples:**
    * Ticket IDs, Statuses (Todo, In Progress), and Priorities.
    * Project names and workflow configurations.
    * Aggregated analytics (e.g., "Team Velocity").
* **Requirement:** Access control (Authenticated users only).

### Level 3: Restricted (High Sensitivity / PII)
Data that, if leaked, causes significant harm, legal liability, or security breaches.
* **Examples:**
    * **PII:** Names, Email addresses, Phone numbers, Profile photos.
    * **Auth Data:** Password hashes, Session tokens, MFA secrets.
    * **User Content:** Ticket descriptions, Comments, and Attachments (these often contain screenshots of code, secrets, or internal logic).
    * **Integration Secrets:** Third-party tokens (e.g., GitHub PATs, Slack Webhooks) stored by customers to enable integrations.
* **Requirement:**
    * Encryption at rest (Database & Storage).
    * Encryption in transit (TLS 1.2+).
    * **NEVER** logged to console or monitoring tools.
    * **NEVER** stored in local storage/cookies (except session tokens).

## 3. Handling Matrix

| Action | Level 1 (Public) | Level 2 (Internal) | Level 3 (Restricted) |
| :--- | :--- | :--- | :--- |
| **Storage** | CDN / Standard DB | Standard DB | Encrypted DB / Vault |
| **Logging** | Allowed | Allowed | **MASK / REDACT** |
| **Dev Access**| Read-only | Read-only | Sanitized/Anonymized |
