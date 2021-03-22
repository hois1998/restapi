//this code is for delete mail_address from Table:faculty_information_temp and insert mail_address and Pw which is 'temp_password' as default value to Table:faculty_information while authorization

const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');


module.exports = async function(mail_address) {
  let connection;
  const PW = 'temp_password';
  const table = 'faculty_information';
  const table_temp = 'faculty_information_temp';

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    const [temp_rows, temp_field] = await connection.execute('SELECT * FROM '+table_temp+' WHERE `mail_address` = ?', [mail_address]);

    if (temp_rows[0] == undefined) {
      return new Error('cannot find ID on DB where ID is waiting to be authorized');
    } else {
      await connection.execute('DELETE FROM '+table_temp+' WHERE `mail_address` = ?', [mail_address]);

      await connection.execute("INSERT INTO "+table+" (mail_address, PW) VALUES ('" + mail_address + "', '" + PW + "')");

      connection.end();
      return 'supervisor authorization success';
    }
  } catch (err) {
    return err;
  }
}
