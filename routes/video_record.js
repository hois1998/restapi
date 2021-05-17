//this file is executed when student start streaming
//first make directory using for storing Video recorded
//when time arrive at exam starting time, ffmpeg command is executed to record
//when time arrive at exam stop time, ffmpeg command is terminated!
const {exec, execSync, execFile} = require('child_process');
const fs = require('fs');

const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/rtmp_live_url");
const homedir = '/media';

async function mkdir(testdate, lec, time, supervNum, streamkey) {

  if (!fs.existsSync(`${homedir}/${testdate}`)) {
    fs.mkdirSync(`${homedir}/${testdate}`);
  }

  if (!fs.existsSync(`${homedir}/${testdate}/${lec}`)) {
    fs.mkdirSync(`${homedir}/${testdate}/${lec}`);
  }

  if (!fs.existsSync(`${homedir}/${testdate}/${lec}/${time}`)) {
    fs.mkdirSync(`${homedir}/${testdate}/${lec}/${time}`);
  }

  if (!fs.existsSync(`${homedir}/${testdate}/${lec}/${time}/${supervNum}`)) {
    fs.mkdirSync(`${homedir}/${testdate}/${lec}/${time}/${supervNum}`);
  }

  if (!fs.existsSync(`${homedir}/${testdate}/${lec}/${time}/${supervNum}/${streamkey}`)) {
    fs.mkdirSync(`${homedir}/${testdate}/${lec}/${time}/${supervNum}/${streamkey}`);
  }

  return 'success';
}


//compare time every 10 second and if time becomes startTime
//ffpmeg command is executed
async function startFfmpeg(tablename, supervNum, streamkey) {
  const [lec, test, testdate, starttime, endtime] = tablename.split('_'); //chemistry1_midterm_20210213_1930_2300

  const time = starttime+'_'+endtime;
  const dir = homedir + '/' + testdate + '/' + lec + '/' + time + '/' + supervNum + '/' + streamkey;

  let startMinutes = parseInt(starttime.slice(2,4));
  let startHours = parseInt(starttime.slice(0,2));
  const startMin = parseInt(starttime.slice(0,2))*60+parseInt(starttime.slice(2,4));
  const endMin = parseInt(endtime.slice(0,2))*60+parseInt(endtime.slice(2,4));
  console.log(startHours, startMinutes);
  console.log('start end diff', startMin, endMin);

  try {
    // let startMinutes = startMin % 60;
    // let startHours = parseInt(startMin / 60);
    let isExamStart = await new Promise((resolve, reject) => {

      let nowTime = (new Date()).getHours()*60+(new Date()).getMinutes();

      if ( nowTime >= (endMin+1)) reject(0); //waiting 5mins after endtime of the test
      else {

        let ffmpegStart = setInterval(() => {

          let hours = (new Date()).getHours();
          let minutes = (new Date()).getMinutes()
          nowTime = hours*60+minutes;

          fs.appendFileSync(dir+'/ffmpeg.log', `record before state: current time ${hours}:${minutes} / start time ${startHours}:${startMinutes}\n`);

          if (nowTime >= startMin-1) {
            resolve(1);
            clearInterval(ffmpegStart);
          }
        }, 1000);
      }
    }).catch(err => {
      console.log('isExamStart on video_record catched');
      return err;
    });

    if (isExamStart instanceof Error) {
      throw isExamStart;
    }
    console.log('isExamStart', isExamStart);
    if (isExamStart) {
      fs.appendFileSync(dir+'/ffmpeg.log', `record start\n`);

      let ffmpegId = execFile('ffmpeg', ['-hide_banner','-y', '-i' ,'rtmp://3.35.240.138:1935/channel2/'+streamkey, '-c:a', 'aac', '-ar' ,'48000', '-c:v', 'libx264' ,'-preset', 'ultrafast', '-profile:v', 'main', '-sc_threshold', '0', '-g', '48', '-keyint_min', '48', '-hls_time', '30', '-hls_list_size', '0', '-start_number', '0', '-b:v', '1000k', '-maxrate', '1200k', '-bufsize', '1200k', '-b:a', '128', '-threads', '1', '-hls_flags', 'append_list+round_durations', '-hls_segment_filename', dir+'/'+streamkey+'_%d.ts', dir+'/'+streamkey+ '.m3u8'],  (err, stdout, stderr) => {

        if (err) {
          // fs.appendFileSync(dir+'/ffmpeg.log', 'err\n\n'+err+'\n\n\n');
          console.log(err);
          process.exit(1);
        } else if (stderr) {
          // fs.appendFileSync(dir+'/ffmpeg.log', 'stderr\n\n'+stderr+'\n\n\n');
        } else {
          // fs.appendFileSync(dir+'/ffmpeg.log', 'stdout\n\n'+stdout+'\n\n\n');
          console.log('ffmpeg command no err and done!');
        }
      });

      let timeDiff = endMin - (new Date()).getHours()*60+(new Date()).getMinutes();
      let tempInterval = setInterval(() => {
        console.log(`timeDiff on strartffmpeg is ${timeDiff}: ${endMin}-${(new Date()).getHours()*60+(new Date()).getMinutes()}`);
      }, 10000);

      setTimeout(() => {
        clearInterval(tempInterval);
        ffmpegId.kill('SIGINT');
      }, timeDiff*60*1000);
    } else {
      return 0;
    }
  } catch (err) {
    console.log('video_record err\n\n', err);
    return err;
  }
}


//this funciton is for making dir like 20210213/chemistry1/midterm/1/streamkey
async function prepare_video_record(tablename, supervNum, streamkey) {
  try {
    if (tablename == undefined || supervNum == undefined || streamkey == undefined) {
      throw new Error('some arguments are missing on function video_record');
    }

    const [lec, test, testdate, starttime, endtime] = tablename.split('_'); //chemistry1_midterm_20210213_1930_2300

    const time = starttime+'_'+endtime;

    //console.log('tablename\n\n', lec, test, testdate, starttime, endtime);

    const mkdirResult = await mkdir(testdate, lec, time, supervNum, streamkey);
    if (mkdirResult instanceof Error) {
      throw mkdirResult;
    }

    return 'success preparing video record';
  } catch (err) {
    console.log(err);
    return err;
  }
}

module.exports = {prepare_video_record, startFfmpeg};
