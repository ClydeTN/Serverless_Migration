const AWS = require('aws-sdk');
const s3 = new AWS.S3();

let Project = require( "../Models/Project");
let EnumDataController = require("../Controllers/EnumDataController")
let ProjectRepository = require("../Repositories/ProjectRepository")
let Snapshot = require("../Models/Snapshot")
let EnumerableData = require("../Models/EnumerableData")
const {promises: fs} = require("fs");
const { JSDOM } = require('jsdom');
const { getPdfBuffer , renderHtml} = require('../Library/html2pdfConverters/handleBarConverter');
const { getPngContentFromPDFBuffer } = require('../Library/PdfToPng');


const newProject =async (title,templateName,userId)=>{
    let templates = await require("../Controllers/TemplateController").getTemplatesList();
    if (!templateName)

    if (!templates.includes(templateName))
        throw  new Error("this template is not found!");
    let project = new Project(title,templateName,userId);
    await ProjectRepository.createProject(project);
    return (project.id);
}
const getSimpleProjectsList = async (userId) =>{
    let projects= await ProjectRepository.getSimpleProjectsForUserById(userId);
    return projects.map(project=>Project.fullTrim(project));
}
const getSimpleProject =async (projectId)=>{
    let project=  await ProjectRepository.getSimpleProjectById(projectId);
    return Project.fullTrim(project);

}
const getFullProject= async(projectId)=>{
    let project= await ProjectRepository.getFullProjectById(projectId);
    return Project.fullTrim(project);
}
const getSnapshot =async (projectId)=>{
    try{
        return Snapshot.fullTrim(await ProjectRepository.getSnapshotOnly(projectId));
    }catch(e){
        throw new Error(e.message);
    }

}
const updateSnapshot = async(projectId, snapshot)=>{
    // id injection !!
    snapshot.projectId = projectId;
    snapshot = Snapshot.fullSanitize(snapshot);
    // now for each enumerable data group:
    for (const key in Snapshot.enumerableList) {
        // first, we delete all enumerable data to let us replace them by newer ones.
        await ProjectRepository.deleteEnumerableForProject(projectId,key); // => let deleteAllEnum = connection.format(`DELETE FROM ${connection.escapeId(key)} WHERE projectId= ?`, [snapshot.projectId]);  await executeQuery(deleteAllEnum);
        // now for each enumerable data group, we insert them one by one in their appropriate table
        for (const index in snapshot[key]) {
            let enumData = snapshot[key][index];
            await ProjectRepository.insertNewEnumerable(key,enumData);
        }
    }
    // now we update the big Snapshot object regardless their enumerable data.
    // it must be already sanitized
    let cleanSnap = Snapshot.sanitize(snapshot)

    await ProjectRepository.updateSnapshotForProject(projectId,cleanSnap);
    return true;
}
const updateSnapshotField =async (projectId,field)=>{
    if (!field.fieldName)
        throw new Error("fieldName is required!");
    EnumDataController.validateFieldName(field.entryName, field.fieldName);
    EnumerableData.validateTag(field.tag);
    if(EnumDataController.isEnumerable(field.entryName)){
        if (! await ProjectRepository.tagExists(projectId, field.entryName, field.tag))
            throw new Error('this tag is not found');
        await ProjectRepository.updateSnapshotFieldForEnumerable(projectId,field.fieldName,field.fieldValue,field.entryName,field.tag);
    }else{
        await ProjectRepository.updateSnapshotField(projectId,field.fieldName,field.fieldValue);
    }
}

const addDataGroup =async(projectId,entryName)=>{
    EnumDataController.validateEntryNameOnly(entryName);
    let nextTag = await ProjectRepository.getNextTag(projectId,entryName);
    let enumerableDataGroup = new Snapshot.enumerableList[entryName]();
    enumerableDataGroup.tag= nextTag;
    enumerableDataGroup.projectId = projectId;
    await ProjectRepository.addWholeDataGroup(projectId,entryName,enumerableDataGroup);
    return nextTag;
}

const deleteProject = async (projectId) =>{
    await ProjectRepository.deleteProjectById(projectId);
}

const uploadImage = async (projectId, imageBuffer, imageType) => {
    if (!imageBuffer || !imageType) {
        throw new Error("No Image Found!");
    }

    const userId = projectId.split('-')[0]; // Assuming projectId contains userId as prefix
    const fileName = `pdp.${imageType.split("/")[1]}`;
    const key = `${userId}/${projectId}/${fileName}`;

    try {
        // Upload to S3
        await s3.putObject({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: imageBuffer,
            ContentType: imageType,
            Metadata: {
                projectId: projectId,
                contentType: imageType
            }
        }).promise();

        // Update the snapshot with S3 URL
        const imageURL = `s3://${process.env.S3_BUCKET}/${key}`;
        await ProjectRepository.updateSnapshotField(projectId, 'imageURL', imageURL);
    } catch (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

const downloadImage = async (projectId) => {
    const snapshot = await ProjectRepository.getSnapshotOnly(projectId);
    if (!snapshot.imageURL) {
        throw new Error("This Project doesn't have image saved!");
    }

    try {
        // Parse S3 URL
        const imageURL = snapshot.imageURL;
        const key = imageURL.replace('s3://' + process.env.S3_BUCKET + '/', '');

        // Get from S3
        const response = await s3.getObject({
            Bucket: process.env.S3_BUCKET,
            Key: key
        }).promise();

        return response.Body;
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            throw new Error("No image found for this project!");
        }
        throw error;
    }
}

const getImageType = async (projectId) => {
    const snapshot = await ProjectRepository.getSnapshotOnly(projectId);
    if (!snapshot.imageURL) {
        throw new Error("This Project doesn't have image saved!");
    }

    try {
        // Parse S3 URL
        const imageURL = snapshot.imageURL;
        const key = imageURL.replace('s3://' + process.env.S3_BUCKET + '/', '');

        // Get object metadata from S3
        const response = await s3.headObject({
            Bucket: process.env.S3_BUCKET,
            Key: key
        }).promise();

        return response.ContentType;
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            throw new Error("No image found for this project!");
        }
        throw error;
    }
}

/**
 *
 * @param projectId
 * @return {Promise<string>} HTML string content
 */
const getProjectHtml = async (projectId) => {
    const /**@type Project */ project   = await getFullProject(projectId);
    return await renderHtml(project.templateName, project.Snapshot);
};
/**
 * 
 * @param {string} name : template name
 * @returns {Buffer} : binary content of the pdf file
 */
const getProjectPdf = async (projectId) => {
    const /**@type Project */ project   = await getFullProject(projectId);
    return await getPdfBuffer(project.templateName, project.Snapshot);
}
/**
 * gets the thumbnail image for a given template name. mainly it's the binary content of the image in a buffer.
 * @param name : string
 * @returns {Promise<Buffer>}
 */
const getProjectThumb = async (projectId) => {
    const pdfContent = await getProjectPdf(projectId);
    const pngContent = await getPngContentFromPDFBuffer(pdfContent);
    return pngContent;
};
module.exports = {getProjectThumb, getProjectHtml, getProjectPdf, getImageType,downloadImage,uploadImage, deleteProject,
    addDataGroup,newProject,getSimpleProjectsList,updateSnapshotField,
    updateSnapshot,getSnapshot,getFullProject,getSimpleProject}
