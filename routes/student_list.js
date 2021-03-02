const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/secret_key");
const student_list_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/student_list_mysql');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try {
    const {tablename, token, supervNum} = req.body;
    if (tablename == undefined || token == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);

    const result = await student_list_mysql(tablename);
    if (result instanceof Error) {
      throw result;
    }
    let returnStr = '';

    for (let i=0; i<result.length; i +=2) {
      returnStr += result[i].id+','+result[i].name+','+result[i].supervNum;
      if (i != result.length-1 && i != result.length-2) {
        returnStr += '^';
      }
    }

    console.log('returnStr:');
    console.log(returnStr);

    res.send(returnStr);
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
