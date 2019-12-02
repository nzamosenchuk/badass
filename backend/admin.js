const util = require('util');
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

const tableName = process.env.DYNAMODB_TABLE;
const collectionID = process.env.REKOGNITION_COLLECTION;

const docClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});


//, context, callback
exports.handler = async (event) => {
    const response = (err, res) => { 
        return {
            statusCode: err ? '400' : '200',
            body: err ? err.message : JSON.stringify(res),
            headers: {
                'Content-Type': 'application/json',
            }
        }   
    };

    var body = JSON.parse(event.body);
    let buff = Buffer.from(body.img, 'base64')//.toString('ascii')
    let username = body.username
    var arrByte = Uint8Array.from(buff)
    
    //console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
    var params = {
        Image: {Bytes: arrByte},
        //CollectionId: collectionID
    };
    return rekognition.detectFaces(params).promise().then((data)=> {
        console.log("Detection result from rekognition:\n", util.inspect(data, {depth: 5}));
        if (data.FaceDetails.length != 1) {
            throw new Error("Detected " + data.FaceDetails.length + " faces in the photo.");
        }
        if (data.FaceDetails[0].Sunglasses && data.FaceDetails[0].Sunglasses.Value === true){
            throw new Error("Face is wearing sunglasses");
        }
        var detectedFaceDetails = data.FaceDetails[0];
        return detectedFaceDetails;
    })
    .then((detectedFaceDetails)=>{
        var params = {
            Image: {Bytes: arrByte},
            CollectionId: collectionID,
            FaceMatchThreshold: 70.0,
            MaxFaces: 3
        };
        return rekognition.searchFacesByImage(params).promise().then(data => {
            if (data.FaceMatches.length > 0) {
                throw new Error("Face in the picture is already in the system.");
            }
            return detectedFaceDetails
        })
    })
    .then((detectedFaceDetails)=>{
        var params = {
            Image: {Bytes: arrByte},
            CollectionId: collectionID,
        };
        return rekognition.indexFaces(params).promise().then(data => {
            var face = data['FaceRecords'][0]['Face']
            return face;
        })
    })
    .then((face)=>{
        console.log("Reading input from event:\n", util.inspect(face, {depth: 5}));

        const dynamoItem = {
            Username: username
        };
    
        dynamoItem['faceId'] = face['FaceId'];
        return docClient.put({
            TableName: tableName,
            Item: dynamoItem
            // uncomment below if you want to disallow overwriting if the user is already in the table
            //   ,ConditionExpression: 'attribute_not_exists (Username)'
        }).promise().then(data => {
            return response(null, "User created");
        })
    })
    .catch( err=> {
        console.log(err);
        if (err.code === "ImageTooLargeException"){
            return response(new Error(err.message));
        }
        if (err.code === "InvalidImageFormatException"){
            return response(new Error("Unsupported image file format. Only JPEG or PNG is supported"));
        }
        return response(err);
    });
};
