//this code is for give list of today and future tests which are displayed
//on main page of viewer client program
//response tablename_lists
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const login_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/login_mysql");
const specify_lec_mysql3 = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql3");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const token = req.body.token;
    if (token == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);

    const mail_address = decoded.mail_address;
    const PW = decoded.Password;

    const faculty_information = await login_mysql(mail_address, PW);

    let date_ob = new Date();
    console.log(faculty_information);
    console.log(`superv_endpoint_pre date ${date_ob}`);

    let day = ("0" + date_ob.getDate()).slice(-2);  // adjust 0 before single digit date
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month
    let year = date_ob.getFullYear();     // current year
    let date = year + month + day;  // prints date in YYYYMMDD format
    console.log('date obj', date);
    let today_lec_id = [];
    let max_lec_id = 8;

    for (let i=1; i<=max_lec_id; ++i) {
      let lec_id = faculty_information['lec_id'+i];

      if (lec_id != null && lec_id != 'null') {
        console.log('passing');
        //lec_id: lec_0301.midterm_20210310
        let [lec, test] = lec_id.split('_')[0].split('.');  //['logicdesign', 'midterm']
        let testdate = lec_id.split('_')[1];  //20210202
        console.log(`testdate ${parseInt(testdate)} and ${parseInt(date)}`)
        if (parseInt(testdate) >= parseInt(date)) { //don't compare specific start time and end time but only comapre date of current
          today_lec_id.push([testdate, lec, test]);
        }
      } else break;
    }

    let tablename_list = '';


    let i = 0;

    for (let [date, lec, test] of today_lec_id) {
      if (i == 1) tablename_list += '^';

      let tablename = await specify_lec_mysql3(date, lec, test);
      console.log('tablename', tablename);
      tablename = tablename.split('_');
      tablename[3] = tablename[3].slice(0,2) + '_' + tablename[3].slice(2,4);
      tablename[4] = tablename[4].slice(0,2) + '_' + tablename[4].slice(2,4);
      let result = tablename.join('.');
      tablename_list += result;
      i = 1;
    }

    console.log('tablename_list', tablename_list);

    res.send(tablename_list);


  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
