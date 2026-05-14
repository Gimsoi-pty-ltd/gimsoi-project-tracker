# PRD Template

> **Instructions for agent:** Fill in every section. Do not leave any section blank.
> Do not add new sections. Save completed file as `docs/prd-<feature-name>.md`.

---

# PRD: {{FEATURE_NAME}}

**Date:** {{YYYY-MM-DD}}
**Author:** Antigravity Agent (feature-cycle Step 1)
**Status:** Draft

---

## Feature Summary

{{One paragraph. Describe what this feature does, who it's for, and why it exists.
Be specific to Gimsoi Project Tracker. Do not write a generic description.}}

---

## User Story

As a {{ROLE — e.g. "project manager" | "team member" | "client" | "admin"}},
I want {{ACTION — specific action the user takes}},
so that {{OUTCOME — business or workflow value delivered}}.

---

## Requirements

{{Number each requirement. One observable behaviour per requirement.
Do not bundle multiple behaviours. Do not reference implementation details.}}

1. {{REQ_1}}
2. {{REQ_2}}
3. {{REQ_3}}
4. {{REQ_4}}
5. {{REQ_5 — add or remove as needed}}

---

## Acceptance Criteria

{{Each criterion must be directly testable via an HTTP request and expected response.
Map each criterion to a specific endpoint and status code.}}

- [ ] AC1: `{{METHOD}} /api/{{path}}` with `{{input description}}` returns `{{status code}}` and `{{response shape}}`
- [ ] AC2: `{{METHOD}} /api/{{path}}` when `{{condition}}` returns `{{status code}}`
- [ ] AC3: `{{METHOD}} /api/{{path}}` by an unauthenticated user returns `401`
- [ ] AC4: `{{METHOD}} /api/{{path}}` by a user without `{{role}}` permission returns `403`
- [ ] AC5: `{{METHOD}} /api/{{path}}` with missing required field returns `400`
- [ ] AC6: {{add or remove criteria as needed}}

---

## Out of Scope

{{Explicitly name things that might be assumed to be included but are not.
Minimum 2 entries.}}

- {{OUT_OF_SCOPE_1 — e.g. "Frontend implementation — this PRD covers API only"}}
- {{OUT_OF_SCOPE_2 — e.g. "Email notifications for this event — tracked in separate PRD"}}
- {{OUT_OF_SCOPE_3 — add as needed}}

---

## Open Questions

{{List any unresolved questions that could affect implementation. If none, write "None."}}

- [ ] {{QUESTION_1}}
- [ ] {{QUESTION_2 — add or remove as needed}}
