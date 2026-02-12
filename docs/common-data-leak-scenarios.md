# Common Data Leak Scenarios

## Purpose
This document describes **realistic and common ways client data and secrets can leak**
during development, CI, and code review.

It is used to:
- Inform threat modeling
- Guide CI enforcement decisions
- Educate developers during onboarding

---

## Relationship to Security Controls

Each scenario described here maps to one or more controls defined in the
[Security Baseline](./SECURITY_BASELINE.md).

Not all risks can be fully mitigated by CI; some require policy and human review.

---

## 1. Secrets Already Stored in Code Repositories

### Scenario
Teams have existing repositories where:
- Secrets were committed historically
- `.env` files were used locally
- Credentials were hardcoded temporarily

### Risk
- Secrets are reintroduced during merge
- Old credentials are reused unknowingly

### Can CI Catch This?
Yes:
- Secret scanning
- File-type blocking
- PR scanning

Limit:
- CI may not detect secrets removed but still present in history without explicit scans

---

## 2. Unsafe Configuration Patterns

### Scenario
Teams use:
- Hardcoded API URLs
- Config files with real values
- Frontend environment variables for sensitive data

### Risk
- Internal endpoints exposed
- Secrets bundled into frontend artifacts
- Production values used unintentionally

### Can CI Catch This?
Partially:
- Pattern-based scanning
- File blocking

Limit:
- CI cannot determine business sensitivity without context

---

## 3. Frontend Configuration Leaks (React)

### Scenario
React applications use:
- `process.env.REACT_APP_*` variables
- Console logging during development

### Risk
- Secrets exposed in browser bundles
- Configuration visible to all users

### Can CI Catch This?
Partially:
- Detection of `.env` files
- Pattern-based secret scanning

Limit:
- CI cannot determine intended public vs private values

---

## 4. Logging Sensitive Data

### Scenario
Developers log:
- Full configuration objects
- API responses
- Error objects with request context

### Risk
- Client data appears in CI logs or shared log systems

### Can CI Catch This?
Mostly no:
- Logging intent is contextual
- Static analysis is limited

Mitigation:
- Logging rules
- Code review
- Developer education

---

## 5. CI Artifacts & Build Output

### Scenario
CI produces:
- Build artifacts
- Source maps
- Debug output

### Risk
- Secrets or internal URLs embedded in artifacts
- Artifacts retained longer than intended

### Can CI Catch This?
Partially:
- File exclusions
- Artifact checks

Limit:
- CI cannot safely inspect all compiled output

---

## 6. Test Data Using Real Client Information

### Scenario
Teams copy:
- Real API responses
- Production payloads
- Customer examples

### Risk
- Client data committed permanently
- Compliance violations

### Can CI Catch This?
No:
- CI cannot distinguish real from fake data

Mitigation:
- Policy enforcement
- Review discipline
- Explicit fake-data requirements

---

## Summary: What CI Can and Cannot Do

CI can:
- Block known secret patterns
- Enforce PR gates
- Prevent accidental merges

CI cannot:
- Understand business sensitivity
- Judge intent
- Replace human review

See the [Security Baseline](./SECURITY_BASELINE.md) for exact enforced controls.

---

## Final Principle

> CI is a guardrail, not a brain. Security requires enforcement and informed behavior.

---

## Ownership
This document is owned by the DevOps / Infrastructure team and updated as new leak patterns are identified.