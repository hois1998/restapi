let io = require('socket.io-client');
let ip = require('ip');

console.log(ip.address());
var socket = io.connect('http://172.31.42.33:3100');

let cnt = 0;

console.log('start');

// Add a connect listene

socket.on("welcome", data => {
	console.log("received", data);
});

socket.emit("login", {
    // name: "ungmo2",
    name: 'abc',
    userid: "ungmo2@gmail.com"
});

socket.on('recMsg', function (data) {
	console.log(data.comment);
});

function myOnClick() {
    socket.emit("reqMsg", {comment: cnt});
	cnt++;
}

setInterval(() => {
	myOnClick();
}, 2000)
