//this code is for student clients.
//when students first try to connect to server to take exam before exam starttime, they must send command to execute this code first
const express = require('express');
const bodyParser = require('body-parser');
const fs=require('fs');

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
    const {num, name, mac} = req.body;
    if (num == undefined || name == undefined || mac == undefined) {
      throw new Error('user omits information');
    }

    let date_ob = new Date();

    let day = ("0" + date_ob.getDate()).slice(-2);  // adjust 0 before single digit date
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month
    let year = date_ob.getFullYear(); // current year
    let date = year + month + day;  // prints date in YYYYMMDD format

    let hours = date_ob.getHours();
    let mins = date_ob.getMinutes();
    const totNow = 60*hours + mins; //get current time as miniute scale

    const tablenameList = await tablename_list_mysql(date);
    if (tablenameList instanceof Error) {
      throw tablenameList;
    }

    let tablenameHavingNum = [];

    for (let tablename of tablenameList) {
      let result = await Identification_mysql(num, tablename, mac);
      if (result instanceof Error) {
        throw result;
      } else {
        if (result) {
          tablenameHavingNum.push(tablename);
        }
      }
    }

    let starttimeOfTheTable = tablenameHavingNum.map(i => {
      let starttime = i.split('_')[3];
      let totTime = parseInt(starttime.slice(0, 2))*60 + parseInt(starttime.slice(2, 4));
      return totTime
    });

    //if starttimeOfTheTable contains more than one entries, select only one table e.g. exam metadata
    //comparing current time and exam starttime, choose the exam that has mininum value of abs(currtime-starttime)
    let abs = Math.abs(totNow - starttimeOfTheTable[0]);
    let idx = 0;
    for(let i=0; i<starttimeOfTheTable.length; ++i) {
      if (abs > Math.abs(totNow - starttimeOfTheTable[i])) {
        idx = i;
        abs = Math.abs(totNow - starttimeOfTheTable[i]);
      }
    }

    const final_tablename = tablenameHavingNum[idx];

    console.log('final_tablename', final_tablename);

    let add_streamkey = await add_streamkey_mysql(num, final_tablename, mac);

    if (add_streamkey instanceof Error) {
      throw add_streamkey;
    }

    res.send(final_tablename);
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }

});

module.exports = app;
