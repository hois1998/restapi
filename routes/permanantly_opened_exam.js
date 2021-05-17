//this code is for
//1. create exam every day and add five students for the test

const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

const MinToSec = 60;
const testName = "rootTestExam";
// let changedToNext = 0;


let setDayExam = setInterval(async () => {
  try {
    let today = new Date();
    let todayHours = today.getHours();
    let todayMins = today.getMinutes();

    let t_day = ('0' + today.getDate()).slice(-2);
    let t_month = ('0' + (today.getMonth()+1)).slice(-2);
    let t_year = today.getFullYear();
    const todayDate = t_year + t_month + t_day;

    if (todayHours == 23 && todayMins == 59) {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);  //내일 날짜를

      const day = ('0' + tomorrow.getDate()).slice(-2);
      const month = ('0' + (tomorrow.getMonth() + 1)).slice(-2);
      const year = tomorrow.getFullYear();

      const tomorrowDate = year + month + day;


      console.log('date format: ', todayDate, tomorrowDate);

      let result = await mysqlWorkFlow(todayDate, tomorrowDate);  //머가 더 필요할텐데
      if (result) {
        console.log('mysql executed but got error');
      } else {
        console.log('mysql done successfully');
      }
    } else {
      console.log(`time(now): ${todayDate} ${todayHours}:${todayMins}`);
    }
  } catch (e) {
    console.log(e);
  }
}, MinToSec*1000);  //execute this function every mininutes


const mysqlWorkFlow = async (today, tomorrow) => {
  try {
    let faculty_table = 'faculty_information';
    let lec_id = 'rootTestExam.midterm_'+tomorrow;
    let mail_address = 'hois1998@snu.ac.kr';
    let todayTablename = 'rootTestExam_midterm_'+today+'_0000_2359';
    let tomorrowTablename = 'rootTestExam_midterm_'+tomorrow+'_0000_2359';
    let exam_table = 'exam_data';

    connection = await mysql.createConnection(mysqlConnnectionOpt); //access to mysql

    //update faculty_information' lec_id1 column where mail_address = 'hois1998@snu.ac.kr'
    await connection.execute("UPDATE "+faculty_table+" SET lec_id1 = '" + lec_id + "' WHERE mail_address = '" + mail_address + "'");  //mysql에서 faculty_table업뎃

    await connection.execute("RENAME TABLE "+todayTablename+" TO "+tomorrowTablename);

    await connection.execute("UPDATE "+exam_table+" SET testdate = '"+tomorrow+"', tablename = '"+tomorrowTablename+"' WHERE lec= '"+testName+"'");

    return 0;
  } catch (e) {
    console.log(e);
    return 1;
  }

}
