const { TemplateController } = require('/opt/nodejs/Controllers/TemplateController');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event) => {
    try {
        const { templateId } = event.pathParameters;
        const allContent = await TemplateController.getAllTemplateContent();
        const templateContent = allContent.find(t => t.name === templateId);
        
        if (!templateContent) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Template not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(templateContent),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};