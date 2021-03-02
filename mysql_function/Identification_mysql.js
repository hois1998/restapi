//this code is for determining whether the Table:tablename contain studentNum argument inside id column
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/mysql_connection_option');

module.exports = async function (studentNum, tablename, mac) {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    let [rows, field] = await connection.execute("SELECT * FROM " + tablename + " WHERE id='" + studentNum + "' and mac= '" + mac + "'");

    connection.end();

    if (rows[0] != undefined) {
      console.log(rows[0]);
      return rows[0];
    } else return false;
  } catch (err) {
    connection.end();
    return err;
  }
};
