const express = require('express');
const path = require('path');
const { userAuth } = require('../auth/auth');
const { msgvars } = require('../server');

const router = express.Router();
//router.set('views', path.join(clientpath, '/messages/'));

router.route('/')
    .get(userAuth, (req, res) => {
        res.render('messages', { 
            ...msgvars(req),
            title: 'Socket.io Simple Chat',
            scripts: ['/socket.io/socket.io.js', '/messages/messages.js']
        })
    });

module.exports = router;

