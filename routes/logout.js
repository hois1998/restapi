var express = require('express');
const { exec } = require("child_process");
var bodyParser = require('body-parser');

let jwt = require("jsonwebtoken");
let secretObj = require("../config/secret_key");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', function(req, res, next) {

    //var name = req.body.name;
    //var number = req.body.number;
    
    let token = req.body.token;
    let decoded = jwt.verify(token, secretObj.secret);
    
    if (decoded) {
        res.send('Disabled Function...');
    }
    else {
        res.send('Invalid token');
    }
});

module.exports = app;
