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
    var body = JSON.parse(event.body);
    let buff = Buffer.from(body.img, 'base64')//.toString('ascii')
    var arrByte = Uint8Array.from(buff)
    
    //console.log("Reading input from event:\n", util.inspect(event, {depth: 5}));
       var params = {
            Image: {
                 Bytes: arrByte
            },
            CollectionId: collectionID
        };
    var name = "Warning! Unauthorized person!"    
    
    await rekognition.searchFacesByImage(params).promise().then(data => {
        console.log(data);
        if (data.FaceMatches.length > 0) {
            console.log(data);
            var foundId = data.FaceMatches[0].Face.FaceId
            console.log("Found: ", foundId)
            
            var params = {
                TableName : tableName,
                FilterExpression: "#fid = :faceId",
                ExpressionAttributeNames:{
                    "#fid": "faceId"
                },
                ExpressionAttributeValues: {
                    ":faceId": foundId
                }
            };
            return docClient.scan(params).promise().then((data) => {
                data.Items.forEach(function(item) {
                    name = "Hello " + item.Username
                });
            });
        } else {
            console.log("NO MATCH");
        }
    }).catch(err => {
        console.log("ERROR!!!", err)
    });

    const response = {
         statusCode: 200,
         body: JSON.stringify(name),
    };
    return response;
};
