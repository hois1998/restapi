const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const delete_student_data_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/delete_student_data_mysql");
const login_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/login_mysql");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');
  try {
    const {tablename, num, token} = req.body;
    if (tablename == undefined || token == undefined || num == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);  //check whether token is valid or not

    const result = await delete_student_data_mysql(tablename, num);
    if (result instanceof Error) {
      throw result;
    }

    res.send('successfully delete student('+num+') from table: '+tablename);

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
