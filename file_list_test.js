var fs = require('fs');

var file_list=fs.readdirSync('/media/endpoint');
console.log(file_list);