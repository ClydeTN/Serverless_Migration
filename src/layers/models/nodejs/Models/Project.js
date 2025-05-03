class Project {
    constructor(data = {}) {
        this.id = data.id;
        this.userId = data.userId;
        this.title = data.title;
        this.description = data.description;
        this.templateId = data.templateId;
        this.status = data.status || 'draft';
        this.creationDate = data.creationDate || new Date().toISOString();
        this.lastModified = data.lastModified || new Date().toISOString();
        this.metadata = data.metadata || {};
    }

    validate() {
        if (!this.id) throw new Error('Project ID is required');
        if (!this.userId) throw new Error('User ID is required');
        if (!this.title) throw new Error('Title is required');
        if (!this.templateId) throw new Error('Template ID is required');
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            title: this.title,
            description: this.description,
            templateId: this.templateId,
            status: this.status,
            creationDate: this.creationDate,
            lastModified: this.lastModified,
            metadata: this.metadata
        };
    }
}

module.exports = Project;
