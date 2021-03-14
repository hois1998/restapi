const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const updateObjAcl = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/aws_function/s3_updateObjAcl');
//update s3 objects in specific dir to become public-read or private by supervisor clients
//if it returns 1, means no error and returns 0, means error ouccur
const get_video_data = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/DynamoDB_function/aws-sdk/get_video_data");
const BUCKET = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/bucket');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {	//youngho change function to async to use await syntax
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {num, lec, token, mac} = req.body;  //mac is updated on 20210310
    if (num ==undefined || lec == undefined) {
      throw new Error('user omits information');
    }

    const lecAndDate = lec; //for here, lec is not lecture name but lecture+date like chemistry_20210101

    const decoded = jwt.verify(token, secretObj.secret);

    let result = await get_video_data(num, lecAndDate, mac);
    if (result instanceof Error) {
      throw result;
    }
    console.log('DynamoDB result\n'+JSON.stringify(result));
    const fileLocation = result['File Location'];

    console.log('fileLocation', fileLocation);

    let check = await updateObjAcl('public', fileLocation);
    let base = path.basename(fileLocation);

    if (check == 1) {	//which means correclty worked
        let url = "https://" + BUCKET + ".s3.ap-northeast-2.amazonaws.com/" +fileLocation + '/'+ base+ '.m3u8';

        res.send(url);
    } else {
      throw new Error('something went wrong when get s3 url');
    }

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
