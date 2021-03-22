//this code is for delete studnet from Table:tablename
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

async function getJSON(tablename, studentNum) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    await connection.execute("DELETE FROM "+tablename+" WHERE id='" + studentNum + "'");

    connection.end();
    console.log('successfully delete student('+studentNum+') from table: '+tablename);
    return ('success');
  } catch(err) {
    connection.end();
    return err;
  }
};

module.exports = getJSON;
