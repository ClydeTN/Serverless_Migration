// middleware.js

const multer = require('multer');
const bodyParser = require('body-parser');
const sharp = require('sharp');

function handleFormData(req, res, next) {
    const upload = multer().fields([{ name: 'profilePicture', maxCount: 1 }]);
    upload(req, res, function (err) {
        if (err) {
            return next(err);
        }
        if (req.files && req.files.profilePicture) {
            const profilePicture = req.files.profilePicture[0];
            req.body.imageBuffer = profilePicture.buffer;
            req.body.imageType = profilePicture.mimetype;
        }
        next();
    });
}

const PictureHandler = {
    processImage: async (event) => {
        try {
            if (!event.body || !event.body.image) {
                throw {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'No image data provided' })
                };
            }

            let imageBuffer;
            try {
                imageBuffer = Buffer.from(event.body.image, 'base64');
            } catch (error) {
                throw {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Invalid image data' })
                };
            }

            // Process image with sharp
            const processedImage = await sharp(imageBuffer)
                .resize(800, 800, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            // Add processed image to event
            event.processedImage = {
                data: processedImage,
                contentType: 'image/jpeg'
            };

            return event;
        } catch (error) {
            if (error.statusCode) {
                throw error;
            }
            throw {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error processing image' })
            };
        }
    }
};

module.exports = { handleFormData, PictureHandler };
