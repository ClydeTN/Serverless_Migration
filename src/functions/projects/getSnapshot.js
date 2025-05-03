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
        const snapshot = await projectController.getSnapshot(event.project.id);

        if (!snapshot) {
            throw {
                statusCode: 404,
                body: JSON.stringify({ message: "Snapshot not found" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(snapshot)
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
};