/*
return array which has entry type of object

*/
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function getJSON(tablename, supervNum, name=null, mac=null, num=null) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const column0 = 'id';
    const column1 = 'streamkey';
    const column2 = 'mac';

    //if supervNum !== null, use on superv_endpoint.js.
    //if not, use on streaming_termination.js
    if (supervNum !== null) {
      //throw error, if user input wrong tablename which doesn't exist
      const [rows, fields] = await connection.execute("SELECT "+column0+" , "+column1+" , "+column2+" FROM "+ tablename +" WHERE supervNum= '"+supervNum+"'");

      //if rows.length == 0, two cases can be possible
      //1. worng supervNum
      //2. no student is created for that supervNum
      if (rows.length === 0)
        throw new Error(`wrong supervNum or no student is created for the supervNum ${supervNum}`);
    } else {

      const rows = (await connection.execute("SELECT "+column1+" FROM "+ tablename +" WHERE name= '"+name+"' and mac= '"+mac+"' and id= '"+num+"'"))[0];

      if (rows.length === 0)
        throw new Error(`wrong name, mac, or num`);
    }

    connection.end();

    return rows;
  } catch (err) {
    if (connection != undefined)
      connection.end();
    throw err;
  }
};
