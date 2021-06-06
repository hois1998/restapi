//this code is for change examDone column state
//parameters are (tablename, streamkey, previousState, nextState)
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function(tablename, streamkey, prevState, nextState) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    const column = 'examDone';

    //find prevState of 'examDone' column on 'tablename' table
    const row = (await connection.execute("SELECT "+column+" FROM "+tablename+" WHERE streamkey='"+streamkey+"'"))[0];
    const data = row[column];

    if (row[column] != prevState)
      throw new Error(`previous state is not expected data: expected= ${prevState} actual=${data}`);

    await connection.execute("UPDATE "+tablename+" SET "+column+ "= '"+nextState+"' WHERE streamkey= '"+streamkey+"'");

    connection.end();

    return 'success';
  } catch (err) {
    if (connection != undefined)
      connection.end();
    throw err;
  }
}
