const express = require('express');
const bodyParser = require('body-parser');

const sign_up_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/sign_up_mysql');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req.body');
  console.log(req.body);
  console.log('\n---end req.body---\n');

  try {
    const {ID, name, mail_address} = req.body;  //supervisor ÇÐ¹ø
    if (ID == undefined || name == undefined || mail_address == undefined) {
      throw new Error('user omits information');
    }

    let result = await sign_up_mysql(mail_address);

    if (result instanceof Error) {
      throw result;
    }

    res.send('sign up success');    
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
