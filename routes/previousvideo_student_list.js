const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const specify_lec_mysql3 = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql3");
const student_list_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/student_list_mysql');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try {
    const {lec, testdate, test, token} = req.body;
    if (lec == undefined || testdate == undefined || test == undefined || token == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);

    const tablename = await specify_lec_mysql3(testdate, lec, test);

    const result = await student_list_mysql(tablename);
    console.log(result);
    let returnStr = '';

    for (let i=0; i<result.length; i += 3) {
      if (result[i].streamkey != null && result[i].streamkey != 'null') {
        if (returnStr.length > 0) returnStr += '^';
        returnStr += result[i].id+','+result[i].name+','+result[i].supervNum;
      }
    }

    console.log('returnStr:');
    console.log(returnStr);

    res.send(returnStr);
  } catch (err) {
    console.log(err);
    return err.message;
  }
});


module.exports = app;
