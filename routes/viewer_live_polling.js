const express = require('express');
const { exec, execSync } = require("child_process");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const login_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/login_mysql");
const add_exam_data_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/add_exam_data_mysql");


let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {tablename, supervNum, token} = req.body;
    // const decoded = jwt.verify(token, secretObj.secret);

    //for test, ignore token
    if (!tablename || !supervNum || /*!token*/) {
      throw new Error('user omits information');
    }

    let objects = {face: {}, object: {}};

    let face_temp, object_temp;
    //check face
    if(fs.existsSync(`/media/polling/face_${tablename}_${supervNum}.txt`)) {
      face_temp =fs.readFileSync(`/media/polling/face_${tablename}_${supervNum}.txt`).split('\n').trim();

      fs.unlinkSync(`/media/polling/face_${tablename}_${supervNum}.txt`);

      let face_temp_temp = {};

      for (let id_faceErr of face_temp) {
        let [id, faceErr] = id_faceErr.split('_');
        face_temp_temp[id] = faceErr
      }

      objects['face'] = face_temp_temp;

    }

    //check objects
    if(fs.existsSync(`/media/polling/object_${tablename}_${supervNum}.txt`)) {
      object_temp =fs.readFileSync(`/media/polling/object_${tablename}_${supervNum}.txt`).split('\n').trim();

      fs.unlinkSync(`/media/polling/object_${tablename}_${supervNum}.txt`);

      let object_temp_temp = {};

      for (let id_objErr of object_temp) {
        let [id, objErr] = id_objErr.split('_');
        object_temp_temp[id] = objErr;
      }

      objects['object'] = object_temp_temp;
    }

    res.send(JSON.stringify(objects));

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
