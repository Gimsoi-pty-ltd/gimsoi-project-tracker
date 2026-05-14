# Gimsoi Project Tracker — Team PRD

**What we're building. Why it matters. What your team needs to do.**

---

## The One-Sentence Version

We're building an internal tool that helps our teams deliver projects better — and automatically gives clients real-time visibility into that work, without asking them to install or learn anything new.

---

## The Problem We're Solving

Most clients resist new tools. They don't want to sign up for software, attend training, or change how they work. So we're not asking them to.

Instead, we build the tool for **ourselves first**. Our teams use it to track projects, tasks, and sprints. Clients get a read-only window into that work — clean dashboards and downloadable reports — without touching any of our internal systems.

**The result:** Clients trust us more. We deliver better. Everyone wins.

---

## Who Uses This Tool

| Role | Who They Are | What They Can Do |
|---|---|---|
| **Admin** | Leadership | Full access — manage users, settings, all data |
| **PM** | Project Managers | Run projects, assign tasks, view reports |
| **Intern** | Team contributors | Update their own tasks, track their work |
| **Client** | Our clients | View progress dashboards and download reports — read-only |

---

## What We're Building (By Team)

### Product & Programme Management
**Your job:** Define what gets built, in what order, and whether it works.
- Write user stories and acceptance criteria for each sprint
- Define sprint goals and success metrics (task completion, velocity, contributions)
- Approve completed features before they ship
- Run sprint demos and hold teams accountable

**Why it matters for clients:** Structured scope means accurate progress. Accurate progress builds client trust.

---

