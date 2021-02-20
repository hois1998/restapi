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


setTimeout(() => {
  process.exit(1);
}, 5000);
