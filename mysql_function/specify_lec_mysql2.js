const { exec } = require("child_process");
var bodyParser = require('body-parser');

var mysql = require('mysql2')

var connection = mysql.createConnection({
  host: 'test.c5qf23msrkrw.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'dnjswns9910*',
  database: 'test'
})

var date = process.argv[2];
var lec = process.argv[3];
var column = process.argv[4];

var command = "SELECT " + column + " FROM exam_data WHERE testdate='" + date + "' AND lec='" + lec + "'";

connection.connect()

connection.query(command, function (err, rows, fields) {
    if (!err) {
        console.log(rows);
        
        /*var startd = JSON.stringify(rows).indexOf('"supervNum":"');
        var end = JSON.stringify(rows).indexOf('"}]', startd+13);
        var list = JSON.stringify(rows).substring(startd+13, end);

        console.log(list);*/
    }
    else {
        console.log(err);
    }
})

connection.end()