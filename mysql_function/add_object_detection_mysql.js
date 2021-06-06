/*
this code is for add object detection Error of the studnetNum
to Table: ex) DL_midterm_20210204_1200_1300
when studnet program send alarm to server
*/
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function(num, tablename, mac, errorJson) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const column = 'objectDetectionErr';

    const [rows, field] = await connection.execute("SELECT "+column+" FROM " + tablename + " WHERE id='" + num + "' and mac ='" + mac + "'");
	
	///test
	//console.log(`rows\n\n\n${JSON.stringify(rows[0])}`);
	////////
    if (rows[0][column] == null) {
	  //console.log('pass null');

      await connection.execute("UPDATE "+tablename+" SET "+column+" = '"+JSON.stringify(errorJson)+"' where id = '"+num+"' and mac ='" + mac + "'");
    } else {  //need to concatenate stored data with errorJson
      let newJson = JSON.parse(rows[0][column]);
	  
      for (let propertyName of Object.getOwnPropertyNames(errorJson)) {
        newJson[propertyName] = errorJson[propertyName];
      }

      //console.log('newJson\n', newJson);

      await connection.execute("UPDATE "+tablename+" SET "+column+" = '"+JSON.stringify(newJson)+"' where id = '"+num+"' and mac ='" + mac + "'");
    }

    connection.end();

    return 'success';
  } catch (err) {
    if (connection != undefined)
      connection.end();
	   console.log(err);
    return err;
  }
}
