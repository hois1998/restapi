const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const add_student_data_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/add_student_data_mysql");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");


  try {

    const {num, name, lec, test, testdate, starttime, endtime, supervNum, token} = req.body;
    if (num == undefined || name == undefined || lec == undefined || test == undefined || testdate == undefined || starttime == undefined || endtime == undefined || supervNum == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);

    const tablename = lec + "_" + test + "_" + testdate + "_" + starttime + "_" + endtime;
    const result = await add_student_data_mysql(num, name, supervNum, tablename);
    if (result instanceof Error) {
      throw result;
    }

    res.send('add studnet data success');

  } catch(err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
