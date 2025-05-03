const { ProjectController } = require('/opt/nodejs/Controllers/ProjectController');
const authMiddleware = require('/opt/nodejs/Middleware/authMiddleware');
const injectProject = require('/opt/nodejs/Middleware/injectProject');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event, context) => {
    try {
        // Auth validation
        event = await authMiddleware.validateToken(event);
        
        // Project validation
        event = await injectProject.validateProject(event);
        
        // Get PDF content
        const projectController = new ProjectController();
        const pdfBuffer = await projectController.getProjectPdf(event.project.id);

        return {
            statusCode: 200,
            body: pdfBuffer.toString('base64'),
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
            },
            isBase64Encoded: true
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 