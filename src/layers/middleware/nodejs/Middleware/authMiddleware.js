const jwt = require('jsonwebtoken');
const UserRepository = require('/opt/nodejs/Repositories/UserRepository');

const authMiddleware = {
    validateToken: async (event) => {
        try {
            // Check for Authorization header
            if (!event.headers || !event.headers.Authorization) {
                throw new Error('No authorization header');
            }

            // Extract token
            const authHeader = event.headers.Authorization;
            const token = authHeader.startsWith('Bearer ') ? 
                authHeader.substring(7) : authHeader;

            if (!token) {
                throw new Error('No token provided');
            }

            // Verify token
            const decoded = jwt.verify(token, "souassi");
            
            // Validate user exists in database
            const userRepository = new UserRepository();
            const user = await userRepository.getUserById(decoded.sub);

            if (!user) {
                throw new Error('User not found');
            }

            // Add user info to event
            if (!event.requestContext) {
                event.requestContext = {};
            }

            event.requestContext.authorizer = {
                userId: user.id,
                email: user.email
            };

            // Add user to body for compatibility with existing code
            if (!event.body) {
                event.body = {};
            } else if (typeof event.body === 'string') {
                event.body = JSON.parse(event.body);
            }

            event.body.user = {
                id: user.id,
                email: user.email
            };

            return event;

        } catch (error) {
            console.error('Auth error:', error);
            
            let message = 'Unauthorized';
            if (error.name === 'JsonWebTokenError') {
                message = 'Invalid token';
            } else if (error.name === 'TokenExpiredError') {
                message = 'Token expired';
            }

            throw {
                statusCode: 401,
                body: JSON.stringify({ 
                    message: message,
                    error: error.message 
                })
            };
        }
    }
};

module.exports = authMiddleware; 