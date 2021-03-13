const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const updateObjAcl = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/aws_function/s3_updateObjAcl');
//update s3 objects in specific dir to become public-read or private by supervisor clients
//if it returns 1, means no error and returns 0, means error ouccur
const get_test_dynamoDB = require("/home/ubuntu/rest_api/DynamoDB_Functions/node_modules/aws-sdk/get_test_dynamoDB");
const BUCKET = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/bucket');


let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {	//youngho change function to async to use await syntax
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {num, lec, token} = req.body;
    if (num ==undefined || lec == undefined) {
      throw new Error('user omits information');
    }
    const lecAndDate = lec;

    const decoded = jwt.verify(token, secretObj.secret);
    // console.log('print');
    // console.log(get_test_dynamoDB);
    //
    // console.log('typeof', typeof(get_test_dynamoDB));

    let result = await get_test_dynamoDB(num, lecAndDate);
    if (result instanceof Error) {
      throw result;
    }
    console.log('DynamoDB result\n'+result);
    const fileLocation = result['File Location'];

    console.log('fileLocation', fileLocation);

    let check = await updateObjAcl('public', fileLocation);
    let base = path.basename(fileLocation);

    if (check == 1) {	//which means correclty worked
        let url = "https://" + BUCKET + ".s3.ap-northeast-2.amazonaws.com//media" +fileLocation + '/'+ base+ '.m3u8';

        res.send(url);
    } else {
      throw new Error('something went wrong when get s3 url');
    }

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});


//
//     var num = req.body.num;
//     var lec = req.body.lec;
//
//     let token = req.body.token;
//     let decoded = jwt.verify(token, secretObj.secret);

//     if (decoded) {
//       exec("node ../../DynamoDB_Functions/node_modules/aws-sdk/get_test.js " + num + " " + lec, async (error, stdout, stderr) => {
//           if (error) {
//               console.log(`error: ${error.message}`);
//               return;
//           }
//           if (stderr) {
//               console.log(`stderr: ${stderr}`);
//               return;
//           }
//           else {
//               console.log(`stdout: ${stdout}`);
//
//               if (stdout.length < 5){
//                 res.send('Invalid ID, PW');
//               }
//             else {	//get metadata from DB correctly without error //youngho
// 				let fileLocation = stdout.trim().split(',')[2].split(' ')[6];
//         fileLocation = fileLocation.substring(1, fileLocation.length-1);
// 		console.log('filelocation is     ', fileLocation);
//
//         //a.trim().split(',')[2].split(' ')[6];
//
// 				//fileLocation = '/20201228/young_1228_1';
//
//         let check = await updateObjAcl('public', fileLocation);
//         let base = path.basename(fileLocation);
//
// 				if (check == 1) {	//which means correclty worked
//   					let url = "https://" + BUCKET + ".s3.ap-northeast-2.amazonaws.com//media" +fileLocation + '/'+ base+ '.m3u8';
//             //e;
//   					res.send(url);
// 				} else res.send('something went wrong when get s3 url\n');
//
//
// 				//res.send(stdout.trim().split(',')[2].split(' ')[6]);
//               }
//               return;
//           }
//       });
//     }
//     else {
//         res.send('Invalid token');
//     }
// });

module.exports = app;
