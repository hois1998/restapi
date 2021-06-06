//this code for return stduent list of specific exam and specific supervNum
//to see student list and let supervisor make decision to add new student
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const student_list_mysql = require('/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/student_list_mysql');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log('req body:');
  console.log(req.body);
  console.log('\n--end req body--\n');

  try {
    const {tablename, token, supervNum} = req.body;
    if (tablename == undefined || token == undefined) {
      throw new Error('user omits information');
    }

    const decoded = jwt.verify(token, secretObj.secret);

    const result = await student_list_mysql(tablename, supervNum);
    if (result instanceof Error) {
      throw result;
    }
    let returnStr = '';

	////test
	//for (let temp of result) {
	//	console.log(`result\n${JSON.stringify(temp, null, 4)}`);
	//}
	//console.log(`length of result ${result.length}`);
	/////////////

	let mac = 'mac';

    for (let i=0; i<result.length; i +=1) {
	  //test
	  //console.log(result[i][mac]);
	  ///
	  if (result[i][mac] == '0')
		returnStr += result[i].id+','+result[i].name+','+result[i].supervNum + '^';
	  
	  if (i == result.length-1)
		returnStr = returnStr.slice(0,returnStr.length-1);
      /*if (i != result.length-1 && i != result.length-2) {
        returnStr += '^';
      }*/
    }

    console.log('returnStr:');
    console.log(returnStr);

    res.send(returnStr);
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
