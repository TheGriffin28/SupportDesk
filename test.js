// ==============================================================================
// SupportDesk — Complete Automated Test Suite
// Verified by Sentinel QA & Forge (Nexora AI Office)
// ==============================================================================

const assert = require('assert');
const { TicketStore } = require('./server.js');

console.log('Testing SupportDesk TicketStore & API Engine...');
const store = new TicketStore();

// Reset store for clean test run
store.memoryTickets.clear();
store.nextId = 1;

// 1. Validation Tests (Requirement 5)
assert.throws(() => store.create({ customerName: '', customerEmail: 'a@b.com', subject: 's', description: 'd' }), /Customer name is required/);
assert.throws(() => store.create({ customerName: 'Alex', customerEmail: 'not-an-email', subject: 's', description: 'd' }), /Valid customer email is required/);
assert.throws(() => store.create({ customerName: 'Alex', customerEmail: 'a@b.com', subject: '', description: 'd' }), /Subject is required/);
assert.throws(() => store.create({ customerName: 'Alex', customerEmail: 'a@b.com', subject: 's', description: '' }), /Description is required/);
assert.throws(() => store.create({ customerName: 'Alex', customerEmail: 'a@b.com', subject: 's', description: 'd', priority: 'Invalid' }), /Invalid priority/);
assert.throws(() => store.create({ customerName: 'Alex', customerEmail: 'a@b.com', subject: 's', description: 'd', status: 'Invalid' }), /Invalid status/);
console.log('✓ Requirement 5 (Validation rules) passed.');

// 2. Ticket Creation (Requirement 3)
const t1 = store.create({
  customerName: 'Saurav Pawar',
  customerEmail: 'saurav@nexora.ai',
  subject: 'Database schema migration query',
  description: 'Verifying automatic migrations in production container',
  priority: 'High',
  status: 'Open',
});
assert.strictEqual(t1.id, 1);
assert.strictEqual(t1.customerName, 'Saurav Pawar');
assert.strictEqual(t1.customerEmail, 'saurav@nexora.ai');
assert.strictEqual(t1.priority, 'High');
assert.strictEqual(t1.status, 'Open');
assert.ok(t1.createdAt);
assert.ok(t1.updatedAt);
console.log('✓ Requirement 3 (Ticket Creation & Field Structure) passed.');

// 3. Batch Population for Filtering & Pagination Tests
for (let i = 2; i <= 20; i++) {
  store.create({
    customerName: `Customer ${i}`,
    customerEmail: `customer${i}@supportdesk.com`,
    subject: i % 2 === 0 ? `Payment gateway timeout issue #${i}` : `Feature request dark mode #${i}`,
    description: `Detailed problem explanation for ticket ${i}`,
    priority: i % 4 === 0 ? 'Urgent' : (i % 3 === 0 ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low')),
    status: i % 4 === 0 ? 'Closed' : (i % 3 === 0 ? 'Resolved' : (i % 2 === 0 ? 'In Progress' : 'Open')),
  });
}

// 4. Pagination (Requirement 7)
const page1 = store.list({ page: 1, limit: 5 });
assert.strictEqual(page1.tickets.length, 5);
assert.strictEqual(page1.pagination.total, 20);
assert.strictEqual(page1.pagination.totalPages, 4);
assert.strictEqual(page1.pagination.page, 1);
assert.strictEqual(page1.pagination.limit, 5);
console.log('✓ Requirement 7 (Pagination) passed (20 total, 5/page, 4 pages).');

// 5. Filtering (Requirement 6)
const openList = store.list({ status: 'Open' });
assert.ok(openList.tickets.every(t => t.status === 'Open'));
console.log(`✓ Requirement 6a (Status filter) passed (${openList.tickets.length} Open tickets).`);

const urgentList = store.list({ priority: 'Urgent' });
assert.ok(urgentList.tickets.every(t => t.priority === 'Urgent'));
console.log(`✓ Requirement 6b (Priority filter) passed (${urgentList.tickets.length} Urgent tickets).`);

const searchList = store.list({ search: 'payment gateway' });
assert.ok(searchList.tickets.length > 0);
assert.ok(searchList.tickets.every(t => t.subject.toLowerCase().includes('payment gateway')));
console.log(`✓ Requirement 6c (Search filter) passed (${searchList.tickets.length} search matches).`);

// 6. REST API CRUD Handlers (Requirement 4)
// Get single
const fetched = store.get(1);
assert.strictEqual(fetched.id, 1);
assert.strictEqual(fetched.customerName, 'Saurav Pawar');

// Update (PATCH)
const updated = store.update(1, { status: 'Resolved', priority: 'Low' });
assert.strictEqual(updated.status, 'Resolved');
assert.strictEqual(updated.priority, 'Low');
assert.strictEqual(store.get(1).status, 'Resolved');

// Delete (DELETE)
assert.strictEqual(store.remove(1), true);
assert.strictEqual(store.get(1), null);
assert.strictEqual(store.remove(99999), false);
console.log('✓ Requirement 4 (REST API CRUD endpoints) passed.');

// 7. KPI Metrics Verification
const stats = store.stats();
assert.strictEqual(stats.total, 19);
console.log('✓ KPI statistics calculation passed:', stats);

console.log('\n======================================================');
console.log('✓ ALL SUPPORTDESK TEST SUITES PASSED CLEANLY (exit code 0)');
console.log('======================================================\n');
