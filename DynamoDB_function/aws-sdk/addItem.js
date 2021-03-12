// dynamodb_start.js
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2',
    endpoint: "http://dynamodb.us-east-2.amazonaws.com"
});
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "Food"
const params = {
        TableName: tableName,
        Item: {
            "type": "Western",
            "name": "Carbonara",
            "price": 13000,
            "ingredients": {
                "egg": "1",
                "spaghetti": "90g",
                "garlic": "1",
                "bacon": "50g"
            }
        }
};
docClient.put(params, function(err, data) {
	if (err) {
		console.log(err); // an error occurred
	}
	else {
		console.log(data); // successful response
	}
});