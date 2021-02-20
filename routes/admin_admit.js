const express = require('express');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/secret_key");
const sign_up_mysql2 = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/sign_up_mysql2');

let app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const mail_address = req.body.mail_address;
    if (mail_address == undefined) throw new Error('user omits information');

    const result = await sign_up_mysql2(mail_address);

    if (result instanceof Error) {
      throw result;
    } else {
      res.send(result);
    }
  } catch(err) {
    console.log(err);
    res.send(err);
  }


});

module.exports = app;
