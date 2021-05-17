//streaming_termination is executed by student clients and do three things.
//1. PID exactly turn off recording: not made yet
//2. put video metadata to dynomoDB
//3. upload video data to s3 after checking whether exam is ended

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// const specify_lec_mysql3 = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql3");
const put_video_data = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/DynamoDB_function/aws-sdk/put_video_data');
const return_streamkey_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/return_streamkey_mysql');
const Identification_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/Identification_mysql");
const s3_upload_dir = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/aws_function/s3_upload_dir');
const homedir = '/media';
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {num, tablename, name, mac} = req.body;

    //2020-12345
    //logicdesign.midterm_20210108
    //logicdesign_midterm_20210108_1400_1530
    //mac is binary number. that is, if mac == 1, means webcam, if mac == 0, means smartphone

    if (num == undefined || tablename == undefined || name == undefined || mac == undefined) {
      throw new Error('user omits information');
    }

    // let endlec = lec_id.indexOf(".");
    // let lec1 = lec_id.substring(0, endlec);	//logicdesign
    //
    // let endtest = lec_id.indexOf("_");
    // let test1 = lec_id.substring(endlec+1, endtest);	//midterm
    //
    // let testdate1 = lec_id.substring(endtest+1);
    //
    // const tablename = await specify_lec_mysql3(testdate1, lec1, test1);
    // if (tablename instanceof Error) {
    //   throw tablename;
    // }

    console.log('streaming_termination.js tablename\n'+tablename);

    const [lec, test, date, starttime, endtime] = tablename.split('_');
    const lecAndDate = lec+'_'+date;
    const time = starttime+'_'+endtime;
    const streamkey = await return_streamkey_mysql(tablename, num, mac);

    console.log('streaming_termination.js streamkey\n'+streamkey);
    const supervNum = (await Identification_mysql(num, tablename, mac)).supervNum;
    console.log('streaming_termination.js supervNum\n'+supervNum);

    const s3_location = '/media'+'/'+date+'/'+lec+'/'+time+'/'+supervNum+'/'+streamkey;

    console.log('streaming_termination.js s3_location\n'+s3_location);

    //multiple post on dynamodb is okay. it cover previous same data
    let postResult = await put_video_data(num, lecAndDate, mac, s3_location);

    if (postResult instanceof Error) {
      throw postResult;
    } else {
      console.log(postResult);
    }

    //check whether exam end or not
    //and if
    const endHour = parseInt(endtime.slice(0,2));
    const endMin = parseInt(endtime.slice(2,4));
    const end = endHour*60+endMin;

    let cnt = 0;

    let upload = setInterval(async () => {
      let date = new Date();
      let now = date.getHours()*60 + date.getMinutes();

      //if now is over than endtime+1minutue, then record is finished and video_data is uploaded to s3
      if (now >= end+1) {
        let isUploadDone = await s3_upload_dir(s3_location).catch(err => {
          console.log('streaming_termination.js on setInterval\n'+err);
          return new Error('streaming_termination.js error ouccur when upload dir to s3');
        });

        if (isUploadDone instanceof Error) {
          fs.appendFileSync('/home/ubuntu/rest_api/Rest_API_Server/restapi/error.log', `${isUploadDone}\n`);
          clearInterval(upload);
        } else {
          fs.rmdirSync(s3_location, { recursive: true });
          clearInterval(upload);
        }
        //remove the uploaded dir from server
        //execSync('sh /var/hls/on_upload.sh' + ' ' + streamkey + ' ' + lec + ' ' + time + ' ' + supervNum);
      } else {
        console.log(`count setInterval: ${cnt++} and time compare: endtime${endHour}:${endMin} now ${('0' + date.getHours()).slice(-2)}:${('0'+date.getMinutes()).slice(-2)}`);
      }
    }, 10000);

    res.send('POST will start soon');

  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

module.exports = app;
