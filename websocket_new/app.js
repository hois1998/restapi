/* 접속 에러 등의 메세지를 server -> director client 전송. 이를 위한 websocket.
io.to(key).emit() 명령어를 통해 메세지를 보낸다. */

const socketio = require("socket.io");
const express = require("express");
const http = require("http");

const app = express();
app.get();
const server = http.createServer(app);

const io = socketio(server);

let tablename = process.argv[2], supervNum = process.argv[3];
let errorJsonStringified = process.argv[4];
let key = tablename+'_'+supervNum;
console.log(key);


io.on("connection", (socket) =>{
    const {url} = socket.request;
    console.log(`connected: {url}`);

    socket.on('chat', (msg) => { 
        console.log(`message from Client: ${msg}`); 
        var answer = {}; 
        io.to(key).emit('chat', answer);
    });

    // if error occur
    var Message = {}; // 여기에 전달할 메세지를 입력
    io.to(key).emit('error', Message); //이런식으로 쓰는게 맞나??
});

server.listen(3100, () => console.log("Server Started"));

/* 전달 형식: 
string headerText = 
"$$#$$UserInfo$$#$$" + clientData.clientName + "$$#$$" + clientData.testType + 
"$$#$$" + clientData.chattingRoom + "$$#$$UserInfo$$#$$"; 

string message = 
"$$#$$Message$$#$$" + clientData.chattingRoom + "$$#$$" + sendToPersonName + 
"$$#$$" + clientData.clientName + "$$#$$" + SendMessage.Text + "$$#$$Message$$#$$" */

