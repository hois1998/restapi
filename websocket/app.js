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
var server = require('http').createServer();
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let createError = require('http-errors');

// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send(__dirname + '/index.html');
});


// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on('connection', function(socket) {
  socket.emit("welcome", "welcome to server connection");

  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function(data) {
	console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

	// socket에 클라이언트 정보를 저장한다
	socket.name = data.name;
	socket.userid = data.userid;

	// 접속된 모든 클라이언트에게 메시지를 전송한다
	io.emit('login', data.name );
  });

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', function(data) {
    console.log('Message from %s: %s', socket.name, data.msg);

    var msg = {
      from: {
        name: socket.name,
        userid: socket.userid
      },
      msg: data.msg
    };

    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    socket.broadcast.emit('chat', msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    // socket.emit('s2c chat', msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.emit('s2c chat', msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });
});


server.listen(3100, function() {
  console.log('Socket IO server listening on port 3100');
});


