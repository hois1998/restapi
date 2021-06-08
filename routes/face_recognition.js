//this code is for student clients.
//when students pc cam detect suspicious person who is not exptected student while taking exam, it send the error data to server
const express = require('express');
const bodyParser = require('body-parser');
const {execFile} = require('child_process');

const add_face_recognition_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/add_face_recognition_mysql");
const Identification_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/Identification_mysql");  //to get supervNum

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try { //mac is dendine as follow: 0 for phone, 1 for pc webcam, 2 for pc display
    let {num, name, tablename, mac, degree, detectTime, position} = req.body;
    if (num == undefined || name == undefined || tablename == undefined || mac == undefined || degree == undefined || detectTime == undefined || position == undefined) {
      throw new Error('user omits information');
    }

    let errorJson = {};

    position = JSON.parse(position);

    errorJson[detectTime] = {degree: degree, position: position};

    console.log('errorJson\n', errorJson);

    let result = await add_face_recognition_mysql(num, tablename, mac, errorJson);

    if (result == 'success') {
        res.send('success');
    } else {
      throw new Error('err occur on add_face_recognition_mysql');
    }

    const supervNum = (await Identification_mysql(num, tablename, mac)).supervNum;
	
	console.log(`websocket start tablename: ${tablename} and supervNum ${supervNum}`);
    //websocket을 켠다.
    execFile('node', ['/home/ubuntu/rest_api/Rest_API_Server/restapi/websocket/app.js', tablename, supervNum, JSON.stringify(errorJson)], (err, stdout, stderr) => {
      console.log(stdout);
    });

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
