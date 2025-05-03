const { AuthController } = require('/opt/nodejs/Controllers/AuthController');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event) => {
    try {
        const authController = new AuthController();
        const response = await authController.register(event);
        
        return {
            statusCode: response.statusCode,
            body: response.body,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 