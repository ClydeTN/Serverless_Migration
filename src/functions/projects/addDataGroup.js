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
        
        // Check for required entryName as per original route
        if (!body.hasOwnProperty("entryName")) {
            throw {
                statusCode: 400,
                body: JSON.stringify({ message: "entryName is required" })
            };
        }

        const projectController = new ProjectController();
        const newTag = await projectController.addDataGroup(
            event.project.id, 
            body.entryName
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                tag: newTag,
                message: "data group added successfully" 
            })
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 