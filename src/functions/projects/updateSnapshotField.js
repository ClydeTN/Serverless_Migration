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
        
        if (!body.field || !body.hasOwnProperty('value')) {
            throw {
                statusCode: 400,
                body: JSON.stringify({ 
                    message: "field and value are required" 
                })
            };
        }

        const projectController = new ProjectController();
        await projectController.updateSnapshotField(
            event.project.id,
            body.field,
            body.value
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "Field updated successfully" 
            })
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 