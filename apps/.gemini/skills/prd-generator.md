# PRD Generator Skill

**Activates:** When a new feature is being defined (Step 1 of feature-cycle.md)
**Input:** Feature description from `/feature <description>`
**Output:** A PRD file at `docs/prd-<feature-name>.md`

---

## Instructions

1. Derive a `<feature-name>` slug from the description: lowercase, hyphen-separated,
   no special characters. Example: "Add task priority field" → `task-priority-field`.

2. Fill in the PRD template from `templates/prd-template.md` with real, specific content.

3. Requirements must be atomic — one observable behaviour per requirement.
   Do not write requirements that bundle multiple behaviours.

4. Acceptance criteria must be directly testable by `npm run test:api` —
   each criterion maps to a specific HTTP request and expected response.

5. The out-of-scope section must explicitly name things that might be assumed
   to be included but are not — prevent scope creep before it starts.

6. Save the completed PRD to `docs/prd-<feature-name>.md`.

7. Display the full PRD to the user. Wait for acknowledgement before signalling
   completion to the feature cycle.

---

## Feature Name Derivation Rules

| Input | Slug |
|---|---|
| "Add task priority field" | `task-priority-field` |
| "Project search by name" | `project-search-by-name` |
| "Sprint velocity reporting" | `sprint-velocity-reporting` |
| "Client invitation email" | `client-invitation-email` |

---

## Quality Gates

Before saving the PRD, verify:
- [ ] Every requirement is numbered and atomic
- [ ] Every acceptance criterion maps to a testable HTTP interaction
- [ ] The out-of-scope section has at least 2 entries
- [ ] No requirement references a specific implementation (no "use Prisma upsert" in PRD)
- [ ] The user story follows the format: "As a [role], I want [action], so that [outcome]"
