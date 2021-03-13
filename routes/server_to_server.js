const express = require('express');
const { exec, execSync } = require("child_process");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const fs = require('fs');

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const login_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/login_mysql");
const add_exam_data_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/add_exam_data_mysql");

const dir = '/home/ubuntu/dir.txt';

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");
  
  let input = fs.readFileSync('/home/ubuntu/dir.txt').toString().trim();
  console.log(input);
  try {
    const {dir} = req.body;

    if (dir) {
      let input = fs.readFileSync(dir).toString().trim();
      console.log(input);
      res.send(input);
    }
     else {
      
    }
    
    console.log('��');
  } catch (err) {
  }
  //   const {lec, test, testdate, starttime, endtime} = req.body;
  //   const tablename = lec+'_'+test+'_'+testdate+'_'+starttime+'_'+endtime;
  //   const lec_id = lec + "." + test + "_" + testdate; //�� �ʿ�����?
  //
  //   const faculty_information = await login_mysql(mail_address, PW);
  //   if (faculty_information instanceof Error) {
  //     throw faculty_information;
  //   }
  //
  //   let lec_id_max = 8;
  //   let lec_num = 1;
  //   console.log('faculty_information\n----------------\n\n'+faculty_information);
  //
  //   for(let i=1; i<=lec_id_max; ++i) {
  //     let temp_faculty_information = faculty_information["lec_id"+i];
  //     if (temp_faculty_information == 'null' || temp_faculty_information == null)
  //     {
  //       lec_num = i;
  //       break;
  //     }
  //     // console.log('temp_faculty_information', temp_faculty_information, typeof(temp_faculty_information));
  //   }
  //
  //   console.log('add_exam_data', mail_address, PW, lec, test, testdate, starttime, endtime, tablename, lec_num, lec_id);
  //   const result = await add_exam_data_mysql(mail_address, PW, lec, test, testdate, starttime, endtime, tablename, lec_num, lec_id);
  //   if (result instanceof Error) {
  //     throw result;
  //   }
  //   // a@snu.ac.kr 12 qerwe werwr 20210214 0350 0211 qerwe_werwr_20210214_0350_0211 6 qerwe.werwr_20210214
  //   res.send('add exam data success');
  //
  // } catch (err) {
  //   console.log(err);
  //   res.send(err.message);
  // }
});

module.exports = app;
