const express = require('express');
//let router = express.Router();
const jwt = require("jsonwebtoken");
const { execSync } = require("child_process");
const bodyParser = require('body-parser');

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/secret_key");
const login_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/login_mysql');

let app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

app.post('/',async function(req, res, next) {
  const mail_address = req.body.mail_address;
  const PW = req.body.PW;

  const faculty_information_row = await login_mysql(mail_address, PW);

  if (faculty_information_row != undefined){
    if (PW == "temp_password") res.send("Change Password!");
    else {
      const token = jwt.sign({
      mail_address: mail_address,
      Password: PW
      },
      secretObj.secret ,
      {
        expiresIn: '60m'
      });
      res.send(token);
    }
  } else {
    res.send("email or password wrong");
  }
});

module.exports = app;
