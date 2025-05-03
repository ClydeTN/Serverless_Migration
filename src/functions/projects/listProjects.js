const { ProjectController } = require('/opt/nodejs/Controllers/ProjectController');
const authMiddleware = require('/opt/nodejs/Middleware/authMiddleware');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event, context) => {
    try {
        // Auth validation
        event = await authMiddleware.validateToken(event);
        
        const projectController = new ProjectController();
        const projects = await projectController.listProjects(event.body.user.id);

        return {
            statusCode: 200,
            body: JSON.stringify(projects)
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 