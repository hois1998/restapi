const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const login_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/login_mysql");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');
  
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, secretObj.secret);

    const mail_address = decoded.mail_address;
    const PW = decoded.Password;

    const faculty_information = await login_mysql(mail_address, PW);

    let max_lec_id = 8;
    let lec_id = '';
    for (let i=1; i<=max_lec_id; ++i) {
      if (faculty_information['lec_id'+i] != null && faculty_information['lec_id'+i] != 'null') {
        if (i != 1) {
          lec_id += '^';
        }
        lec_id += faculty_information['lec_id'+i];
      } else break;
    }

    console.log('lec_id output:');
    console.log(lec_id);

    res.send(lec_id);
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});


module.exports = app;
