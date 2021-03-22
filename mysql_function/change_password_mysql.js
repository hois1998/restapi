//this code is for change supervisor password when first login to change default password, 'temp_password' and anytime user wants to chage password after first login
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function(mail_address, PW) {
  let connection;
  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const table = 'faculty_information';

    let [rows, field] = await connection.execute('SELECT * FROM '+table+' WHERE `mail_address` = ?', [mail_address])

    if (rows[0] != undefined) {
      await connection.execute('UPDATE '+table+' SET PW = "'+PW+'" WHERE mail_address = "'+mail_address+'"');
      connection.end();
      // console.log('rows[0]', rows[0]); //undefined
      return 'success';
    } else {
      throw new Error('cannot find ID on DB');
    }
  } catch (err) {
    connection.end();
    return err;
  }
}
