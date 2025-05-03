const { TemplateController } = require('/opt/nodejs/Controllers/TemplateController');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event) => {
    try {
        const templates = await TemplateController.getTemplatesList();
        
        return {
            statusCode: 200,
            body: JSON.stringify(templates),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};
