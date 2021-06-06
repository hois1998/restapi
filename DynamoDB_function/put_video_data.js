// post_video_data.js
const AWS = require('aws-sdk');
const {KEY, SECRET} = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/aws_config');

AWS.config.update({
  region: 'us-east-2',
  endpoint: 'http://dynamodb.us-east-2.amazonaws.com',
  accessKeyId: KEY,
  secretAccessKey: SECRET
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = async function (num, lecAndDate, mac, s3_location) {
  try {
    const lecAndDateAndMac = lecAndDate+'_'+mac;
    const params = {
      TableName: "video_data",
      Item: {
        "Student Number": num,
        "Lecture": lecAndDateAndMac,
        "File Location": s3_location
      }
    };

    let result = docClient.put(params).promise();

    if (result instanceof Error) {
      throw result;
    }

    return 'successfully uploaded video metadata';
  } catch (err) {
    console.log('post_video_data\n'+err);
    throw err;
  }
}
