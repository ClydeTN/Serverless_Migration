const { ProjectController } = require('/opt/nodejs/Controllers/ProjectController');
const authMiddleware = require('/opt/nodejs/Middleware/authMiddleware');
const injectProject = require('/opt/nodejs/Middleware/injectProject');
const PictureHandler = require('/opt/nodejs/Middleware/PictureHandler');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event, context) => {
    try {
        // Auth and project validation
        event = await authMiddleware.validateToken(event);
        event = await injectProject.validateProject(event);

        // Handle image processing
        event = await PictureHandler.processImage(event);

        const projectController = new ProjectController();
        await projectController.uploadImage(
            event.project.id,
            event.processedImage.data,
            event.processedImage.contentType
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "image uploaded successfully" 
            })
        };

    } catch (error) {
        return {
            statusCode: error.statusCode || 401,
            body: JSON.stringify({ message: error.message })
        };
    }
}; 