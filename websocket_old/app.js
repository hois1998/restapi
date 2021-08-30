//const socketio = require('socket.io');
//const express = require('express');
//const http = require('http');
//
////express server init
//const app = express();
//
//app.get("/client", (req, res) => {
//	console.log("client is connected to client");
//	res.send("123");
//});
//const server = http.createServer(app);
//
//const io = socketio(server);
//io.on("connection", (socket) => {
//	const {url} = socket.request;
//	console.log(`connected: ${url}`);
//});
//
//server.listen(8000, () => { console.log('#####server started#####')});
//

//var io = require('socket.io')(3100);
//var roomName;
//
//io.on('connection', function (socket) {
//    console.log('connect');
//    var instanceId = socket.id;
//
//    socket.on('joinRoom',function (data) {
//        console.log(data);
//        socket.join(data.roomName);
//        roomName = data.roomName;
//    });
//
//    socket.on('reqMsg', function (data) {
//        console.log(data);
//        io.sockets.in(roomName).emit('recMsg', {comment: instanceId + " : " + data.comment+'\n'});
//    })
//

let express = require('express');
let app = express();
let path = require('path');
let server = require('http').createServer();
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let createError = require('http-errors');

// http server를 socket.io server로 upgrade한다
let io = require('socket.io')(server);

let tablename = process.argv[2], supervNum = process.argv[3];
let errorJsonStringified = process.argv[4];

console.log(`tablename: ${tablename}\nsupervnum: ${supervNum}\nerrorJson: ${errorJsonStringified}`);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function(req, res) {
//   res.send(__dirname + '/index.html');
// });

let key = tablename+'_'+supervNum;
console.log(key);

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on('connection', function(socket) {
  socket.emit('test', errorJsonStringified, (msg) => {
	console.log(msg);
	//process.kill(1);
  });

  socket.emit('welcome', 'welcome!!!');

  //process.exit(1);
});

// // 클라이언트로부터의 메시지가 수신되면
// socket.on('chat', function(data) {
//   console.log('Message from %s: %s', socket.name, data.msg);
//
//   var msg = {
//     from: {
//       name: socket.name,
//       userid: socket.userid
//     },
//     msg: data.msg
//   };
//
//   // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
//   socket.broadcast.emit('chat', msg);
//
//   // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
//   // socket.emit('s2c chat', msg);
//
//   // 접속된 모든 클라이언트에게 메시지를 전송한다
//   // io.emit('s2c chat', msg);
//
//   // 특정 클라이언트에게만 메시지를 전송한다
//   // io.to(id).emit('s2c chat', data);
// });

module.exports = app;

server.listen(3100, '0.0.0.0' ,function() {
  console.log('Socket IO server listening on port 3100');
});
