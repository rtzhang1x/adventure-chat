const socket = require('socket.io');
const { server } = require('../server');
const { sessionMiddleware } = require('../auth/auth');

const io = socket(server);

io.use((socket, next) => {
	sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.on("connection", (socket) => {
	/*
	var arrayb = (socket.handshake.headers.cookie || "").split(";");
	var token = "";
	for (const item of arrayb) if (item.startsWith("jwt=")) {
		token = item.substr(4);
		break;
	}
	*/
	//var user;
	//if (typeof user === "undefined" || user === null) user = "an unknown user";
	//else user = socket.request.session.user.name;
	var user = socket.request.session.user || "an unknown user";
	console.log(user + " connected");

	socket.on('chat message', function(msg) {
		io.emit('chat message', {user: user, text: msg});
		console.log("user: " + user + ", message: " + msg);
	});

	socket.on('typing', function() {
		io.emit('typing', {user: user});
		console.log(user + " is typing...");
	});

	socket.on('disconnect', function() {
		console.log(user + ' disconnceted');
	});
});

exports.io = io;
