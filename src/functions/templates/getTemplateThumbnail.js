const { TemplateController } = require('/opt/nodejs/Controllers/TemplateController');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event) => {
    try {
        const { templateId } = event.pathParameters;
        const thumbnail = await TemplateController.getTemplateThumb(templateId);
        
        return {
            statusCode: 200,
            body: thumbnail.toString('base64'),
            headers: {
                'Content-Type': 'image/png'
            },
            isBase64Encoded: true
        };
    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};