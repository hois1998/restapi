const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');


//supervNum�� ������ 1�� �Լ��� �ƴϸ� 2�� �Լ��� ������
async function getJSON(tablename, supervNum=null, num=null) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const supervNumColumn = 'supervNum';
    const numColumn = 'id';

    const [rows, fields] = (supervNum == null && num == null) ? (await connection.execute("SELECT * FROM " + tablename)) : ((supervNum != null) ? (await connection.execute("SELECT * FROM " + tablename + " where "+supervNumColumn+" = '" + supervNum + "'")) : (await connection.execute("SELECT * FROM " + tablename + " where "+numColumn+" = '" + num + "'")));
    //�� �� null�϶��� ����Ʈ�� �����ִ� student_list

    if (rows.length == 0) {
      throw new Error('no student found');
    }

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
