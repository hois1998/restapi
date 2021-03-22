//this code is for
//1. create exam every day and add five students for the test
//
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

const MinToSec = 60;
const testName = "rootTestExam";

let setDayExam = setInterval(() => {
  let today = new Date();
  const todayHours = today.getHours();
  const mins = today.getMinutes();

  if (hours == 23 && mins == 58) {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const day = ('0' + (tomorrow.getDate() + 1)).slice(-2);
    const month = ('0' + (tomorrow.getDate()+1)).slice(-2);
    const year = tomorrow.getFullYear();

    const dateFormat = year + month + day;

    let result = mysqlWorkFlow(dateFormat);  //머가 더 필요할텐데
    if (result) {
      console.log('mysql executed but got error');
      
    }
  } else {
    console.log(`time(now): ${today.getDate()} ${hours}:${mins}`);
  }
}, MinToSec*1000);  //execute this function every mininutes

const mysqlWorkFlow = async (today, tomorrow) => {
  try {
    let faculty_table = 'faculty_information';
    let lec_id = 'rootTestExam.midterm_'+date;
    let mail_address = 'hois1998@snu.ac.kr';
    let todayTablename = 'rootTestExam_midterm_'+today+'_0000_2359';
    let tomorrowTablename = 'rootTestExam_midterm_'+tomorrow+'_0000_2359';
    let exam_table = 'exam_data';

    connection = await mysql.createConnection(mysqlConnnectionOpt); //access to mysql

    //update faculty_information' lec_id1 column where mail_address = 'hois1998@snu.ac.kr'
    await connection.execute("UPDATE "+faculty_table+" SET lec_id1 = '" + lec_id + "' WHERE mail_address = '" + mail_address + "'");

    await connection.execute("RENAME TABLE "+todayTablename+" TO "+tomorrowTablename);

    await connection.execute("UPDATE "+exam_table+" SET testdate = '"+today+"', tablename = '"+tomorrowTablename+"' WHERE lec= 'rootTestExam'");

    return 0;
  } catch (e) {
    console.log(err);
    return 1;
  }

}
