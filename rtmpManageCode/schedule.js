//for scheduling rtmp server 'On' with respect to scheduled exam of day
//using two module: 'mysql2/promise' to retrieve exam metadata asynchronously, 'aws-sdk' to control rtmp server(ec2)

const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

//to access mysql and aws services, both require to set configuration
const AWS_config = require('/home/ubuntu/AWS_config');
const mysqlConnnectionOpt = require('/home/ubuntu/mysql_connection_option');

AWS.config.update(AWS_config.config);

const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

//exam lists are in exam_data table on mysql
let exam_table = 'exam_data';
let connection;

// set up which instance to be controled
const paramsForOnOff = {
  InstanceIds: [
    AWS_config.rtmpOnlyServer
  ],
};

const paramsForDescribeInstances = {
  InstanceIds: [
    AWS_config.rtmpOnlyServer
  ],
  IncludeAllInstances: true
};

//before access to mysqldb, connect is set in advance
async function startConnection() {

}

//return true if exam will start within 30 minutes
//consider when exam starting on tomorrow 00:01. as we will check exam every n minutes, we have to retrieve tomorrow exams as well.
async function searchDBAndIsExamExist() {
  try {
    let rtmpOnlyServerOn = false;

    connection = await mysql.createConnection(mysqlConnnectionOpt);

    const [rows, field] = await connection.execute("SELECT * FROM "+exam_table);
    
    let date_ob = new Date();
    let day = ("0" + date_ob.getDate()).slice(-2);  // adjust 0 before single digit date
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2); // current month
    let year = date_ob.getFullYear();     // current year
    const date = year + month + day;  // prints date in YYYYMMDD format

    let hours = date_ob.getHours();
    let mins = date_ob.getMinutes();

    const now = 60*hours + mins;

    //this part is for situation at 11:56pm, Program have to also search exam within 10 min of next day exam like starting 00:01 mins
    let tomorrow = new Date();
    tomorrow.setDate(date_ob.getDate() + 1);
    const next_date = tomorrow.getFullYear() + ("0" + (tomorrow.getMonth() + 1)).slice(-2) + ("0" + tomorrow.getDate()).slice(-2);

    for (let exam of rows) {
      if (exam.testdate == date || exam.testdate == next_date) {
        let isTomorrow = exam.testdate == next_date;
        const starttime = exam.starttime;
        const endtime = exam.endtime;

        let testHours = parseInt(starttime.slice(0,2)) + ((isTomorrow) ? 24 : 0);
        let testMins = parseInt(starttime.slice(2,4));
        let testEndHours = parseInt(endtime.slice(0,2)) + ((isTomorrow) ? 24 : 0);
        let testEndMins = parseInt(endtime.slice(2,4));
        const test = 60*testHours + testMins;
        const testEnd = 60*testEndHours + testEndMins;

        console.log(exam.tablename, 'testStart:', testHours, testMins, 'testEnd', testEndHours, testEndMins);
        //turn on rtmp 30 mins eralier before exam starts
        if (now >= (test-30) && now <= testEnd) { //now < testEnd is for turing off when exam is ended
          rtmpOnlyServerOn = true;
          break;
        }
      }
    }

    return rtmpOnlyServerOn;
  } catch (err) {
    console.log(err, 'on searchDBAndIsExamExist');
    return false;
  }
}

let manageEc2 = async function() {
  try {

    const isExamExist = await searchDBAndIsExamExist();

    //status: running, pending, stopping, stopped
    // let data = await ec2.describeInstanceStatus(paramsForDescribeInstances).promise();
    // const state = data["InstanceStatuses"][0]["InstanceState"]["Name"];

    // if (state == undefined) {
    //   throw new Error("no state found...");
    // }
    //
    // console.log("state:", state);

    // if (isExamExist) {
    //   if (state != "running") {
      //   ec2.startInstances(paramsForOnOff, function(err, data) {
      //     if (err) {
      //       console.log(err, err.stack); // an error occurred
      //     } else {
      //       data = JSON.stringify(data, null, 2);
      //       console.log(`startInstances ${data}`);           // successful response
      //     }
      //   });
    //   }
    // } else {
    //   if (state == "running") {
      //   ec2.stopInstances(paramsForOnOff, function(err, data) {
      //     if (err) {
      //       console.log(err, err.stack); // an error occurred
      //     } else {
      //       data = JSON.stringify(data, null, 2);
      //       console.log(`stopInstances ${data}`);           // successful response
      //     }
      //   });
      // }
    // }

  } catch (err) {
    console.log(err);
  }
};

manageEc2();
