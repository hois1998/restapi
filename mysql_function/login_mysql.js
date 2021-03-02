const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/mysql_connection_option');

module.exports = async function getJSON(mail_address, PW) {
  try {
    const connection = await mysql.createConnection(mysqlConnnectionOpt);
    const [rows, fields] = await connection.execute('SELECT * FROM faculty_information WHERE mail_address=? AND PW=?', [mail_address, PW]);

    connection.end();
    return rows[0];
  } catch (err) {
    return err;
  }
};


// (async function() {
//   console.log('aa');
//   let temp = await getJSON('young0@snu.ac.kr', '0000');
//   console.log(temp);
//
//   console.log(temp['lec_id7'] = null);
// })();
