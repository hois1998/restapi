// dynamodb_start.js
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2',
    endpoint: "http://dynamodb.us-east-2.amazonaws.com"
});
const dynamodb = new AWS.DynamoDB();
const tableName = "Food2"
dynamodb.deleteTable({TableName: tableName}).promise()
        .then(req => {
            console.log(req)
        })
        .catch(err => {
            console.log(err)
        })