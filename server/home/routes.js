const express = require('express');
const path = require('path');
const { msgvars } = require('../server');

const router = express.Router();
//router.set('views', path.join(clientpath, '/home/'));

router.route('/')
	.get((req, res, next) => { 
		res.render('home', {
			...msgvars(req),
			title: "Home"
		});
	});

router.route('/index')
	.get((req, res, next) => {
		res.redirect('/');
	});

router.route('/test')
	.get((req, res, next) => {
		req.flash('message', 'This is a test site');
		req.flash('type', 'info');
		res.render('test', {
			...msgvars(req),
			title: "testsite"
		});
	});

module.exports = router;

