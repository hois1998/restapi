/*
check whether examDone is 'ready' or not
if not, it means other user already use that streamkey which is critical issue
*/

const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function getJSON(tablename, streamkey, name=null, num=null, mac=null) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const column = 'examDone';
	let rows;

    //if streamkey is null, use on 'return_endpoint.js'
    //else use on 'killFfmpeg.js'
    if (streamkey == null) {
      //throw error, if user input wrong tablename which doesn't exist
      rows = (await connection.execute("SELECT "+column+" FROM "+ tablename +" WHERE name= '"+name+"' and id= '"+num+"' and mac= '"+mac+"'"))[0];

      //if rows.length == 0, two cases can be possible
      if (rows.length === 0)
        throw new Error(`wrong name, num, or mac`);
    } else {
      const rows = (await connection.execute("SELECT "+column+" FROM "+ tablename +" WHERE streamkey= '"+streamkey+"'"))[0];

      if (rows.length === 0) {
        throw new Error(`no streamkey on tablename: ${tablename}`);
      }
    }
	
	//test//
	console.log(`\n\n\n\n${JSON.stringify(rows,null,4)}\n\n\n\n`);
	////
    connection.end();

    return rows;

  } catch (err) {
    if (connection != undefined)
      connection.end();
    throw err;
  }
};
