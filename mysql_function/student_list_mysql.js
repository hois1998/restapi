//this code is retrive a studnet metadata of specific exam, specific supervisor number and student number
//by doing so, server can return streamkey to clients
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

//if input supervNum is equal to null, then
async function getJSON(tablename, supervNum=null, num=null) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const supervNumColumn = 'supervNum';
    const numColumn = 'id';

    //if supervNum==num==null,
    //if supervNum!=null,
    //if supervNum == null, use in return_endpoint.js to find all lists of endpoint for one student, who has student id == num
    const [rows, fields] = (supervNum == null && num == null) ? (await connection.execute("SELECT * FROM " + tablename)) : ((supervNum != null) ? (await connection.execute("SELECT * FROM " + tablename + " where "+supervNumColumn+" = '" + supervNum + "'")) : (await connection.execute("SELECT * FROM " + tablename + " where "+numColumn+" = '" + num + "'")));


    if (rows.length == 0) {
      throw new Error('no student found');
    }
	
	///test//
	//console.log(`rows\n${JSON.stringify(rows, null, 4)}`);
	///////

    connection.end();

    if (supervNum == null && num == null) {
      return rows;  //������ ���� �л� ����Ʈ ����
    }

    return rows.length == 1 ? rows[0] : rows;
  } catch (err) {
    connection.end();
    console.log(err);
    return err;
  }
}

module.exports = getJSON;
// (async function() {
//   let temp = await getJSON('chemistry1_midterm_20210213_1930_2300', null, '2021-11111');
//   console.log(temp);
// })()
