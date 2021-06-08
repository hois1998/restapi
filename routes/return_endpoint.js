//this code is for student clients
//after do Identification step and get metadata of exam to take, next step is to get rtmp endpoint to publish media
//and this code is to return endpoint depending on mac, num, lec_id, student name

//서버 ip주소를 제각각 바꿔주는 작업을 추가해야 한다.
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

//rtmp_live_url이 현재는 1개 이지만 추후에 이것을 여러개로 늘려서 load balancing이 되도록 해야한다.
const student_list_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/student_list_mysql");
const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/rtmp_live_url");
const check_examDone_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/check_examDone_mysql");

const put_video_data = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/DynamoDB_function/put_video_data');
const Identification_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/Identification_mysql");  //to get supervNum



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

    const [lec, test, date, starttime, endtime] = tablename.split('_'); //tablename: logicdesign_midterm_20210101_1200_1315
    const lecAndDate = lec+'_'+date;
    const time = starttime+'_'+endtime;

    let start = parseInt(starttime.slice(0,2))*60+parseInt(starttime.slice(0,2))



    const student = await student_list_mysql(tablename, null, num);
    if (student instanceof Error) {
      throw student;
    }
    //idnetification_mysql추가하고
    //sueprvnum얻고 post video하기
	
	let examDone = 'examDone';
    //check_examDone_mysql has (tablename, streamkey, name, num, mac)
    if ((await check_examDone_mysql(tablename, null, name, num, mac).catch(e => {throw e;}))[0][examDone] != 'ready')
      throw new Error('already return endpoint before');

    let id, /*supervNum,*/ streamkey = {};

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

    const supervNum = (await Identification_mysql(num, tablename, mac)).supervNum;
    const s3_location_temp = '/media'+'/'+date+'/'+lec+'/'+time+'/'+supervNum+'/';

    ///////////////test///////////
    console.log('streaming_termination.js s3_location\n'+s3_location_temp);
    /////////////////////////////

    //multiple post on dynamodb is okay. it cover previous same data
	for (let prop in streamkey) {
		 let temp_key = streamkey[prop];
		 await put_video_data(num, lecAndDate, prop, s3_location_temp+temp_key).catch(err => {throw err;});
	}

    ///////////////test
    //console.log('vidoe post results\n', postResult);
    ////////////////////

  } catch(err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
