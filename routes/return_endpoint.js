const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const specify_lec_mysql3 = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql3");
// const return_streamkey_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/return_streamkey_mysql");
const student_list_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/student_list_mysql");
const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/routes/rtmp_live_url");
const video_record = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/routes/video_record");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try {
    const {num, name, lec_id} = req.body;
    if (num == undefined || name == undefined || lec_id == undefined) {
      throw new Error('user omits information');
    }

    let endlec = lec_id.indexOf(".");
    let lec = lec_id.substring(0, endlec);	//logicdesign

    let endtest = lec_id.indexOf("_");
    let test = lec_id.substring(endlec+1, endtest);	//midterm

    let testdate = lec_id.substring(endtest+1);

    const tablename = await specify_lec_mysql3(testdate, lec, test);
    if (tablename instanceof Error) {
      throw tablename;
    }

    const student = await student_list_mysql(tablename, null, num);
    if (student instanceof Error) {
      throw student;
    }

    const {id, supervNum, streamkey} = student;

    let isVideoRecordingPrepared = await video_record.prepare_video_record(tablename, supervNum, streamkey);
    if (isVideoRecordingPrepared instanceof Error) {
      throw isVideoRecordingPrepared;
    }

    const rtmpEndpoint = rtmp_live_url+streamkey;
    res.send(rtmpEndpoint);

    let record_done = await video_record.startFfmpeg(tablename, supervNum, streamkey);
    if (record_done instanceof Error) {
      fs.appendFileSync('/error.log', `on return_endpoint.js \n${record_done}\n`);
    }

  } catch(err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
