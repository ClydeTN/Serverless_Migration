const UserRepository = require('/opt/nodejs/Repositories/UserRepository');
const User = require('/opt/nodejs/Models/User');
const { v4: uuidv4 } = require('uuid');

class UserController {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(event) {
        try {
            const userData = JSON.parse(event.body);
            userData.id = userData.id || uuidv4();
            
            const user = new User(userData);
            user.validate();

            const createdUser = await this.userRepository.createUser(user);
            return {
                statusCode: 201,
                body: JSON.stringify(createdUser)
            };
        } catch (error) {
            return {
                statusCode: error.message.includes('already exists') ? 409 : 400,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    async getUser(event) {
        try {
            const userId = event.pathParameters.userId;
            const user = await this.userRepository.getUserById(userId);

            if (!user) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'User not found' })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(user)
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    async updateUser(event) {
        try {
            const userId = event.pathParameters.userId;
            const updates = JSON.parse(event.body);
            
            const updatedUser = await this.userRepository.updateUser(userId, updates);
            
            if (!updatedUser) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'User not found' })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(updatedUser)
            };
        } catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    async deleteUser(event) {
        try {
            const userId = event.pathParameters.userId;
            await this.userRepository.deleteUser(userId);

            return {
                statusCode: 204,
                body: ''
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
}

module.exports = UserController;
