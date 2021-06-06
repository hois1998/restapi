/*
merge this code into find_streamkey_on_tablename_mysql.js
*/



// //this code if for find tablename set date and test from Table:exam_data
// const mysql = require('mysql2/promise');
//
// const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');
//
// module.exports = async function (tablename, studentNum, mac) {
//   let connection;
//   const column = 'streamkey';
//
//   try {
//     connection = await mysql.createConnection(mysqlConnnectionOpt);
//
//     let [rows, field] = await connection.execute("SELECT "+column+" FROM "+ tablename+" WHERE id='" + studentNum + "' and mac='" +mac +"'" );
//
//     if (rows[0] == undefined) {
//       throw new Error('invalid studnet ID');
//     } else {
//       let streamkey = rows[0][column];
//
//       connection.end()
//       return streamkey;
//     }
//
//   } catch (err) {
//     connection.end();
//     return err;
//   }
// };
