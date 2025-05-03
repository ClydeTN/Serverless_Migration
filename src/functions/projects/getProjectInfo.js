const { ProjectController } = require('/opt/nodejs/Controllers/ProjectController');
const authMiddleware = require('/opt/nodejs/Middleware/authMiddleware');
const injectProject = require('/opt/nodejs/Middleware/injectProject');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event, context) => {
    try {
        // Auth and project validation
        event = await authMiddleware.validateToken(event);
        event = await injectProject.validateProject(event);
        
        const projectController = new ProjectController();
        const projectInfo = await projectController.getProjectInfo(event.project.id);

        if (!projectInfo) {
            throw {
                statusCode: 404,
                body: JSON.stringify({ message: "Project not found" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(projectInfo)
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};