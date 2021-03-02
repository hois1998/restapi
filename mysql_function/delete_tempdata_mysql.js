const { exec } = require("child_process");
var bodyParser = require('body-parser');

var mysql = require('mysql2')

var connection = mysql.createConnection({
  host: 'test.c5qf23msrkrw.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'dnjswns9910*',
  database: 'test'
})

var mail_address = process.argv[2];

var command = "DELETE FROM faculty_information_temp where mail_address='" + mail_address + "'";

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