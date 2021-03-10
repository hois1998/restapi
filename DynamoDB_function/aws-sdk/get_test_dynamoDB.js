const AWS = require('aws-sdk');
const awsConfig = require('/home/ubuntu/rest_api/DynamoDB_Functions/node_modules/aws-sdk/AWS.config');

AWS.config.update(awsConfig);

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

async function getData(num, lecAndDate) {
  try {
    const params = {
            TableName: "video_data",
            Key: {
                "Student Number": num,
                "Lecture": lecAndDate,
            }
    };

    let result = await docClient.get(params).promise();
    console.log('dynamoDB result', result);
    return result.Item;
  } catch(err) {
    return err;
  }
};

// (async function() {
//   let temp = await getData('2021-11111', 'chemistry1_20210213');
//   console.log(temp);
// })();

module.exports = getData;
