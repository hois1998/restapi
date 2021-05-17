//this code is for student clients.
//when students pc cam detect suspicious person who is not exptected student while taking exam, it send the error data to server
const express = require('express');
const bodyParser = require('body-parser');

const add_face_recognition_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/add_face_recognition_mysql");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try { //mac is dendine as follow: 0 for phone, 1 for pc webcam, 2 for pc display
    const {num, name, tablename, mac, degree, detectTime} = req.body;
    if (num == undefined || name == undefined || tablename == undefined || mac == undefined || degree == undefined || detectTime == undefined) {
      throw new Error('user omits information');
    }

    let errorJson = {};
    errorJson[detectTime] = {degree: degree};

    console.log('errorJson\n', errorJson);

    let result = await add_face_recognition_mysql(num, tablename, mac, errorJson);

    if (result == 'success') {
        res.send('success');
    } else {
      throw new Error('err occur on add_face_recognition_mysql');
    }
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
