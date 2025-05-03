const { UserController } = require('/opt/nodejs/Controllers/UserController');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event) => {
    try {
        const userController = new UserController();
        const response = await userController.createUser(event);
        
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