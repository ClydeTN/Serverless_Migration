const { ProjectController } = require('/opt/nodejs/Controllers/ProjectController');
const authMiddleware = require('/opt/nodejs/Middleware/authMiddleware');
const injectProject = require('/opt/nodejs/Middleware/injectProject');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event, context) => {
    try {
        // Auth and project validation
        event = await authMiddleware.validateToken(event);
        event = await injectProject.validateProject(event);

        const body = JSON.parse(event.body);
        
        // Validate required fields
        if (!body.Snapshot) {
            throw {
                statusCode: 400,
                body: JSON.stringify({ message: "Snapshot data is required" })
            };
        }

        const projectController = new ProjectController();
        await projectController.updateSnapshot(event.project.id, body.Snapshot);

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "updated successfully" 
            })
        };

    } catch (error) {
        // Include stack trace in error response as per original route
        return {
            statusCode: error.statusCode || 401,
            body: JSON.stringify({ 
                message: error.message,
                stack: error.stack 
            })
        };
    }
}; 