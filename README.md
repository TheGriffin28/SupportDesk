# SupportDesk 🎫

> **A production-grade Customer Support Ticket Management System built with React, Node.js + Express, PostgreSQL, and Docker.**  
> Autonomous deliverables implemented and verified by **Nexora AI Office** (Atlas, Forge & Sentinel QA).

---

## ⚡ Features

- **Full Ticket Lifecycle**: Support tickets with `id`, `customerName`, `customerEmail`, `subject`, `description`, `priority`, `status`, `createdAt`, `updatedAt`.
- **4 Priority Levels**: `Low`, `Medium`, `High`, `Urgent`.
- **4 Status States**: `Open`, `In Progress`, `Resolved`, `Closed`.
- **Express REST API**: Clean RESTful architecture with JSON validation and standardized error handling.
- **Filtering & Search**: Live filtering by status, priority, and substring search across subject and customer name.
- **Server-side Pagination**: Dynamic pagination metadata (`page`, `limit`, `total`, `totalPages`).
- **Modern React Dashboard**: Sleek single-page interface with KPI metric cards, modal creation dialog, status pills, and detail drawer.
- **PostgreSQL Database & Schema**: Optimized schema with indexes and dual PostgreSQL / in-memory fallback.
- **Docker Ready**: Complete `Dockerfile` and `docker-compose.yml` for single-command deployment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Plus Jakarta Sans |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 16 (with `pg` connection pool) |
| **DevOps** | Docker, Docker Compose |
| **Testing** | Node.js Native Assert Suite (`test.js`) |

---

## 🚀 Quick Start

### 1. Local Development

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Start the application
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Run with Docker Compose

```bash
docker compose up --build
```

This spins up:
- PostgreSQL 16 on `localhost:5432`
- SupportDesk Application on [http://localhost:3000](http://localhost:3000)

---

## 📡 API Documentation

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets` | List tickets (supports `?status=`, `?priority=`, `?search=`, `?page=`, `?limit=`) |
| `POST` | `/api/tickets` | Create a new ticket (validates all required fields) |
| `GET` | `/api/tickets/:id` | Retrieve single ticket by ID |
| `PATCH` | `/api/tickets/:id` | Update ticket fields (status, priority, subject, etc.) |
| `DELETE` | `/api/tickets/:id` | Delete ticket by ID |
| `GET` | `/api/stats` | Returns KPI ticket metrics (total, open, inProgress, resolved, closed) |
| `GET` | `/health` | Service health check |

#### Example: Create Ticket (`POST /api/tickets`)

```json
{
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "subject": "Payment webhook timeout",
  "description": "Stripe webhook times out after 10s on invoice.payment_succeeded",
  "priority": "High",
  "status": "Open"
}
```

---

## 🧪 Automated Testing

Run the test suite:
```bash
npm test
```

```
✓ Requirement 5 (Validation rules) passed.
✓ Requirement 3 (Ticket Creation & Field Structure) passed.
✓ Requirement 7 (Pagination) passed (20 total, 5/page, 4 pages).
✓ Requirement 6a (Status filter) passed.
✓ Requirement 6b (Priority filter) passed.
✓ Requirement 6c (Search filter) passed.
✓ Requirement 4 (REST API CRUD endpoints) passed.
✓ KPI statistics calculation passed.
✓ ALL SUPPORTDESK TEST SUITES PASSED CLEANLY (exit code 0)
```

---

## 🛡️ QA Verification

- Verified by **Nexora Sentinel QA**
- Signed with SHA-256 integrity verification
