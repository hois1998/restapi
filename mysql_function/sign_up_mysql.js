//this code is for insert mail_address to Table:faculty_information_temp before authorization
//and before insert, check whether the mail_address is already registered on Table:faculty_information and faculty_information_temp

const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/mysql_connection_option');

module.exports = async function(mail_address) {
  try {
    const connection = await mysql.createConnection(mysqlConnnectionOpt);
    const table_temp = 'faculty_information_temp';
    const table = 'faculty_information';

    const [temp_rows, temp_field] = await connection.execute('SELECT * FROM '+table_temp+' WHERE `mail_address` = ?', [mail_address]);
    const [authorized_rows, authorized_filed] = await connection.execute('SELECT * FROM '+table+' WHERE `mail_address` = ?', [mail_address]);

    if (authorized_rows[0] != undefined) {
      return new Error('ID that cannot be used or that is already in use');
    }

    if (temp_rows[0] != undefined) {
      return new Error('your ID is already in authorization step');
    }

    const [rows, fields] = await connection.execute("INSERT INTO " + table_temp + " (mail_address) VALUES ('" + mail_address + "')");

    connection.end();
    return 'success';
  } catch (err) {
    return err;
  }
};
