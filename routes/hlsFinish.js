const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const updateObjAcl = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/aws_function/s3_updateObjAcl');
const BUCKET = ('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/bucket')


let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {	//youngho change function to async to use await syntax
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try {
    const {httpUrl, token} = req.body;
    if (httpUrl == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);

    let temp = httpUrl.split('/');
		let fileLocation = '/' + temp[4] + '/' + temp[5] + '/' + temp[6] + '/' + temp[7] + '/' + temp[8] + '/' + temp[9];

    console.log('fileLocation', fileLocation);

		let check = await updateObjAcl('private', fileLocation);

		if (check == 1) {
			res.send('success');
		} else {
			throw new Error ("the httpUrl you sent is undefined on s3\n");
		}
  } catch (err) {
    console.log(err);
    res.send(err);
  }

});

module.exports = app;
