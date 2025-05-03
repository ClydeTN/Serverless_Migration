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
        
        // Delete project
        const projectController = new ProjectController();
        await projectController.deleteProject(event.project.id);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "project deleted successfully"
            })
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 