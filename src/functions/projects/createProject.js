const { ProjectController } = require('/opt/nodejs/Controllers/ProjectController');
const authMiddleware = require('/opt/nodejs/Middleware/authMiddleware');
const errorMiddleware = require('/opt/nodejs/Middleware/errorMiddleware');

exports.handler = async (event, context) => {
    try {
        // Auth validation
        event = await authMiddleware.validateToken(event);
        
        const body = JSON.parse(event.body);
        if (!body.title || !body.templateId) {
            throw {
                statusCode: 400,
                body: JSON.stringify({ 
                    message: "Title and templateId are required" 
                })
            };
        }

        const projectController = new ProjectController();
        const newProject = await projectController.createProject({
            userId: event.body.user.id,
            title: body.title,
            templateId: body.templateId,
            description: body.description || ''
        });

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Project created successfully",
                project: newProject
            })
        };

    } catch (error) {
        return errorMiddleware.handleError(error);
    }
}; 