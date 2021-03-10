// dynamodb_start.js
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2',
    endpoint: "http://dynamodb.us-east-2.amazonaws.com"
});
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const params = {
    TableName: "Food",
    ProjectionExpression: "#name,#type,price", // 어떤 속성을 스캔할지 정함.
    FilterExpression: "price between :start_price and :end_price", // 데이터 필터링할 조건을 정함.
    ExpressionAttributeNames: {
        "#name": "name",
        "#type": "type"
    },
    ExpressionAttributeValues: {
        ":start_price": 5000,
        ":end_price": 20000
    }
}
function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON: ", JSON.stringify(err, null, 2))
    } else {
        console.log('Scan Succeeded')
        data.Items.forEach(function (food) {
            console.log(food)
        })
    }
}
docClient.scan(params, onScan)