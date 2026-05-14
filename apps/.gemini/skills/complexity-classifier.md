# Complexity Classifier Skill

**Activates:** After fit analysis (Step 3 of feature-cycle.md)
**Input:** Fit analysis output (5-axis results + affected files list)
**Output:** Classification label (S/M/L) + model switch recommendation block (if L) + rationale paragraph

---

## Classification Rules

Apply these rules in order. The first rule that matches wins.

### L (Large) — if ANY of these are true:
- Schema change (Axis 1: YES) AND new dependency (Axis 3: YES)
- More than 8 files in the affected files list
- More than 2 architectural layers are touched

### M (Medium) — if ANY of these are true (and not already classified L):
- Schema change possible (Axis 1: MAYBE or YES)
- New dependency required (Axis 3: MAYBE or YES)
- 4 to 8 files in the affected files list
- Exactly 2 architectural layers are touched

### S (Small) — all of the following must be true:
- No schema change (Axis 1: NO)
- No new dependencies (Axis 3: NO)
- 3 or fewer files in the affected files list
- Single architectural layer touched

---

## Output Format

```
## Complexity Classification

**Label:** [S | M | L]
**Affected files:** [count]
**Layers touched:** [list]
**Schema change:** [YES | NO | MAYBE]
**New deps:** [YES | NO | MAYBE]

**Rationale:**
[One paragraph — explain which specific axes drove the classification, reference
the actual files and layers involved. Do not write a generic paragraph.
Example: "Classified L because the feature requires adding a `priority` field to
the Task model in schema.prisma (Axis 1: YES) and integrating a new sorting
library (Axis 3: YES). The change touches the service layer (task.service.js),
controller layer (task.controller.js), and route layer (task.route.js) — 3 layers."]
```

---

## Model Switch Prompt (L only)

If classification is L, append this block immediately after the rationale and
WAIT for user response before allowing Step 4 to begin:

```
⚡ MODEL SWITCH RECOMMENDED
Current: Flash
Recommended: Pro
Reason: Large-complexity feature — phase planning requires cross-file reasoning across [N] layers
Token cost: High
To continue on Flash anyway, type: "Flash continue"
To switch to Pro, change the model in Antigravity and type: "Pro ready"
```

Do not proceed to phase planning until the user types exactly "Flash continue" or "Pro ready".

If classification is S or M, proceed directly to Step 4 with no prompt.

---

## Classification Reference Table

| Condition | S | M | L |
|---|---|---|---|
| Schema change | NO | MAYBE or YES | YES (with new dep) |
| New dependency | NO | MAYBE or YES | YES (with schema change) |
| Files affected | ≤3 | 4–8 | >8 |
| Layers | 1 | 2 | >2 |
| Layers (override) | — | — | >8 files OR >2 layers alone |
