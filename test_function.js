const {exec, execSync, execFileSync} = require('child_process');
var streamKey = process.argv[2];
let fs = require('fs');
let dir = '/media/endpoint/';
let files = fs.readdirSync(dir);


let file_list=fs.readdirSync('/media/endpoint/');

/*    function delay() {
      return new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve();
        },1)
      })
    }
    
    async function get_information(streamKey) {*/
      for(var i = 0; i < files.length; i++){
      
        //await delay();
        //let file = files[i];     
        //let filearr = file.split("_");   

        if (String(fs.readFileSync(dir + files[i]).slice(0,-1)) == streamKey){
        
            let filearr = files[i].split("_");
            let targetdate = filearr[2];
            let lec_id = filearr[1];
            let lec = lec_id.substring(0,lec_id.indexOf("."));
            let suffix = filearr[3];
            let supervNum = suffix.substring(0,suffix.indexOf("."));
            
            let starttime_fake = execSync("node ./mysql_function/specify_lec_mysql2.js " + targetdate + " " + lec + " starttime");
            let endtime_fake = execSync("node ./mysql_function/specify_lec_mysql2.js " + targetdate + " " + lec + " endtime");
            
            let starttimearr = String(starttime_fake).split("'");
            let endtimearr = String(endtime_fake).split("'");
            
            let starttime = starttimearr[1];
            let endtime = endtimearr[1];
            
            console.log(lec);
            console.log(starttime);
            console.log(endtime);
            console.log(supervNum);
                     
        }

      }
      /*return {
                lec: lec,
                starttime: starttime,
                endtime: endtime,
                supervNum: supervNum,
            
            }
      
    }*/

//module.exports.get_information = get_information;
