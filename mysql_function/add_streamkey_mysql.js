//this code is for add streamkey of the studnetNum to Table: ex) DL_midterm_20210204_1200_1300
const mysql = require('mysql2/promise');
const uuid = require('uuid');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function(studentNum, tablename, mac) {
  let connection;
  const streamkey = uuid.v4();

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const column = 'streamkey';

    const [rows, field] = await connection.execute("SELECT "+column+" FROM " + tablename + " WHERE id='" + studentNum + "' and mac ='" + mac + "'");

    console.log(rows);
    if (rows[0][column] == 'null') {
      if (mac == '1'/*which means pc device streming*/) {
        const pcMonitorMac = 2;
        await connection.execute("UPDATE "+tablename+" SET streamkey = '"+streamkey+"' where id = '"+studentNum+"' and mac ='" + mac + "'");
        await connection.execute("UPDATE "+tablename+" SET streamkey = '"+uuid.v4()+"' where id = '"+studentNum+"' and mac ='" + pcMonitorMac + "'"); //20210510 add if pc connected, two stream lines are needed: one for studnet webcam and the other for sharing monitor display
      } else {
        await connection.execute("UPDATE "+tablename+" SET streamkey = '"+streamkey+"' where id = '"+studentNum+"' and mac ='" + mac + "'");
      }
    }

    connection.end();

    return 'success';
  } catch (err) {
    connection.end();
    return err;
  }
}
