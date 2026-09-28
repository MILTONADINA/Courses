# Feature Specifications

Spec-driven development (SDD) source of truth for **this** application.  
No application code may be written unless it maps to a requirement in one of these files.

**Methodology:** [framework.md](./framework.md) — how to write, trace, and ship feature specs.  
**Student guide (requirements):** [writing-feature-requirements.md](./writing-feature-requirements.md) — stories, FRs, initial data model, Gherkin AC.  
**Student guide (design):** [writing-feature-design.md](./writing-feature-design.md) — ownership, API, screens, test map, DoD, out of scope.  
**Student guide (living reference):** [reference/writing-living-reference.md](./reference/writing-living-reference.md) — update api / data-model / behavior in the same PR.

*(Examples in the writing guides often cite the OC CS Speckit Todo sample app — use them as patterns for your product.)*

**Sprints** live in your agile tool — they are **not** part of these specs.

## Feature catalog

| ID | Feature | File | Branch | Depends on | Author |
|----|---------|------|--------|------------|--------|
| 1 | User Authentication & Authorization | [feature-1-user-authentication.md](./feature-1-user-authentication.md) | `feature/1-user-authentication` | — | Milton |
| 2 | Semester Management | *not yet written* | `feature/2-semester-management` | 1 | Landry |
| 3 | Course Management | *not yet written* | `feature/3-course-management` | 1 | Landry |
| 4 | Faculty Management | *not yet written* | `feature/4-faculty-management` | 1 | Morgan |
| 5 | Section Management | *not yet written* | `feature/5-section-management` | 2, 3, 4 | Morgan |
| 6 | Enrollment Management | *not yet written* | `feature/6-enrollment-management` | 5 | Milton |
| 7 | Student Course Listing | *not yet written* | `feature/7-student-course-listing` | 6 | Landry |
| 8 | Section Student Listing | *not yet written* | `feature/8-section-student-listing` | 6 | Morgan |
| 9 | Student Management | *not yet written* | `feature/9-student-management` | 1 | Landry |

When you write a spec, replace *not yet written* with a link to your `feature-N-short-name.md` in the same PR.

New features: follow [framework.md](./framework.md#feature-spec-template) — **Status**, **Input**, **FR-00N**, **SC-00N**, **Key Entities**, Gherkin, **Agent implementation request**, **Definition of Done**.

**Branch roles:** `main` = scaffold-only starter kit · `dev` = integration · `feature/N-*` = feature work (branch from `dev`).

## Living reference

Keep snapshots in sync when schema, API, or product rules change — **in the same PR as implementation** (required DoD; see [Merge checklist + Agility sync](./framework.md#merge-checklist--agility-sync)). Each `feature-N-*.md` includes an **Agent implementation request** block so Cursor updates reference during implementation ([framework.md](./framework.md#agent-implementation-request)). Spec evolution after merge: [prefer a new feature delta](./framework.md#spec-evolution-after-merge).

| File | Purpose |
|------|---------|
| [reference/README.md](./reference/README.md) | How to maintain reference docs |
| [reference/writing-living-reference.md](./reference/writing-living-reference.md) | Student guide — writing/updating living reference |
| [reference/data-model.md](./reference/data-model.md) | Current database tables (update in feature PR when schema changes) |
| [reference/api.md](./reference/api.md) | Current REST API (update in feature PR when API changes) |
| [reference/behavior.md](./reference/behavior.md) | Current product rules (update in feature PR when rules change) |

## Related

- Cursor rules: `.cursor/rules/`
- ADRs: `docs/adr/`
- Quality attributes (NFRs): `docs/nfr/`
- Starter kit notes: `docs/STARTER-KIT.md`
