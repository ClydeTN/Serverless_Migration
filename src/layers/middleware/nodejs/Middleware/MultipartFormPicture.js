const multipart = require('parse-multipart');
const { v4: uuidv4 } = require('uuid');

const MultipartFormPicture = {
    parse: async (event) => {
        try {
            if (!event.headers['content-type']?.includes('multipart/form-data')) {
                throw {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Content-Type must be multipart/form-data' })
                };
            }

            const boundary = multipart.getBoundary(event.headers['content-type']);
            if (!boundary) {
                throw {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Boundary not found in multipart form data' })
                };
            }

            // Parse multipart form data
            const parts = multipart.Parse(
                Buffer.from(event.body, 'base64'),
                boundary
            );

            // Find image part
            const imagePart = parts.find(part => 
                part.type.startsWith('image/') || 
                part.filename?.match(/\.(jpg|jpeg|png|gif)$/i)
            );

            if (!imagePart) {
                throw {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'No image file found in form data' })
                };
            }

            // Generate unique filename
            const fileExtension = imagePart.filename.split('.').pop().toLowerCase();
            const filename = `${uuidv4()}.${fileExtension}`;

            // Add image data to event
            event.image = {
                data: imagePart.data,
                filename: filename,
                contentType: imagePart.type,
                originalName: imagePart.filename
            };

            return event;
        } catch (error) {
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error processing multipart form data' })
            };
        }
    }
};

module.exports = MultipartFormPicture;
