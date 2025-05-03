const errorMiddleware = {
    handleError: (error) => {
        console.error('Error:', error);

        // If error is already formatted (from other middleware)
        if (error.statusCode && error.body) {
            return error;
        }

        // Handle specific error types
        if (error.name === 'ValidationError') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Validation Error',
                    errors: error.details
                })
            };
        }

        if (error.name === 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: 'Resource already exists or condition check failed'
                })
            };
        }

        // Default error response
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                message: error.message || 'Internal Server Error'
            })
        };
    }
};

module.exports = errorMiddleware; 