//this code is sending endpoints of specific exam of specific supervNum
//when do return endpoints, three streamkey per student are given to the supervisor
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

const secretObj = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/jwt_secretKey");
const find_streamkey_on_tablename_mysql = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/mysql_function/find_streamkey_on_tablename_mysql");
const rtmp_live_url = require("/home/ubuntu/rest_api/Rest_API_Server/restapi/config/rtmp_live_url");

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async function(req, res, next) {
  console.log("req.body");
  console.log(req.body);
  console.log("\n--end req.body--\n");

  try {
    const {supervNum, tablename, token} = req.body;
    const decoded = jwt.verify(token, secretObj.secret);  //if not valid, thorw error

    if (tablename == undefined || supervNum == undefined) {
      throw new Error('user omits information');
    }

    let streamkey_id_mac_list = await find_streamkey_on_tablename_mysql(tablename, supervNum).catch(err => {throw err;});

    let endpoint_list = {};

    for (let streamkey_id_mac of streamkey_id_mac_list) {
      let {id, streamkey, mac} = streamkey_id_mac;
      let arraySize = 3 //three streamkey for one student e.g. pc display, pc cam, phone
      if (!endpoint_list.hasOwnProperty(id)) {
        endpoint_list[id] = Array(3).fill(null);
      }

      if (streamkey != 'null') {
        endpoint_list[id][parseInt(mac)] = rtmp_live_url + streamkey;

      }
    }
	let result_final = JSON.stringify(endpoint_list);
    console.log('result of endpoint_list', result_final);
    //{"0000-00001":["rtmp://123/092cd759-822c-46fe-83ba-da0d4246374f","rtmp://123/35ff3014-d7ae-4389-a74f-0c6e900b27ec","rtmp://123/96a00cd5-94e5-4d92-aa10-2419e85870c1"],"0000-00002":["rtmp://123/ef3167d5-d3ad-4de0-89ef-94fec38cc69f","rtmp://123/17b6956b-130f-48f0-a065-7ae42208b3f8","rtmp://123/c82e1005-cea7-4402-aa04-7b1f90a4578a"],"0000-00003":["rtmp://123/e2b9ebc4-fee8-4e82-b80a-327176816393","rtmp://123/24a067c8-c183-4e86-bea5-91d8f0ed03a2","rtmp://123/fcf620d1-6c61-42ee-b697-5ac7e202a6a2"],"0000-00004":["rtmp://123/0ec78605-f1ae-4e02-893d-d7f6ebfda9d5","rtmp://123/a6fc7bfb-87c5-4f34-9923-8c37f434befa","rtmp://123/88e21cf8-53d0-453f-ac64-3f6865d56d98"],"0000-00005":["rtmp://123/9bf18a58-d7c9-4ece-aab7-14c0615da4e2","rtmp://123/9a70af2a-0735-4f47-abd8-214091732f7d","rtmp://123/796690b0-dcdb-4616-9e81-46cddad32ca7"]}

    res.end(result_final);

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = app;
