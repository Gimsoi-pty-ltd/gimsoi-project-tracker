# Common Data Leak Scenarios & Mitigations

This document outlines high-risk scenarios specific to our Firebase/Node/React stack and the required mitigations.

## Scenario 1: The "Verbose Logger"
**Risk:** A developer attempts to debug an API failure by printing the entire `req.body` to the logs.
**Impact:** A user's password or an API key sent in the payload is recorded in plain text in our logging system (e.g., Datadog, CloudWatch).
**Mitigation:**
* **Code:** Use a logging middleware that automatically redacts specific keys (`password`, `token`, `authorization`) before outputting.
* **Linting:** Enable `no-console` rules in ESLint for production builds.

## Scenario 2: The "Git Mistake"
**Risk:** A developer accidentally commits a `.env` file or `serviceAccountKey.json` to the repository.
**Impact:** Attackers scrape GitHub for keys and gain immediate admin access to our infrastructure.
**Mitigation:**
* **CI Pipeline:** Our `security` job runs `gitleaks` on every PR to block high-entropy strings.
* **Pre-Commit:** Developers should use Husky to run local scans before committing.

## Scenario 3: The Frontend "Over-Fetch"
**Risk:** The backend API returns a full `User` object (including email, phone, and internal flags) to the React frontend, even though the UI only displays the user's Name.
**Impact:** A malicious user can inspect the Network tab in DevTools and scrape emails or sensitive metadata hidden from the UI.
**Mitigation:**
* **DTOs:** Backend must return "Response DTOs" (Data Transfer Objects) that whitelist only the fields the UI actually needs.
* **Never Trust the Client:** Do not rely on React to hide data; the API must not send it in the first place.

## Scenario 4: Firebase Config Confusion
**Risk:** A developer imports the *Admin* SDK credentials into the *Client* React app codebase.
**Impact:** The Admin key is bundled into the frontend JavaScript, giving any visitor full read/write access to the database.
**Mitigation:**
* **Architecture:** Strictly separate `firebase-admin` (Node.js only) and `firebase` (React only) dependencies.
* **Scanner Rules:** `gitleaks` is configured to block any "private key" patterns, while allowing the public "API Key" patterns in specific frontend config files (`firebase-config.js`).
