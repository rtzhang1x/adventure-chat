//include all required packages
const express = require('express');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash'); 
const path = require('path');

//define essential constants
const app = express();
const http = require('http').Server(app);
const port = 3000;
const adventurepath = path.join(__dirname, '/../');
const clientpath = path.join(adventurepath, '/client/');
const serverpath = __dirname;

//exports to make the rest of the stuff work
exports.adventurepath = adventurepath;
exports.clientpath = clientpath;
exports.serverpath = serverpath;
exports.msgvars = function(req) {
	return {
		logged_in: req.session.logged_in || false,
		messages: req.flash('message'),
		msg_types: req.flash('type')
	}
}

//use middlewares
app.use(express.static(clientpath));
app.use('/css', express.static(adventurepath + '/node_modules/bootstrap/dist/css'));
app.use(express.json());
app.use(cookieParser());
const { sessionMiddleware } = require('./auth/auth');
app.use(sessionMiddleware);
app.use(flash());
app.use(function(req, res, next) {
	if (req.session.logged_in === false) req.session.destroy();
	next();
});

//set view engine
app.set('views', [
	clientpath, 
	path.join(clientpath, '/auth/'), 
	path.join(clientpath, '/home/'), 
	path.join(clientpath, '/messages')
]);
app.set('view engine', 'ejs');

//import routes
const auth = require('./auth/routes');
app.use('/auth', auth);
const home = require('./home/routes');
app.use('/', home);
const messages = require('./messages/routes');
app.use('/messages', messages)

const server = http.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

exports.server = server;
const { io } = require('./messages/messages');
