const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

class UserRepository {
    constructor() {
        this.tableName = process.env.DYNAMODB_TABLE_USERS;
    }

    async createUser(user) {
        const params = {
            TableName: this.tableName,
            Item: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            ConditionExpression: 'attribute_not_exists(id)'
        };

        try {
            await dynamodb.put(params).promise();
            return params.Item;
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('User already exists');
            }
            throw error;
        }
    }

    async getUserById(userId) {
        const params = {
            TableName: this.tableName,
            Key: { id: userId }
        };

        const result = await dynamodb.get(params).promise();
        return result.Item;
    }

    async getUserByEmail(email) {
        const params = {
            TableName: this.tableName,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        };

        const result = await dynamodb.query(params).promise();
        return result.Items[0];
    }

    async updateUser(userId, updates) {
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'email') {
                updateExpressions.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = value;
            }
        });

        const params = {
            TableName: this.tableName,
            Key: { id: userId },
            UpdateExpression: `SET ${updateExpressions.join(', ')}, #updatedAt = :updatedAt`,
            ExpressionAttributeNames: {
                ...expressionAttributeNames,
                '#updatedAt': 'updatedAt'
            },
            ExpressionAttributeValues: {
                ...expressionAttributeValues,
                ':updatedAt': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamodb.update(params).promise();
        return result.Attributes;
    }

    async deleteUser(userId) {
        const params = {
            TableName: this.tableName,
            Key: { id: userId }
        };

        await dynamodb.delete(params).promise();
    }
}

module.exports = UserRepository;
