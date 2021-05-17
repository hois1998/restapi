//this code is for student clients
//after do Identification step and get metadata of exam to take, next step is to get rtmp endpoint to publish media
//and this code is to return endpoint depending on mac, num, lec_id, student name

//lec_id를 tablename으로 바꾸자
//서버 ip주소를 제각각 바꿔주는 작업을 추가해야 한다.
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// const specify_lec_mysql3 = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql3");
// const return_streamkey_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/return_streamkey_mysql");
const student_list_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/student_list_mysql");
const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/rtmp_live_url");
const video_record = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/routes/video_record");

// const dir = '/home/ubuntu/dir.txt';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try {
    const {num, name, tablename, mac} = req.body;  //lec_id를 바꾸자.
    if (num == undefined || name == undefined || tablename == undefined || mac == undefined) {
      throw new Error('user omits information');
    }

    let starttime = tablename.split('_')[3];  //tablename: logicdesign_midterm_20210101_1200_1315
    let start = parseInt(starttime.slice(0,2))*60+parseInt(starttime.slice(0,2))

    const student = await student_list_mysql(tablename, null, num);
    if (student instanceof Error) {
      throw student;
    }

    let id, supervNum, streamkey = {};

    //if mac === '1', then return streamkey about mac 2, which is endpoint for pc display
    if (mac === '1') {
      for (let items of student) {
        if (items.mac == '1' || items.mac == '2') {
          streamkey[items.mac] = items.streamkey;
        }
      }
    } else {
      for (let items of student) {
        if (items.mac == mac) {
          streamkey[items.mac] = items.streamkey;
          break;
        }
      }
    }

    let rtmpEndpoint = {};
    for (let key in streamkey) {
      rtmpEndpoint[key] = rtmp_live_url + streamkey[key];
    }

    res.send(rtmpEndpoint);


  } catch(err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
