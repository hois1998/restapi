//this code is for student clients.
//when students phone camera detect suspicious objects while taking exam, it send the objects data to server
const express = require('express');
const bodyParser = require('body-parser');
// const fs=require('fs');

const tablename_list_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/specify_lec_mysql"); //input: e.g. date = 20210512, output: tablename_list of array of specific date
const Identification_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/Identification_mysql");  //input: student number, tablename, mac, output: table metadata or Error instance
const add_streamkey_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/add_streamkey_mysql");  //input: student number, tablename, mac output: "success" or Error instance

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try { //mac is dendine as follow: 0 for phone, 1 for pc webcam, 2 for pc display
    const {num, name, tablename, mac, objects, detectTime} = req.body;
    if (num == undefined || name == undefined || tablename == undefined || mac == undefined || objects == undefined || detectTime == undefined) {
      throw new Error('user omits information');
    }

    let object_parsed = JSON.parse(objects);
    console.log('object_parsed\n', object_parsed);


    let errorJson = {detectTime: object}
    console.log('errorJson\n', errorJson);

    res.send('done');
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }

});

module.exports = app;
