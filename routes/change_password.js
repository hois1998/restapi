const express = require('express');
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/secret_key");
const change_password_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/change_password_mysql');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const mail_address = req.body.mail_address;
    const PW = req.body.PW;

    if (mail_address == undefined || PW == undefined) {
      throw new Error('user omits information');
    }

    const result = await change_password_mysql(mail_address, PW);

    if (result instanceof Error) {
      throw result;
    } else {

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
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }

});

module.exports = app;
