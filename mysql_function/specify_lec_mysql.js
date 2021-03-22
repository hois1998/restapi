//this code if for find tablename set today as testdate from Table:exam_data
const mysql = require('mysql2/promise');
const uuid = require('uuid');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function (date) {
  let connection;
  const column = 'tablename';

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    let [rows, field] = await connection.execute("SELECT " + column + " FROM exam_data WHERE testdate='" + date + "'");

    if (rows[0] == undefined) {
      throw new Error('there is no exam today...');
    } else {
      const list = rows.map(i => i[column]);
      console.log('lec_id list', list);

      connection.end();
      return list;
    }
  } catch (err) {
    connection.end();
    return err;
  }
};
