//this code is for add stdent data to Table: ex) DL_midterm_20210204_1200_1300
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function(studentNum, studentName, supervNum, tablename) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    //if studentNum you are trying to regist alrealy exist on DB, return 'already exist error'
    let [rows, field] = await connection.execute('SELECT * FROM '+tablename+' WHERE `id` = ?', [studentNum]);
    // console.log('rows', rows[0]);
    if (rows[0] != undefined) {
      throw new Error(`studnet(${studentNum}) is already registerd`);
    }

    //below, null is type of string not null type
    await connection.execute("INSERT INTO " + tablename + " (id, name, supervNum, streamkey, mac, examDone) VALUES('" + studentNum + "', '" + studentName + "', '" + supervNum + "', '" + null + "', '2', 'ready')");  //20210510 add because of pc monitor streaming
    await connection.execute("INSERT INTO " + tablename + " (id, name, supervNum, streamkey, mac, examDone) VALUES('" + studentNum + "', '" + studentName + "', '" + supervNum + "', '" + null + "', '1', 'ready')");
    await connection.execute("INSERT INTO " + tablename + " (id, name, supervNum, streamkey, mac, examDone) VALUES('" + studentNum + "', '" + studentName + "', '" + supervNum + "', '" + null + "', '0', 'ready')");

    connection.end();

    return 'success';
  } catch (err) {
    connection.end();
    return err;
  }
}
