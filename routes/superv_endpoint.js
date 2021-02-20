const express = require('express');
const { exec, execSync } = require("child_process");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/secret_key");
const find_streamkey_on_tablename_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/find_streamkey_on_tablename_mysql");
const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/routes/rtmp_live_url");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {supervNum, tablename, token} = req.body;
    const decoded = jwt.verify(token, secretObj.secret);

    if (tablename == undefined || supervNum == undefined) {
      throw new Error('user omits information');
    }

    let streamkey_list = await find_streamkey_on_tablename_mysql(tablename, supervNum);
    if (streamkey_list instanceof Error) {
      throw streamkey_list;
    }
    let streamkey_list_final = streamkey_list.map(i => {
      if (i == 'null') return i;
      return rtmp_live_url+i;
    }).join('^');
    res.send(streamkey_list_final);

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
//     var files = fs.readdirSync(dir);
//
//     var lec_id = req.body.lec_id;
//     var supervNum = req.body.supervNum;
//
//     let endlec = lec_id.indexOf("."); //10
//     let lec = lec_id.substring(0, endlec);
//
//     let endtest = lec_id.indexOf("_");	//20
//     let test = lec_id.substring(endlec+1, endtest);	//midterm_20210108
//
//     let testdate = lec_id.substring(endtest+1);
//
//     let token = req.body.token;
//     let decoded = jwt.verify(token, secretObj.secret);
//
//     exec("node ./mysql_function/exam_activation_mysql.js 1 " + lec + " " + testdate);
//
//     var endpoints = "";
//
//     function delay() {
//       return new Promise(function(resolve, reject){
//         setTimeout(function(){
//           resolve();
//         }, 100)
//       })
//     }
//
//     async function test1() {
//     console.log(files.length);
//       for(var i = 0; i < files.length; i++){
//         var file = files[i];
//
//         var startindex = file.indexOf("_");
//         var suffix = file.substr(startindex + 1);
//
//         console.log(suffix);
//
//         if (suffix == lec_id + "_" + supervNum + ".txt"){
//             fs.readFile(dir + file, function(err, buf){
//                 var str2 = buf.toString().replace(/(\r\n\t|\n|\r\t)/gm,"");
//                 endpoints += str2 + " ";
//                 console.log("endpoint:" + endpoints);
//
//
//             });
//
//         }
//         await delay();
//         //fs.writeFile(dir + file, str2.slice(0, -2) + "_0");
//       }
//       setTimeout(function() {
//           for (var j = 0; j < files.length; j++){
//               let file = files[j];
//
//               var startindex = file.indexOf("_");
//               var suffix = file.substr(startindex + 1);
//
//               console.log(suffix);
//
//
//
//               if (suffix == lec_id + "_" + supervNum + ".txt"){
//                   var strtemp = fs.readFileSync(dir + file);
//                     let str3 = strtemp.toString().replace(/(\r\n\t|\n|\r\t)/gm,"");
//                     fs.writeFileSync(dir + file, str3.slice(0, -2) + "_0");
//
//               }
//
//           }
//       }, 100);
//       if (decoded) {
//           if(endpoints == ""){
//               res.send("null");
//           }
//           else{
//               res.send(endpoints.slice(0, -1));
//           }
//       }
//       else {
//           res.send('Invalid token');
//       }
//     }
//     test1();
//
//
// });

module.exports = app;
