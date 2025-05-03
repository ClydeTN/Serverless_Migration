
const { TemplateController } = require('/opt/nodejs/Controllers/TemplateController');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event) => {
    try {
        const { templateId } = event.pathParameters;
        const content = await TemplateController.getTemplateContent(templateId);
        
        return {
            statusCode: 200,
            body: content,
            headers: {
                'Content-Type': 'text/html'
            }
        };
    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};