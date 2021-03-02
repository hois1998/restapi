//this code is for find tablename from Table:exam_data which has date and test value as date and test arguments + lec
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/mysql_connection_option');

module.exports = async function (date, lec, test) {
  let connection;
  const column = 'tablename';

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    let [rows, field] = await connection.execute("SELECT "+column+" FROM exam_data WHERE testdate='" + date + "' AND lec='" + lec + "' AND test='" + test + "'");
    //console.log(rows);
    if (rows[0] == undefined) {
      throw new Error('there is no exam matched...');
    } else {
      let tablename = rows[0][column];
      // console.log('rows[0]', rows[0]);
      // console.log('tablename found:', tablename);

      connection.end()
      return tablename;
    }

  } catch (err) {
    connection.end();
    return err;
  }
};
