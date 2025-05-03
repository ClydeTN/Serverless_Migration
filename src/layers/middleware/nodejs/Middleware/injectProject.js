const ProjectRepository = require('/opt/nodejs/Repositories/ProjectRepository');

const injectProject = {
    validateProject: async (event) => {
        try {
            const projectId = event.pathParameters?.projectId;
            const userId = event.requestContext.authorizer.userId;

            if (!projectId || projectId === "") {
                throw {
                    statusCode: 401,
                    body: JSON.stringify({ message: "Project Id is required. none is found!" })
                };
            }

            const projectRepository = new ProjectRepository();
            
            // Check if project exists first
            if (!await projectRepository.projectExists(projectId)) {
                throw {
                    statusCode: 401,
                    body: JSON.stringify({ message: "Project doesn't exists" })
                };
            }

            // Get simple project details
            const project = await projectRepository.getSimpleProjectById(projectId);
            
            // Check ownership
            if (project.userId !== userId) {
                throw {
                    statusCode: 401,
                    body: JSON.stringify({ message: "You don't own this project!" })
                };
            }

            // Inject project into the event
            if (!event.body) {
                event.body = {};
            } else if (typeof event.body === 'string') {
                event.body = JSON.parse(event.body);
            }
            
            event.body.project = project;
            return event;

        } catch (error) {
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 401,
                body: JSON.stringify({ message: error.message })
            };
        }
    }
};

module.exports = injectProject;