### Backend Engineering
**Your job:** Build the engine — APIs, database, authentication, and business logic.
- Build secure login with role-based access (clients can only see what they're supposed to)
- Create APIs for projects, tasks, sprints, phases, and reports
- Log all activity for audit trails
- Keep client data isolated from internal operations

**Why it matters for clients:** Everything the client sees comes from your APIs. If the data is wrong, the trust breaks.

---

### Frontend Engineering
**Your job:** Build what people actually see and use.
- Build login flows and role-based dashboards (different views for PMs, interns, and clients)
- Display Kanban boards for task management
- Build clean, read-only dashboards for clients
- Handle errors gracefully — no blank screens or confusing messages

**Why it matters for clients:** This is what the client literally sees. It needs to look professional and just work.

---

### UX & Data / Analytics
**Your job:** Make it easy to use and extract insight from the data.
- Design wireframes for all dashboards (internal and client-facing)
- Define the key metrics: task completion rate, sprint velocity, contributor activity
- Build reports that PMs and clients can actually read

**Why it matters for clients:** A confusing dashboard is worse than no dashboard. Clear design = client confidence.

---

### QA
**Your job:** Make sure nothing is broken before it reaches a client.
- Test every feature: login, task creation, project management, dashboards
- Verify that clients can only see what they're supposed to
- Run regression tests after every sprint

**Why it matters for clients:** One broken dashboard seen by a client undoes weeks of trust-building.

---

### DevOps & Security
**Your job:** Make the system stable, secure, and always available.
- Set up Git repositories, CI/CD pipelines, and staging environments
- Secure all environment variables and API keys
- Monitor performance and conduct access audits
- Deploy to production

**Why it matters for clients:** If the system is down when a client checks their dashboard, we look unprofessional.

---

## The 12-Week Plan (6 Sprints)

### Sprint 0 — Weeks 1–2: Set Up Everything
**Goal:** Get the foundations in place so everyone can build.

| Team | What to Do |
|---|---|
| Product | Define MVP scope, write user stories, create backlog |
| Backend | Design architecture and database schema |
| Frontend | Set up framework, routing, basic layout |
| UX/Data | Wireframes for dashboards; define key metrics |
| QA | Write test strategy and set up bug tracking |
| DevOps | Git repos, CI/CD, dev and staging environments |

---

### Sprint 1 — Weeks 3–4: Login & User Access
**Goal:** Secure login that gives each role the right view.

| Team | What to Do |
|---|---|
| Product | Approve auth flows and role-access stories |
| Backend | Build login/logout, RBAC, and audit logging |
| Frontend | Build login pages and role-based dashboards |
| QA | Test auth flows and access control |
| DevOps | Secure environment variables and review permissions |

---

### Sprint 2 — Weeks 5–6: Clients, Projects & Sprints
**Goal:** PMs can create and manage clients, projects, and sprints.

| Team | What to Do |
|---|---|
| Product | Validate project and sprint workflow stories |
| Backend | APIs for clients, projects, and sprints; enforce lifecycle rules |
| Frontend | UI for managing clients, projects, and sprint lists |
| Database | Run schema migrations, enforce data relationships |
| QA | Full CRUD testing and regression |

---

### Sprint 3 — Weeks 7–8: Tasks & Kanban Board
**Goal:** Teams can create, assign, and track tasks on a Kanban board.

| Team | What to Do |
|---|---|
| Product | Approve task lifecycle and prioritisation rules |
| Backend | Task APIs: create, assign, comment, track effort |
| Frontend | Kanban board with drag-and-drop, task detail views |
| QA | Task flow and usability testing |
| Data | Capture task-level metrics for reports |

---

### Sprint 4 — Weeks 9–10: Client Dashboard, Reports & Security
**Goal:** Clients can view dashboards and download reports. System is secured.

| Team | What to Do |
|---|---|
| Product | Approve the client read-only experience and reports |
| Backend | Client-facing APIs, data isolation, reporting endpoints |
| Frontend | Client dashboard UI, progress charts, report downloads |
| Data Analytics | Sprint velocity and contribution metrics |
| DevOps/Security | Security hardening, access audits, performance testing |
| QA | Full security and performance testing |

---

### Sprint 5 — Weeks 11–12: Polish, Docs & Demo
**Goal:** MVP is stable, documented, and ready to demo internally and to clients.

| Team | What to Do |
|---|---|
| Product | Final acceptance testing; write demo script; plan Phase 2 |
| Backend | Bug fixes, refactoring, performance improvements |
| Frontend | UI polish and mobile responsiveness |
| QA | Full regression test and release sign-off |
| DevOps | Production deployment and monitoring setup |
| Documentation | User guides and intern contribution summaries |

---

## Tools We're Using

| Category | Tool | Cost |
|---|---|---|
| Project tracking | Gimsoi (this tool 🙂), Trello | Free |
| Docs & planning | Notion, Google Docs | Free |
| Backend | Node.js, PostgreSQL, Supabase | Free tier |
| Frontend | React.js, Tailwind CSS | Free |
| Hosting | Vercel | Free tier |
| CI/CD | GitHub Actions | Free |
| Auth | JWT + cookies (built in) | Free |
| Wireframes | Figma | Free |
| Analytics/Reports | Google Data Studio, Google Sheets | Free |
| Bug tracking | GitHub Issues | Free |

---

## What "Done" Looks Like for Each Sprint

A feature is **done** when:
- [ ] It works with real data — not test data
- [ ] The right roles can access it; the wrong roles cannot
- [ ] QA has signed off
- [ ] There are no console errors or broken screens
- [ ] A PM or lead has demo'd it to the team

---

## Accountability — How This Works in Practice

- Every team member is assigned sprint tasks in the tracker
- Every sprint: at least one demo contribution per person
- PRs and deliverables must be linked to tasks in the project tracker
- Teams meet weekly to coordinate dependencies
- At every sprint demo: explain what you built **and** why it matters for clients

---

## The Bigger Picture

Right now, we're building this for ourselves. But the value it creates for clients is what makes it powerful.

When a client opens their dashboard and sees exactly where their project stands — without emailing anyone, without chasing updates, without installing software — that is the moment we've built something worth having.

Every task you complete, every API you ship, every dashboard you design is a step toward that moment.

**Build it like a client is watching. Because soon, they will be.**
