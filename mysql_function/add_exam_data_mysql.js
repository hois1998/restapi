//this code is for creating Table: logicdesign_midterm_20210108_1400_1530 and add exam data to Table:exam_data and lec_id to the faculty_information
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function getJSON(mail_address, PW, lec, test, testdate, starttime, endtime, tablename, lec_num, lec_id) {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    let exam_table = 'exam_data';
    let faculty_table = 'faculty_information';

    await connection.execute('CREATE TABLE '+tablename+' (id VARCHAR(32), name VARCHAR(32), supervNum VARCHAR(32), streamkey CHAR(36), mac VARCHAR(32));');
    await connection.execute("INSERT INTO "+exam_table+" (lec, test, testdate, starttime, endtime, tablename) VALUES ('" + lec + "', '" + test + "', '" + testdate + "', '" + starttime + "', '" + endtime + "', '" + tablename + "')");

    //console.log(faculty_table, lec_num, lec_id, mail_address, PW);
    await connection.execute("UPDATE "+faculty_table+" SET lec_id" + lec_num + "= '" + lec_id + "' WHERE mail_address = '" + mail_address + "' AND PW = '" + PW + "'");

    connection.end();
    return 'success';
  } catch (err) {
    return err;
  }
};

//create table logicdesign_midterm_20210108_1400_1530 (id varchar(32), supervNum varchar(32));
// (async function () {
//   await getJSON('a@snu.ac.kr', '12', 'aaaaa', 'aaaaa', '20210214', '0111', '0115', 'aaaaa_aaaaa_20210214_0111_0115', 6, 'aaaaa.aaaaa_20210214' );
// })()
//�۵�Ȯ����
