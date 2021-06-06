//this code is for viewer clients
//when view send this exam_termination signal to server,
//all student's records are stopped and upload media files stored in server EBS to S3 storage
//note that rtmp streaming doesn't automatically stop
const express = require('express');
const bodyParser = require('body-parser');
const {execFileSync} = require('child_process');
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

const rtmpServerList = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/rtmpServerList');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {tablename, token} = req.body;
    const decoded = jwt.verify(token, secretObj.secret);  //if not valid, thorw error

    if (tablename == undefined || supervNum == undefined) {
      throw new Error('user omits information');
    }

    let starttime = tablename.split('_')[3];
    let startMin = parseInt(starttime.slice(0,2)) + parseInt(starttime.slice(2,4))*60;
    let nowMin = (new Date()).getHours()*60+(new Date()).getMinutes();
    if (startMin <= nowMin)
      throw new Error('you tried to end exam even before it start');
      
    for (let rtmpServerIpAddr of rtmpServerList) {
      execFileSync('curl', ['-X', 'POST', `http://${rtmpServerIpAddr}}/exam_termination`, '-d', `tablename=${tablename}`]);

      res.send('success');
    }
  } catch (err) {
    res.send(`got error ${err}`);
  }
});
