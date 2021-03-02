const { exec } = require("child_process");
var bodyParser = require('body-parser');

var mysql = require('mysql2')

var connection = mysql.createConnection({
  host: 'test.c5qf23msrkrw.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'dnjswns9910*',
  database: 'test'
})

var lec = process.argv[2];
var test = process.argv[3];
var testdate = process.argv[4];
var starttime = process.argv[5];
var endtime = process.argv[6];
var tablename = process.argv[7];

var command = "INSERT INTO exam_data (lec, test, testdate, starttime, endtime, tablename, activation) VALUES ('" + lec + "', '" + test + "', '" + testdate + "', '" + starttime + "', '" + endtime + "', '" + tablename + "', '0')";

connection.connect()

connection.query(command, function (err, rows, fields) {
    if (!err) {
        console.log(rows);
    }
    else {
        console.log(err);
    }
})

connection.end()