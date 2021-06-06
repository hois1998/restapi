// const {exec, execSync, execFile} = require('child_process');
// const fs = require('fs');
//
// const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/routes/rtmp_live_url");
// const homedir = '/media';
// const dir = homedir+'/'+'temp';
// const streamKey = '2015';
//
// let ffmpegId = execFile('ffmpeg', ['-hide_banner','-y', '-i' ,'rtmp://3.35.240.138:1935/channel2/'+streamKey, '-c:a', 'aac', '-ar' ,'48000', '-c:v', 'libx264' ,'-preset', 'ultrafast', '-profile:v', 'main', '-sc_threshold', '0', '-g', '48', '-keyint_min', '48', '-hls_time', '30', '-hls_list_size', '0', '-start_number', '0', '-b:v', '1000k', '-maxrate', '1200k', '-bufsize', '1200k', '-b:a', '128', '-threads', '1', '-hls_flags', 'append_list+round_durations', '-hls_segment_filename', dir+'/'+streamKey+'_%d.ts', dir+'/'+streamKey+ '.m3u8'],  (err, stdout, stderr) => {
//
//   if (err) {
//     fs.appendFileSync('ffmpeg.log', 'err\n\n'+err+'\n\n\n', 'utf8');
//     console.log('err\n\n\n', err);
//   } else if (stderr) {
//     console.log('stderr\n\n\n', stderr);
//     fs.appendFileSync('ffmpeg.log', 'stderr\n\n'+stderr+'\n\n\n', 'utf8');
//   } else {
//     fs.appendFileSync('ffmpeg.log', 'stdout\n\n'+stdout+'\n\n\n', 'utf8');
//     console.log('stdout\n\n\n', stdout);
//   }
// });
//
//
// setTimeout(() => {
//   ffmpegId.kill('SIGINT')}, 60000);


/*
return array which has entry type of object

*/
const mysql = require('mysql2/promise');

const mysqlConnnectionOpt = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/config/mysql_connection_option');

let  connection; 

async function getJSON(tablename, supervNum) {
  try {
    connection = await mysql.createConnection(mysqlConnnectionOpt);
    const column0 = 'id';
    const column1 = 'streamkey';
    const column2 = 'mac';

    const [rows, fields] = await connection.execute("SELECT "+column0+" , "+column1+" , "+column2+" FROM "+ tablename +" WHERE supervNum= '"+supervNum+"'");

    console.log('streamkey_list_final', rows, rows.length);
    connection.end();

    return rows;
  } catch (err) {
    connection.end();
    console.log(err);
    throw new Error("123");
  }
};

let rtmp_live_url = 'rtmp://123/';
(async function () {
try {
  
    let tablename = 'temperary_midterm_20210517_1500_1501';
    supervNum = process.argv[2]
    let streamkey_id_mac_list = await getJSON(tablename, supervNum).catch(err => {throw err;});

    let endpoint_list = {};

    for (let streamkey_id_mac of streamkey_id_mac_list) {
      let {id, streamkey, mac} = streamkey_id_mac;
      let arraySize = 3 //three streamkey for one student e.g. pc display, pc cam, phone
      if (!endpoint_list.hasOwnProperty(id)) {
        endpoint_list[id] = Array(3).fill(null);
      }

      if (streamkey != 'null') {
        endpoint_list[id][parseInt(mac)] = rtmp_live_url + streamkey;

      }
    }

    console.log('result of endpoint_list');
    console.log( JSON.stringify(endpoint_list));
} catch (err) {
  console.log('final catch blk passed', err);
}
})();