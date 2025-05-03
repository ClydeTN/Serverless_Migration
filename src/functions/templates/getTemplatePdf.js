const { TemplateController } = require('/opt/nodejs/Controllers/TemplateController');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event) => {
    try {
        const { templateId } = event.pathParameters;
        const pdfContent = await TemplateController.getTemplatePdf(templateId);
        
        return {
            statusCode: 200,
            body: pdfContent.toString('base64'),
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline'
            },
            isBase64Encoded: true
        };
    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};