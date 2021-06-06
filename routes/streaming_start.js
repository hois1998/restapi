// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
//
// const specify_lec_mysql3 = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql3");
// // const return_streamkey_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/return_streamkey_mysql");
// const student_list_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/student_list_mysql");
// const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/rtmp_live_url");
// const video_record = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/routes/video_record");
//
// const dir = '/home/ubuntu/dir.txt';
// const app = express();
//
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
//
// app.post('/', async function(req, res, next) {
//   console.log('req body:');
//   console.log(req.body);
//   console.log('\n--end req body--\n');
//
//   try {
//     const {num, name, lec_id, mac} = req.body;
//     if (num == undefined || name == undefined || lec_id == undefined || mac == undefined) {
//       throw new Error('user omits information');
//     }
//
//     let endlec = lec_id.indexOf(".");
//     let lec = lec_id.substring(0, endlec);	//logicdesign
//
//     let endtest = lec_id.indexOf("_");
//     let test = lec_id.substring(endlec+1, endtest);	//midterm
//
//     let testdate = lec_id.substring(endtest+1);
//
//     const tablename = await specify_lec_mysql3(testdate, lec, test);
//     if (tablename instanceof Error) {
//       throw tablename;
//     }
//
//     let starttime = tablename.split('_')[3];
//     let start = parseInt(starttime.slice(0,2))*60+parseInt(starttime.slice(0,2))
//
//     const student = await student_list_mysql(tablename, null, num);
//     if (student instanceof Error) {
//       throw student;
//     }
//
//     let id, supervNum, streamkey;
//
//     for (let items of student) {
//       if (items.mac == mac) {
//         id = items.id;
//         supervNum = items.supervNum;
//         streamkey = items.streamkey;
//         break;
//       }
//     }
//
//     //fs.appendFileSync(dir, `${tablename}^${supervNum}^${streamkey}\n`);
//
//     // console.log('item of mac:', mac);
//     // console.log(id, supervNum, streamkey);
//     // res.send('out of exam time');
//     // res.send('success');
//
//     console.log('last check', tablename, supervNum, streamkey);
//     setTimeout(async () => {/*
//       let record_done = await video_record.startFfmpeg(tablename, supervNum, streamkey);
//       if (record_done instanceof Error) {
//         console.log(record_done);
//         res.send(record_done.message);
//         // fs.appendFileSync('/error.log', `on return_endpoint.js \n${record_done}\n`); //
//       } else if (record_done == 0) {
//         console.log('out of exam time');
//         res.send('out of exam time');
//       } else {
//         console.log('aaaaaa');
//         // res.send('success');
//       }
//     */}, 3000);
//
//
//   } catch(err) {
//     console.log('bb');
//     console.log(err);
//     res.send(err.message);
//   }
// });
//
// module.exports = app;
