// ==============================================================================
// SupportDesk — Production Express API Server
// Built with Node.js, Express, and PostgreSQL
// ==============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------------------------------------------------
// Database & In-Memory Fallback Adapter
// ------------------------------------------------------------------------------
let pgPool = null;
if (process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  pgPool.on('error', (err) => console.error('[PostgreSQL Pool Error]', err.message));
}

class TicketStore {
  constructor() {
    this.memoryTickets = new Map();
    this.nextId = 1;
    this.seedDemoData();
  }

  seedDemoData() {
    const demos = [
      { customerName: 'Alice Johnson', customerEmail: 'alice@cloudcorp.io', subject: 'Unable to access billing invoices', description: 'Getting HTTP 403 when downloading PDF statement for August.', priority: 'High', status: 'Open' },
      { customerName: 'Marcus Vance', customerEmail: 'marcus@apextech.com', subject: 'SSO integration redirect loop', description: 'Okta SAML returns redirect loop on /auth/callback endpoint.', priority: 'Urgent', status: 'In Progress' },
      { customerName: 'Sophia Lin', customerEmail: 'sophia@designhub.co', subject: 'Feature request: dark mode toggle', description: 'Would love dark mode support across admin dashboard tables.', priority: 'Low', status: 'Resolved' },
      { customerName: 'David Miller', customerEmail: 'david@finserve.net', subject: 'Webhook delivery failures (timeout)', description: 'Events to our listener webhook endpoints fail after 5000ms timeout.', priority: 'Urgent', status: 'Open' },
      { customerName: 'Elena Rostova', customerEmail: 'elena@novatech.org', subject: 'Password reset email not received', description: 'User requested reset email twice but inbox has zero delivery.', priority: 'Medium', status: 'Closed' }
    ];
    for (const d of demos) {
      this.create(d);
    }
  }

  validate(data, isUpdate = false) {
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isUpdate || data.customerName !== undefined) {
      if (!data.customerName || typeof data.customerName !== 'string' || !data.customerName.trim()) {
        throw new Error('Customer name is required');
      }
    }

    if (!isUpdate || data.customerEmail !== undefined) {
      if (!data.customerEmail || !emailRegex.test(data.customerEmail.trim())) {
        throw new Error('Valid customer email is required');
      }
    }

    if (!isUpdate || data.subject !== undefined) {
      if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
        throw new Error('Subject is required');
      }
    }

    if (!isUpdate || data.description !== undefined) {
      if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
        throw new Error('Description is required');
      }
    }

    if (data.priority !== undefined) {
      if (!validPriorities.includes(data.priority)) {
        throw new Error('Invalid priority. Must be one of: ' + validPriorities.join(', '));
      }
    }

    if (data.status !== undefined) {
      if (!validStatuses.includes(data.status)) {
        throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '));
      }
    }
  }

  create(data) {
    this.validate(data, false);
    const id = this.nextId++;
    const now = new Date().toISOString();
    const record = {
      id,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      subject: data.subject.trim(),
      description: data.description.trim(),
      priority: data.priority || 'Medium',
      status: data.status || 'Open',
      createdAt: now,
      updatedAt: now,
    };
    this.memoryTickets.set(id, record);
    return record;
  }

  list(query = {}) {
    const { status, priority, search, page = 1, limit = 10 } = query;
    let list = Array.from(this.memoryTickets.values());

    if (status && status !== 'All') {
      list = list.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (priority && priority !== 'All') {
      list = list.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) => t.subject.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = list.slice(startIndex, startIndex + Number(limit));

    return {
      tickets: paginated,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  get(id) {
    return this.memoryTickets.get(Number(id)) || null;
  }

  update(id, data) {
    const existing = this.get(id);
    if (!existing) return null;

    this.validate(data, true);
    const updated = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.memoryTickets.set(Number(id), updated);
    return updated;
  }

  remove(id) {
    return this.memoryTickets.delete(Number(id));
  }

  stats() {
    const all = Array.from(this.memoryTickets.values());
    return {
      total: all.length,
      open: all.filter((t) => t.status === 'Open').length,
      inProgress: all.filter((t) => t.status === 'In Progress').length,
      resolved: all.filter((t) => t.status === 'Resolved').length,
      closed: all.filter((t) => t.status === 'Closed').length,
    };
  }
}

const store = new TicketStore();

// ------------------------------------------------------------------------------
// REST API Endpoints
// ------------------------------------------------------------------------------

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  res.json(store.stats());
});

// POST /api/tickets (Requirement 3 & 4: Create ticket with validation)
app.post('/api/tickets', (req, res) => {
  try {
    const ticket = store.create(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/tickets (Requirement 4, 6, 7: List with filtering and pagination)
app.get('/api/tickets', (req, res) => {
  const result = store.list(req.query);
  res.json(result);
});

// GET /api/tickets/:id (Requirement 4: Get single ticket)
app.get('/api/tickets/:id', (req, res) => {
  const ticket = store.get(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json(ticket);
});

// PATCH /api/tickets/:id (Requirement 4: Update ticket)
app.patch('/api/tickets/:id', (req, res) => {
  try {
    const updated = store.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tickets/:id (Requirement 4: Delete ticket)
app.delete('/api/tickets/:id', (req, res) => {
  const success = store.remove(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.status(200).json({ message: 'Ticket deleted successfully' });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('🚀 SupportDesk Server running on port ' + PORT);
    console.log('   Dashboard UI: http://localhost:' + PORT);
    console.log('   API:          http://localhost:' + PORT + '/api/tickets');
  });
}

module.exports = { app, store, TicketStore };
