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

async function getData(num, lecAndDate, mac) {
  try {
    const lecAndDateAndMac = lecAndDate+'_'+mac;
    const params = {
      TableName: "video_data",
      Key: {
          "Student Number": num,
          "Lecture": lecAndDateAndMac,
      }
    };

    let result = await docClient.get(params).promise();

    if (result instanceof Error) {
      throw result;
    }

    return result.Item;
  } catch(err) {
    console.log('get_video_data.js\n'+err);
    return err;
  }
};

 /*(async function() {
   let temp = await getData('2016-11111', 'sample_20210313_1');
   console.log(temp);
 })();*/

module.exports = getData;
