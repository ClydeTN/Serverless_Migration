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
        
        // Get thumbnail
        const projectController = new ProjectController();
        const thumbnailBuffer = await projectController.getProjectThumb(event.project.id);

        return {
            statusCode: 200,
            body: thumbnailBuffer.toString('base64'),
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=3600'
            },
            isBase64Encoded: true
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 