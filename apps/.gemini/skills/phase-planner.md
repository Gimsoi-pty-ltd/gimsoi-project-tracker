# Phase Planner Skill

**Activates:** After complexity classification (Step 4 of feature-cycle.md)
**Input:** Fit analysis output + classification label
**Output:** Minimum viable phase plan — N phase entries following `phase-plan-template.md`

---

## Planning Rules

### Minimum Viable Phases
Derive the number of phases from the fit analysis output — not from a template or a fixed count.
Ask: what is the minimum number of `npm run test:api` gates needed to ship this feature safely?

### Schema Phase Isolation (Mandatory)
If Axis 1 (schema impact) is YES or MAYBE:
- The schema change and `prisma generate` must be their own isolated phase (Phase 1 or Phase N, not mixed with logic changes)
- No business logic changes in the schema phase
- No schema changes in any logic phase

### Phase Sizing Rule
Each phase must touch the **minimum** set of files needed to pass `npm run test:api` at the end of that phase.
If adding an entire feature in one phase would cause a test to fail mid-phase with no way to pass until the end,
split it. The gate must be passable at the end of each phase — not just the final phase.

### Rollback Instruction (Mandatory)
Every phase entry must include a rollback instruction — a specific command or file revert action
that undoes the phase without affecting other phases.

For schema phases: `npx prisma migrate reset --skip-seed` or `git checkout prisma/schema.prisma && npx prisma generate`
For code phases: `git checkout <file1> <file2> ...`

### Layer Discipline in Phases
Do not mix service-layer changes and controller-layer changes in the same phase
unless the feature is S-classified and they are tightly coupled.
For M and L features, separate layers into separate phases.

---

## Phase Ordering Convention

For features requiring schema changes:
1. Schema phase (isolated)
2. Service phase (queries + business logic)
3. Controller phase (response shaping)
4. Route + validation phase (wiring + Zod schema)
5. Test phase (new test file if needed)

For features without schema changes:
1. Service phase
2. Controller + route phase (can be combined for S features)
3. Test phase (if new test coverage is needed)

---

## Output Format

For each phase, fill in `templates/phase-plan-template.md` exactly.
Number phases sequentially starting at 1.
Display all phases before execution begins.

---

## Quality Gate Before Handing Off to Feature Cycle

Before signalling phase planning complete, verify:
- [ ] Every phase has an explicit rollback instruction
- [ ] Schema changes are isolated (if applicable)
- [ ] Each phase's files list is complete — no "and related files" vagueness
- [ ] The expected `npm run test:api` outcome per phase is specific (which tests are expected to pass/not regress)
- [ ] No phase mixes Prisma client usage with controller-layer code
