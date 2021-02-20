const express = require('express');
const { exec, execSync } = require("child_process");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/secret_key");
const delete_exam_data_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/delete_exam_data_mysql");
const login_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/login_mysql");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  try {
    const {tablename, token} = req.body;
    if (tablename == undefined || token == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);
    const mail_address = decoded.mail_address;
    const PW = decoded.Password;

    const [lec, test, date, starttime, endtime] = tablename.split('_');
    const lec_id_input = lec+'.'+test+'_'+date;
    console.log('lec_id_input', lec_id_input);
    const faculty_information = await login_mysql(mail_address, PW);
    if (faculty_information instanceof Error) {
      throw faculty_information;
    }

    let idx;
    console.log('faculty_information', faculty_information);
    for (let i=1;;++i) {
      let lec_id = faculty_information['lec_id'+i];
      if (lec_id == null) {
        throw new Error('cannot find lec_id');
      }

      if (lec_id == lec_id_input) {
        idx = i;
        break;
      }
    }

    let result = await delete_exam_data_mysql(tablename, lec_id_input, idx, mail_address);

    res.send("delete "+tablename+" success");

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
//     let token = req.body.token;
//     let decoded = jwt.verify(token, secretObj.secret);
//
//     let decoded_token = jwt_decode(token);
//     let decoded_token_arr = JSON.stringify(decoded_token).split('"');
//
//     let mail_address = decoded_token_arr[3];
//     let PW = decoded_token_arr[7];
//
//     let index = 100;
//
//     var lec_id = req.body.lec_id;
//
//     var endlec = lec_id.indexOf("."); //10
//     var lec = lec_id.substring(0, endlec);	//logicdesign
//
//     var endtest = lec_id.indexOf("_");	//20
//     var test = lec_id.substring(endlec+1, endtest);	//midterm_20210108
//
//     var testdate = lec_id.substring(endtest+1);
//
//     let tablenamearr_fake = execSync("node ./mysql_function/specify_lec_mysql3.js " + testdate + " " + lec + " " + test);
//
//     let tablenamearr = String(tablenamearr_fake).split("'");
//
//     let tablename = tablenamearr[1];
//
//     let result_fake = execSync("node ./mysql_function/login_mysql.js " + mail_address + " " + PW);
//     let resultarr = String(result_fake).split("'");
//
//     let number = (resultarr.length - 5) / 2;
//
//     //console.log(tablename);
//     console.log(number);
//
//
//     if (decoded && typeof tablename != "undefined") {
//             function delay() {
//               return new Promise(function(resolve, reject){
//                 setTimeout(function(){
//                   resolve();
//                 },100)
//               })
//             }
//             async function test1(resultarr) {
//
//                 for(let k=0; k < number; k++){
//                     await delay();
//                     if (resultarr[2*k + 5] == lec_id) {
//                         index = k + 1;
//                         break;
//                     }
//                 }
//                 setTimeout(function(){
//                     for(let i=index; i < number + 1; i++){
//                         if (i == number){
//                             exec("node ./mysql_function/delete_exam_data_mysql3.js " + mail_address + " " + String(i));
//                         }
//                         else {
//                             exec("node ./mysql_function/delete_exam_data_mysql2.js " + mail_address + " " + String(i) + " " + resultarr[2*i + 5]);
//                         }
//
//                     }
//                 }, 10);
//                 setTimeout(function(){
//                     exec("node ./mysql_function/delete_exam_data_mysql.js " + tablename);
//                 }, 100);
//                 setTimeout(function(){
//                     res.send("Exam Data Deleted");
//                 }, 1000);
//             }
//             test1(resultarr);
//     }
//     else {
//         res.send('error');
//     }
// });

module.exports = app;
