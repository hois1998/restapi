const { exec } = require("child_process");


exec("node ./mysql_function/specify_lec_mysql.js " + date + " " + column, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        else {
                            console.log(`stdout: ${stdout}`);
                            if (stdout.length < 5){
                                return;
                            }
                            else {
                                return stdout.split("'");       
                                //res.send(testarr);   
                                function find_test() {
          return 
    }
                                                      
                            }
                        }

function find_test() {
      return 
}

module.exports.find_test = find_test;