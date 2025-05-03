const { ProjectController } = require('/opt/nodejs/Controllers/ProjectController');
const authMiddleware = require('/opt/nodejs/Middleware/authMiddleware');
const injectProject = require('/opt/nodejs/Middleware/injectProject');
const PageNotFound = require('/opt/nodejs/Middleware/PageNotFound');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event, context) => {
    try {
        // Authentication
        event = await authMiddleware.validateToken(event);
        
        const projectId = event.pathParameters?.projectId;
        if (!projectId) {
            PageNotFound.resourceNotFound('Project', 'undefined');
        }

        // Project validation
        event = await injectProject.validateProject(event);
        
        const projectController = new ProjectController();
        const project = await projectController.getProjectInfo(event.project.id);

        if (!project) {
            PageNotFound.resourceNotFound('Project', projectId);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(project)
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};