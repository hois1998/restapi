const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/mysql_connection_option');

module.exports = async function getJSON(tablename, supervNum) {
  try {
    const connection = await mysql.createConnection(mysqlConnnectionOpt);
    const column = 'streamkey';

    const [rows, fields] = await connection.execute("SELECT "+column+" FROM "+ tablename +" WHERE supervNum= '"+supervNum+"'");
    console.log('rows[0]', rows[0]);

    let streamkey_list_final;

    if (rows.length == 1 && rows[0][column] == 'null') {
      streamkey_list_final = [];
    } else {
      streamkey_list_final = rows.map(i => i[column]);
    }

    console.log('streamkey_list_final', streamkey_list_final);
    connection.end();

    return streamkey_list_final;
  } catch (err) {
    return err;
  }
};
