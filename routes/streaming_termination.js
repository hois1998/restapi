const express = require('express');
const bodyParser = require('body-parser');
const {execSync} = require('child_process');
const fs = require('fs');

const specify_lec_mysql3 = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql3");
const post_video_data = require('/home/ubuntu/rest_api/DynamoDB_Functions/node_modules/aws-sdk/post_video_data');
const return_streamkey_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/return_streamkey_mysql');
const Identification_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/Identification_mysql");

const homedir = '/media';
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {num, lec_id, name, mac} = req.body; //�ٵ� lec_id�� �ʿ����� �� ����.
    //2020-12345
    //logicdesign.midterm_20210108
    //logicdesign_midterm_20210108_1400_1530
    //1.1.1.1

    if (num == undefined || lec_id == undefined || name == undefined || mac == undefined) {
      throw new Error('user omits information');
    }

    let endlec = lec_id.indexOf(".");
    let lec1 = lec_id.substring(0, endlec);	//logicdesign

    let endtest = lec_id.indexOf("_");
    let test1 = lec_id.substring(endlec+1, endtest);	//midterm

    let testdate1 = lec_id.substring(endtest+1);

    const tablename = await specify_lec_mysql3(testdate1, lec1, test1);
    if (tablename instanceof Error) {
      throw tablename;
    }
    console.log('tablename', tablename);
    const [lec, test, date, starttime, endtime] = tablename.split('_');
    const lecAndDate = lec+'_'+date;
    const time = starttime+'_'+endtime;
    const streamkey = await return_streamkey_mysql(tablename, num, mac);

    console.log('streamkey', streamkey);
    const supervNum = (await Identification_mysql(num, tablename, mac)).supervNum;
    console.log('supervNum', supervNum);
    const s3_location = '/'+date+'/'+lec+'/'+time+'/'+supervNum+'/'+streamkey;

    console.log(num, lecAndDate, mac, s3_location);

    let postResult = post_video_data(num, lecAndDate, mac, s3_location);
    if (postResult instanceof Error) {
      throw postResult;
    }

    //check whether exam end or not
    //���� ���� �ð����� ���� ���ᰡ �νĵǸ� s3�� ���ε� ���� �ʰ� �ִٰ� �����ð� ������ ���ε� �ϱ�
    const endHour = parseInt(endtime.slice(0,2));
    const endMin = parseInt(endtime.slice(2,4));
    const end = endHour*60+endMin;
    // let input = loc.split('/');
    let cnt = 0;
    let one = 1;  //
    let upload = setInterval(() => {
      let now = (new Date().getHours())*60 + new Date().getMinutes();

      if (now >= end+1) {  //now >= end
        execSync('sh /var/hls/on_upload.sh' + ' ' + streamkey + ' ' + lec + ' ' + time + ' ' + supervNum);

        clearInterval(upload);
      } else {
        console.log('cnt', cnt, "streamkey", streamkey, 'now and end', now, end);
        cnt++;
        // if (one == 1) {
        //   console.log('passed!! one is 1');
        //   // res.send('POST SUCCESS but you ended test before endtime!');
        //   one = 0;
        // }
      }
    }, 2000);

    res.send('POST will start soon');

  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
//     let date_ob = new Date();
//
//
//     let day = ("0" + date_ob.getDate()).slice(-2);  // adjust 0 before single digit date
//
//     // current month
//     let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
//
//     // current year
//     let year = date_ob.getFullYear();
//
//     // prints date in YYYY-MM-DD format
//     let time = year + month + day;
//
//     let endlec = lec_id.indexOf("."); //10
//     let lec = lec_id.substring(0, endlec);	//logicdesign
//
//     let endtest = lec_id.indexOf("_");	//20
//     let test = lec_id.substring(endlec+1, endtest);	//midterm_20210108
//
//     let testdate = lec_id.substring(endtest+1);	//20210108
//
//     let lec_real = lec + "_" + testdate;	//logicdesign_20210108
//
//     let examTime = tablename.substring(tablename.length-9, tablename.length);	//1400_1530
//
//
//
//     exec("node ./mysql_function/Identification_mysql.js " + num + " " + tablename, (error, stdout, stderr) => {
//         // if (error) {
//         //     console.log(`error: ${error.message}`);
//         //     return;
//         // }
//         // if (stderr) {
//         //     console.log(`stderr: ${stderr}`);
//         //     return;
//         // }
//         // else {
//         //     console.log(`stdout: ${stdout}`);
//         //     if (stdout.length < 5){
//         //         res.send('error');
//         //     }
//             else {
//
//                 let startd = stdout.indexOf("supervNum: '");
//                 let supervNum = stdout.substring(startd+12, startd+13);
//
//                 let endpoint = fileread.file_read(num, lec_id, supervNum);
//                 //let startstreamkey = lec_id.indexOf("channel1/");
//                 let streamkey = endpoint.substring(29);
//
//                 loc = "/" + testdate + "/" + lec + "/" + examTime + "/" + supervNum + "/" + streamkey.slice(0, -2);
//
//                 exec("node ../../DynamoDB_Functions/node_modules/aws-sdk/post_video_data.js " + num + " " + lec_real + " " + test + " " + time + " " + mac + " " + loc, (error, stdout, stderr) => {
//                     if (error) {
//                         console.log(`error: ${error.message}`);
//                         return;
//                     }
//                     else if (stderr) {
//                         console.log(`stderr: ${stderr}`);
//                         return;
//                     }
//                     else {
//                         //check whether exam end or not
//                         //���� ���� �ð����� ���� ���ᰡ �νĵǸ� s3�� ���ε� ���� �ʰ� �ִٰ� �����ð� ������ ���ε� �ϱ�
//                         let endHour = parseInt(examTime.substring(5,7));
//                         let endMin = parseInt(examTime.substring(7,9));
//                         let end = endHour*60+endMin;
//                         let input = loc.split('/');
//
//                         let upload = setInterval(() => {
//                           let now = (new Date().getHours())*60 + new Date().getMinutes();
//                           let one = 1;
//                           if (loc.length == 0) { //youngho
//                             res.send('error loc length is 0');
//                             clearInterval(upload);
//                           } else {
//                             if (true) {  //now >= end
//                               let temp = streamkey.substring(0, streamkey.length-2);
//                               console.log(temp+input[2]+input[3]+input[4]);
//                               execSync('sh /var/hls/on_upload.sh' + ' ' + temp + ' ' + input[2] + ' ' + input[3] + ' ' + input[4]);
//
//                               res.send('POST SUCCESS');
//                               clearInterval(upload);
//                             } else {
//                               if (one == 1) {
//                                 res.send('POST SUCCESS but you ended test before endtime!');
//                                 one = 0;
//                               }
//                             }
//                           }
//                         }, 2000);
//                         return;
//                     }
//                 });
//
//             }
//             return;
//         }
//     });
// });

module.exports = app;
