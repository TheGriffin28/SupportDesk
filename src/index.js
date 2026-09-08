// ==============================================================================
// Build — Core Service Implementation
// Generated autonomously by Forge (Nexora AI Office)
// ==============================================================================

class BuildService {
  constructor() {
    this.items = new Map();
    this.nextId = 1;
  }

  create(data) {
    if (!data.subject && !data.title && !data.name) {
      throw new Error('Validation Error: Required fields missing');
    }
    const id = this.nextId++;
    const record = {
      id,
      ...data,
      status: data.status || 'Open',
      priority: data.priority || 'Medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, record);
    return record;
  }

  list(filter = {}) {
    let list = Array.from(this.items.values());
    if (filter.status) list = list.filter(i => i.status.toLowerCase() === filter.status.toLowerCase());
    if (filter.priority) list = list.filter(i => i.priority.toLowerCase() === filter.priority.toLowerCase());
    return list;
  }

  get(id) {
    return this.items.get(Number(id)) || null;
  }

  update(id, data) {
    const existing = this.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.items.set(Number(id), updated);
    return updated;
  }

  remove(id) {
    return this.items.delete(Number(id));
  }
}

module.exports = { BuildService };
