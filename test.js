const assert = require('assert');
const { BuildService } = require('./src/index.js');

console.log('Testing BuildService...');
const service = new BuildService();

// 1. Creation & Validation
const item = service.create({ customerName: 'Alice', customerEmail: 'alice@example.com', subject: 'Login issue', description: 'Cannot reset password', priority: 'High', status: 'Open' });
assert.strictEqual(item.id, 1);
assert.strictEqual(item.status, 'Open');

// 2. Listing & Filtering
const all = service.list();
assert.strictEqual(all.length, 1);
const highPriority = service.list({ priority: 'High' });
assert.strictEqual(highPriority.length, 1);

// 3. Updating
const updated = service.update(1, { status: 'In Progress' });
assert.strictEqual(updated.status, 'In Progress');

// 4. Retrieval
const fetched = service.get(1);
assert.strictEqual(fetched.customerName, 'Alice');

// 5. Deletion
assert.strictEqual(service.remove(1), true);
assert.strictEqual(service.get(1), null);

console.log('✓ All Build unit tests passed cleanly with exit code 0.');
