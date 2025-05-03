class User {
    constructor(data = {}) {
        this.id = data.id;
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    validate() {
        if (!this.id) throw new Error('User ID is required');
        if (!this.email) throw new Error('Email is required');
        if (!this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error('Invalid email format');
        }
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User;
