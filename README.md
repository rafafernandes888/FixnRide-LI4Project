# Fix'n'Ride

> Full-stack web platform for an electric scooter repair workshop, built with React, ASP.NET Core, Node.js and MongoDB, containerised with Docker.

Academic project developed for **Laboratórios de Informática IV** · University of Minho · 2026

---

## Overview

Fix'n'Ride is an integrated management platform built for **MobiFix**, an electric micromobility repair workshop that was running its entire operation on paper and spreadsheets. The system digitalises the full workshop lifecycle — from online appointment booking to invoice generation — across four distinct user portals.

---

## Architecture

The system follows a **Multi-Tier Architecture** with four independent Docker services communicating in a strict unidirectional hierarchy:

```
Frontend (React) → Logic Server (.NET) → Data API (Node.js) → MongoDB
```

| Service | Technology | Role |
|---|---|---|
| `frontend` | React + TanStack Query + Tailwind CSS | Four role-specific SPAs |
| `ln` | ASP.NET Core (.NET 8) | Business logic, authentication, orchestration |
| `data-api` | Node.js + Express + Mongoose | CRUD operations over MongoDB |
| `mongodb` | MongoDB | Document persistence |

**Key architectural decisions:**
- The two backends are deliberately separated: the `.NET` server handles complex operations (JWT authentication, BCrypt, invoicing, domain rules); the Data API handles simple CRUD only.
- The Data API and MongoDB are not exposed to the internet — they operate exclusively on the internal Docker network.
- Communication between the Logic Server and the Data API is authenticated with a shared `INTERNAL_API_KEY`.
- Both backends follow the **MVC pattern**, with DTOs as data contracts between layers.

---

## User Portals

| Portal | Path | Profile |
|---|---|---|
| FixNRide | `/FixNRide` | Customer — booking, tracking, part orders |
| FixNRepair | `/FixNRepair` | Mechanic — diagnostics, repair execution |
| FixNSell | `/FixNSell` | Operator — invoicing, stock, deliveries |
| FixNManage | `/FixNManage` | Administrator — KPIs, staff, approvals |

Access to each portal is enforced by **RBAC** (Role-Based Access Control) via JWT claims decoded at the routing layer.

---

## Core Features

- **Repair lifecycle** — online booking, diagnosis with fixed-price catalogue, repair execution with EAN part tracking, atomic invoice generation on vehicle collection
- **Intelligent stock management** — automatic reorder proposals when parts reach minimum threshold, approval flow, stock update on reception
- **Sales** — direct counter sales and Click & Collect for online part reservations, with automatic invoicing and credit note support
- **Financial dashboard** — real-time KPIs on revenue, repair margins and stock value for the administrator

---

## Data Model

MongoDB was chosen because the domain is naturally hierarchical — a Service document embeds its intervention history, and each intervention embeds the parts used. This avoids the multi-table JOINs a relational schema would require for every service read.

**Modelling strategy:**
- **Embedding** for data with no autonomous existence (invoices embed their returns; services embed their intervention history)
- **Referencing** for entities with independent lifecycle (scooters reference customers by NIF)

Mongoose adds declarative validation, enums and typed references on top of MongoDB's flexibility.

---

## Testing & Validation

| Type | Scope | Tool |
|---|---|---|
| Integration | All Data API endpoints (24 test cases) | Postman |
| Stress | 5 / 20 / 50 concurrent users | Postman Performance |
| System | Full flow per user profile | Manual |
| Acceptance | All 22 functional requirements | Manual simulation |
| Quality | ISO/IEC 25010 product quality model | Qualitative assessment |

**Stress test results:** at 50 concurrent users, P50 < 39 ms and P99 < 76 ms — well within the 2-second non-functional requirement.

---

## AI-Assisted Development

Claude Sonnet 4.6 (via Claude Code in VS Code) was used throughout all development phases under a structured workflow:

- Work was split into **isolated sessions** — per layer, per functional module, per bug fix
- Each module session began with a **system brief**: a structured prompt containing the architecture context, relevant schemas/DTOs, available endpoints, business rules and explicit constraints
- This kept the model specialised and coherent within each session without relying on cross-session memory

**What AI accelerated:** repetitive CRUD code, Mongoose schemas, React components, documentation drafting.

**What remained exclusively human:** requirements elicitation, all UML diagrams (domain model, use cases, sequence, state machines), architectural decisions, and all code review.

---

## Running Locally

```bash
git clone https://github.com/<your-org>/fixnride.git
cd fixnride
cp .env.example .env   # fill in your secrets
docker compose up --build
```

The application will be available at `http://localhost:3000`.

---

## Team

| Name | Student ID |
|---|---|
| Diogo Esteves | A104004 |
| Diogo Fernandes | A104260 |
| Jorge Fernandes | A104168 |
| Rodrigo Fernandes | A104175 |

---

*University of Minho · 2025/2026*
