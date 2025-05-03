const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

class ProjectRepository {
    constructor() {
        // Get table names from environment variables set by Terraform
        this.projectsTable = process.env.DYNAMODB_TABLE_PROJECTS;
        this.snapshotsTable = process.env.DYNAMODB_TABLE_SNAPSHOTS;
        this.enumerableTable = process.env.DYNAMODB_TABLE_ENUMERABLE;
        this.s3Bucket = process.env.S3_BUCKET;
    }

    async createProject(project) {
        const timestamp = new Date().toISOString();
        const projectItem = {
            id: project.id,
            userId: project.userId,
            title: project.title,
            description: project.description || '',
            templateId: project.templateId,
            status: project.status || 'draft',
            creationDate: timestamp,
            lastModified: timestamp,
            metadata: project.metadata || {}
        };

        const params = {
            TableName: this.projectsTable,
            Item: projectItem,
            ConditionExpression: 'attribute_not_exists(id)'
        };

        try {
            await dynamodb.put(params).promise();
            return projectItem;
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('Project already exists');
            }
            throw error;
        }
    }

    async getProjectById(projectId, userId) {
        const params = {
            TableName: this.projectsTable,
            Key: {
                id: projectId,
                userId: userId
            }
        };

        const result = await dynamodb.get(params).promise();
        return result.Item;
    }

    async listUserProjects(userId, options = {}) {
        const params = {
            TableName: this.projectsTable,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };

        if (options.status) {
            params.FilterExpression = 'status = :status';
            params.ExpressionAttributeValues[':status'] = options.status;
        }

        if (options.limit) {
            params.Limit = options.limit;
        }

        if (options.lastEvaluatedKey) {
            params.ExclusiveStartKey = options.lastEvaluatedKey;
        }

        const result = await dynamodb.query(params).promise();
        return {
            items: result.Items,
            lastEvaluatedKey: result.LastEvaluatedKey
        };
    }

    async updateProject(projectId, userId, updates) {
        const updateExpressions = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'userId') {
                updateExpressions.push(`#${key} = :${key}`);
                expressionAttributeNames[`#${key}`] = key;
                expressionAttributeValues[`:${key}`] = value;
            }
        });

        expressionAttributeValues[':lastModified'] = new Date().toISOString();
        updateExpressions.push('#lastModified = :lastModified');
        expressionAttributeNames['#lastModified'] = 'lastModified';

        const params = {
            TableName: this.projectsTable,
            Key: {
                id: projectId,
                userId: userId
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
            ConditionExpression: 'attribute_exists(id)'
        };

        try {
            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('Project not found');
            }
            throw error;
        }
    }

    async deleteProject(projectId, userId) {
        // Delete project metadata
        const deleteProjectParams = {
            TableName: this.projectsTable,
            Key: {
                id: projectId,
                userId: userId
            },
            ConditionExpression: 'attribute_exists(id)'
        };

        // Delete all project assets from S3
        const s3Prefix = `${userId}/${projectId}/`;

        try {
            // Delete project record
            await dynamodb.delete(deleteProjectParams).promise();

            // Delete associated snapshots
            await this.deleteProjectSnapshots(projectId);

            // Delete enumerable data
            await this.deleteProjectEnumerableData(projectId);

            // Delete S3 assets
            await this.deleteS3Directory(s3Prefix);
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                throw new Error('Project not found');
            }
            throw error;
        }
    }

    // Snapshot Management
    async saveSnapshot(projectId, snapshot) {
        const params = {
            TableName: this.snapshotsTable,
            Item: {
                projectId: projectId,
                timestamp: snapshot.timestamp || new Date().toISOString(),
                version: snapshot.version,
                data: snapshot.data,
                metadata: snapshot.metadata || {}
            }
        };

        await dynamodb.put(params).promise();
        return params.Item;
    }

    async getLatestSnapshot(projectId) {
        const params = {
            TableName: this.snapshotsTable,
            KeyConditionExpression: 'projectId = :projectId',
            ExpressionAttributeValues: {
                ':projectId': projectId
            },
            Limit: 1,
            ScanIndexForward: false // Get most recent first
        };

        const result = await dynamodb.query(params).promise();
        return result.Items[0];
    }

    // Enumerable Data Management
    async saveEnumerableData(projectId, type, tag, data) {
        const params = {
            TableName: this.enumerableTable,
            Item: {
                projectId: projectId,
                'type#tag': `${type}#${tag}`,
                type: type,
                tag: tag,
                data: data,
                timestamp: new Date().toISOString()
            }
        };

        await dynamodb.put(params).promise();
        return params.Item;
    }

    async getEnumerableData(projectId, type, tag) {
        const params = {
            TableName: this.enumerableTable,
            Key: {
                projectId: projectId,
                'type#tag': `${type}#${tag}`
            }
        };

        const result = await dynamodb.get(params).promise();
        return result.Item;
    }

    // Asset Management
    async saveAsset(projectId, userId, assetKey, content, contentType) {
        const key = `${userId}/${projectId}/${assetKey}`;
        const params = {
            Bucket: this.s3Bucket,
            Key: key,
            Body: content,
            ContentType: contentType,
            Metadata: {
                projectId: projectId,
                userId: userId
            }
        };

        await s3.putObject(params).promise();
        return key;
    }

    async getAsset(projectId, userId, assetKey) {
        const key = `${userId}/${projectId}/${assetKey}`;
        const params = {
            Bucket: this.s3Bucket,
            Key: key
        };

        try {
            return await s3.getObject(params).promise();
        } catch (error) {
            if (error.code === 'NoSuchKey') {
                return null;
            }
            throw error;
        }
    }

    // Private helper methods
    async deleteProjectSnapshots(projectId) {
        const params = {
            TableName: this.snapshotsTable,
            KeyConditionExpression: 'projectId = :projectId',
            ExpressionAttributeValues: {
                ':projectId': projectId
            }
        };

        const result = await dynamodb.query(params).promise();
        
        // Delete snapshots in batches of 25 (DynamoDB limit)
        const chunks = this.chunkArray(result.Items, 25);
        for (const chunk of chunks) {
            const deleteRequests = chunk.map(item => ({
                DeleteRequest: {
                    Key: {
                        projectId: item.projectId,
                        timestamp: item.timestamp
                    }
                }
            }));

            await dynamodb.batchWrite({
                RequestItems: {
                    [this.snapshotsTable]: deleteRequests
                }
            }).promise();
        }
    }

    async deleteProjectEnumerableData(projectId) {
        const params = {
            TableName: this.enumerableTable,
            KeyConditionExpression: 'projectId = :projectId',
            ExpressionAttributeValues: {
                ':projectId': projectId
            }
        };

        const result = await dynamodb.query(params).promise();
        
        // Delete enumerable data in batches
        const chunks = this.chunkArray(result.Items, 25);
        for (const chunk of chunks) {
            const deleteRequests = chunk.map(item => ({
                DeleteRequest: {
                    Key: {
                        projectId: item.projectId,
                        'type#tag': item['type#tag']
                    }
                }
            }));

            await dynamodb.batchWrite({
                RequestItems: {
                    [this.enumerableTable]: deleteRequests
                }
            }).promise();
        }
    }

    async deleteS3Directory(prefix) {
        let continuationToken;
        do {
            const listParams = {
                Bucket: this.s3Bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken
            };

            const listedObjects = await s3.listObjectsV2(listParams).promise();
            if (listedObjects.Contents.length === 0) break;

            const deleteParams = {
                Bucket: this.s3Bucket,
                Delete: {
                    Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
                }
            };

            await s3.deleteObjects(deleteParams).promise();
            continuationToken = listedObjects.NextContinuationToken;
        } while (continuationToken);
    }

    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    async projectExists(projectId) {
        const params = {
            TableName: this.projectsTable,
            Key: {
                id: projectId
            },
            ProjectionExpression: 'id'  // Only retrieve the id field for efficiency
        };

        try {
            const result = await dynamodb.get(params).promise();
            return !!result.Item;  // Convert to boolean
        } catch (error) {
            console.error('Error checking project existence:', error);
            return false;
        }
    }

    async getSimpleProjectById(projectId) {
        const params = {
            TableName: this.projectsTable,
            Key: {
                id: projectId
            },
            ProjectionExpression: 'id, userId, title, status'  // Only retrieve essential fields
        };

        try {
            const result = await dynamodb.get(params).promise();
            return result.Item;
        } catch (error) {
            console.error('Error getting simple project:', error);
            throw error;
        }
    }
}

module.exports = ProjectRepository;
