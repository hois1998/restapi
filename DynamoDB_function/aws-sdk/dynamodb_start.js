// dynamodb_start.js
var AWS = require('aws-sdk');
var config = require('./AWS.config.js');

AWS.config.update(config);

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "Food"
//var itemname = process.argv[2];
const params = {
        TableName: tableName,
        Item: {
            "type": "Western",
            "name": "TestFood",
            "price": 12000,
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
