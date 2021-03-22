//this code is for drop table:tablename and deleete from exam_data which has tablename = tablename and
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

module.exports = async function getJSON(tablename, lec_id, lec_id_idx, mail_address) {
  let connection;

  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);

    console.log('tablename', tablename);
    await connection.execute("DROP TABLE " + tablename);
    await connection.execute("DELETE FROM exam_data WHERE tablename='" + tablename + "'");

    // await connection.execute("UPDATE faculty_information SET lec_id" + lec_id_idx + " = '" + "null" + "' WHERE mail_address = '" + mail_address + "'");
    await connection.execute("UPDATE faculty_information SET lec_id" + lec_id_idx + "=NULL WHERE mail_address = '" + mail_address + "'");
    // �����ǡ� ���� ���� string���� NULL��� 'NULL'�� ����ϸ� NULL�� ��Ʈ������ DB�� ����
    let idx_next = lec_id_idx+1;
    let lec_id_max = 8;

    while (1) {
      let [rows, filed] = await connection.execute("SELECT lec_id"+idx_next+" FROM faculty_information WHERE mail_address ='" + mail_address + "'");

      if (rows[0] != null || rows[0] != 'null') {
        let val = rows[0]['lec_id'+idx_next];
        await connection.execute("UPDATE faculty_information SET lec_id" + (idx_next-1) + " = '" + val + "' WHERE mail_address = '" + mail_address + "'");

        if (idx_next == lec_id_max) {
          await connection.execute("UPDATE faculty_information SET lec_id" + idx_next + "=NULL WHERE mail_address = '" + mail_address + "'");
          break;
        }

        idx_next++;
      } else {
        await connection.execute("UPDATE faculty_information SET lec_id" + (idx_next-1)+ "=NULL WHERE mail_address = '" + mail_address + "'");
        break;
      }
    }

    connection.end();
    return ('success');
  } catch(err) {
    connection.end();
    return err;
  }
};
