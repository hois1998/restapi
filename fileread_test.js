let fs = require('fs');

function file_read(num, lec_id, supervNum) {

    var result = fs.readFileSync("/media/endpoint/" + num + "_" + lec_id + "_" + supervNum + ".txt", 'UTF8');
    
    return result;
    console.log(result);
}

module.exports.file_read = file_read;