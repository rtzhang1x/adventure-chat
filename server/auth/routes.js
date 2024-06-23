const express = require('express');
const path = require('path');
const session = require('express-session'); 
const { sessionMiddleware, register, login } = require("./auth");
const { msgvars } = require('../server');

const router = express.Router();
//router.set('views', path.join(clientpath, '/auth/'));

const timeLog = (req, res, next) => {
    console.log('Time: ', Date.now());
    next();
};

router.use(timeLog);
router.use(sessionMiddleware);
//router.use(flash());

router.route('/register')
    .get((req, res, next) => {
        if (req.session.logged_in) {
            res.redirect("/messages");
        } else {
            res.render("register", {
                ...msgvars(req),
                title: "Register", 
                scripts: ["/auth/register.js"]
            })
        }
    })
    .post(register, (req, res, next) => {});

router.route('/login')
    .get((req, res, next) => {
        if (req.session.logged_in) {
            res.redirect("/messages");
        } else {
            //req.flash('message', 'afdsfadfd');
            res.render("login", {
                ...msgvars(req),
                title: "Login", 
                scripts: ["/auth/login.js"]
            });
        }
    })
    .post(login, (rep, res, next) => {});

router.route('/logout')
    .get((req, res, next) => {
        res.cookie("jwt", { maxAge: "1" });
        res.session.destroy(() => {
            res.redirect("/");
        });
    });

module.exports = router;
