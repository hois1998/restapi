// post_video_data.js
const AWS = require('aws-sdk');
const awsConfig = require('/home/ubuntu/rest_api/DynamoDB_Functions/node_modules/aws-sdk/AWS.config');
AWS.config.update(awsConfig);

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = function (num, lecAndDate, mac, s3_location) {
  try {
    const params = {
      TableName: "video_data",
      Item: {
        "Student Number": num,
        "Lecture": lecAndDate,
        "MAC Address": mac,
        "File Location": s3_location
      }
    };

    docClient.put(params, (err, data) => {
      if (err) {
        throw new Error(err);
      }
    });

    return 'success';
  } catch (err) {
    return err;
  }
}
