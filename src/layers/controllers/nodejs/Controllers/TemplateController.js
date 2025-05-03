const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { getPdfBuffer, renderHtml } = require('../Library/html2pdfConverters/handleBarConverter');
const { getPngContentFromPDFBuffer } = require('../Library/PdfToPng');

const fs = require("fs").promises;
const placeHolderSnapshot =
{
    aboutMe: "My name is John Doe, I love Gaming so Much it is my hobby especially Far Cry 3, I'm also cloud engineer and web developper and cyber security consultant and pentester and game developper and data analyst and AI model trainer ",
    fontFamily: "Arial",
    reference: "https://www.github.com/0marMejdi",
    address: "Centre Urbain Nord",
    city: "Tunis",
    email: "john.doe@insat.ucar.tn",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+216 27 182 818",
    postalCode: "6140",
    profileTitle: "Software Developer & CyberSec Consultant",
    Education:
        [
            {
                institutionName: "INSAT",
                description: "The Software Engineering sector is a training course which aims to train engineers specialized in methods of analysis and management of IT projects, as well as in the languages and tools necessary for software development. ",
                degree: "Software Engineering Degree",
                finishMonth: 5,
                finishYear: 2023,
                startingMonth: 9,
                startingYear: 2019,
                tag: 0,
                toPresent: 0
            }
        ]
    ,
    ProfessionalExp:
        [
            {
                city: "Tunis",
                description: "With Elyadata, you gain an advantage in the data world—a unique blend of cutting-edge science and real-world application that pushes your business to new",
                companyName: "ElyaData",
                finishMonth: 12,
                finishYear: 2022,
                post: "Front End Developer",
                startingMonth: 5,
                startingYear: 2020,
                tag: 0,
                toPresent: 0
            },
            {
                city: "Tunis",
                description: "Ernst & Young Global Limited, trade name EY, is a multinational professional services partnership. EY is one of the largest professional services networks in the world. ",
                companyName: "EY",

                post: "CyberSec Consultant",
                startingMonth: 1,
                startingYear: 2024,
                tag: 0,
                toPresent: 1
            }
        ]
    ,
    Language:
        [
            {
                name: "English",
                level: "5",
                tag: 1
            }
            ,
            {
                name: "French",
                level: "2",
                tag: 0
            }
        ]
    ,
    Skill:
        [
            {
                name: "Designing",
                level: "3",
                tag: 0
            },
            {
                name: "Web Development",
                level: "5",
                tag: 1
            },
            {
                name: "Problem Solving",
                level: "4",
                tag: 2
            },
            {
                name: "Team Work",
                level: "5",
                tag: 3
            },
            {
                name: "Communication",
                level: "5",
                tag: 4
            },
            {
                name: "Leadership",
                level: "5",
                tag: 5
            }
        ]
    ,
    Interest:
        [
            {
                name: "Sleeping",
                tag: 0
            },
            {
                name: "Gaming",
                tag: 1
            },
            {
                name: "Hacking",
                tag:2
            },
            {
                name: "Lifting",
                tag:3
            },
            {
                name: "Cycling",
                tag:4
            },


        ]
    ,
    Orders:
    {
        Education: 0,
        ProfessionalExp: 1,
        Language: 2,
        Skill: 3,
        Interest: 4
    }

};

// Move placeholder to DynamoDB
const PLACEHOLDER_SNAPSHOT_ID = 'template-placeholder';

const getTemplatesList = async () => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET,
            Prefix: 'templates/', // Store templates in a dedicated prefix
            Delimiter: '/'
        };

        const response = await s3.listObjectsV2(params).promise();
        return response.Contents
            .filter(obj => obj.Key.endsWith('.html'))
            .map(obj => obj.Key.split('/')[1].split('.')[0]);
    } catch (error) {
        throw new Error(`Failed to list templates: ${error.message}`);
    }
};

const getTemplateContent = async (name) => {
    try {
        // First get the template HTML from S3
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `templates/${name}.html`
        };

        const template = await s3.getObject(params).promise();
        const templateContent = template.Body.toString('utf-8');

        // Get placeholder data from DynamoDB
        const placeholderData = await getPlaceholderSnapshot();

        // Render the template with placeholder data
        return await renderHtml(templateContent, placeholderData);
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            throw new Error(`Template ${name} not found`);
        }
        throw error;
    }
};

/**
 * 
 * @param {string} name : template name
 * @returns {Buffer} : binary content of the pdf file
 */
const getTemplatePdf = async (name) => {
    try {
        const templateContent = await getTemplateContent(name);
        const placeholderData = await getPlaceholderSnapshot();
        return await getPdfBuffer(templateContent, placeholderData);
    } catch (error) {
        throw new Error(`Failed to generate PDF for template ${name}: ${error.message}`);
    }
};

/**
 * gets the thumbnail image for a given template name. mainly it's the binary content of the image in a buffer.
 * @param name : string
 * @returns {Promise<Buffer>}
 */
const getTemplateThumb = async (name) => {
    try {
        // Check if thumbnail already exists in S3
        const thumbnailKey = `templates/thumbnails/${name}.png`;
        try {
            const existingThumb = await s3.getObject({
                Bucket: process.env.S3_BUCKET,
                Key: thumbnailKey
            }).promise();
            return existingThumb.Body;
        } catch (error) {
            if (error.code !== 'NoSuchKey') {
                throw error;
            }
        }

        // Generate new thumbnail
        const pdfContent = await getTemplatePdf(name);
        const pngContent = await getPngContentFromPDFBuffer(pdfContent);

        // Cache thumbnail in S3
        await s3.putObject({
            Bucket: process.env.S3_BUCKET,
            Key: thumbnailKey,
            Body: pngContent,
            ContentType: 'image/png',
            Metadata: {
                templateName: name,
                generatedAt: new Date().toISOString()
            }
        }).promise();

        return pngContent;
    } catch (error) {
        throw new Error(`Failed to generate thumbnail for template ${name}: ${error.message}`);
    }
};

const getAllTemplateContent = async () => {
    const names = await getTemplatesList();
    return Promise.all(names.map(async (name) => ({
        name,
        content: await getTemplateContent(name)
    })));
};

// Helper function to get placeholder data from DynamoDB
const getPlaceholderSnapshot = async () => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_SNAPSHOTS,
            Key: {
                id: PLACEHOLDER_SNAPSHOT_ID
            }
        };

        const result = await dynamoDB.get(params).promise();
        if (!result.Item) {
            // If placeholder doesn't exist in DynamoDB, create it
            await createPlaceholderSnapshot();
            return placeHolderSnapshot; // Using the existing constant as default
        }

        return result.Item;
    } catch (error) {
        throw new Error(`Failed to get placeholder snapshot: ${error.message}`);
    }
};

// Helper function to create placeholder in DynamoDB
const createPlaceholderSnapshot = async () => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_SNAPSHOTS,
            Item: {
                id: PLACEHOLDER_SNAPSHOT_ID,
                ...placeHolderSnapshot,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        await dynamoDB.put(params).promise();
    } catch (error) {
        throw new Error(`Failed to create placeholder snapshot: ${error.message}`);
    }
};

module.exports = {
    getAllTemplateContent,
    getTemplatesList,
    getTemplateThumb,
    getTemplateContent,
    getTemplatePdf
};



