class Snapshot {
    constructor(data = {}) {
        this.projectId = data.projectId;
        this.timestamp = data.timestamp || new Date().toISOString();
        this.version = data.version || 1;
        this.data = data.data || {};
    }

    validate() {
        if (!this.projectId) throw new Error('Project ID is required');
        if (!this.data) throw new Error('Snapshot data is required');
        return true;
    }

    toJSON() {
        return {
            projectId: this.projectId,
            timestamp: this.timestamp,
            version: this.version,
            data: this.data
        };
    }
}

module.exports = Snapshot;
