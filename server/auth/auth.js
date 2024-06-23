const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session'); 
const connect_sqlite3 = require('connect-sqlite3');
const { serverpath } = require('../server');
const path = require("path");

const jwtSecret = process.env.ACJWTSecret;
const session_max_age = 3*60*60; //3 hours in seconds
const SQLiteStore = connect_sqlite3(session);
const sessionMiddleware = session({
    store: new SQLiteStore,
	secret: process.env.ACECSSecret,
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 1000*session_max_age }
});

opendb = () => {
    return new sqlite3.Database(path.join(serverpath, "/auth/users.db"), (err) => {
        if (err) return console.error(err.message);
        console.log('Connected to the users.db SQlite database.');
    });
};

closedb = (db) => {
    db.close((err) => {
        if (err) return console.error(err.message);
        console.log('Close the database connection.');
    });
};  

exports.register = (req, res, next) => {
    const { user, pass1, pass2 } = req.body;
    if (pass1.length < 6 || pass2.length < 6) {
        req.flash('message', 'Password must be at least 6 characters');
        req.flash('type', 'danger');
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (pass1 !== pass2) {
        req.flash('message', 'Passwords must match');
        req.flash('type', 'danger');
        return res.status(400).json({ message: 'Passwords must match' });
    }
    bcrypt.hash(pass1, 7).then((hash) => {
        const db = opendb();
        db.run(`INSERT INTO users(username, passkey_hash, role) VALUES(?, ?, ?)`, [user, hash, 0], (err) => {
            if (err) { 
                if (err = "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username") {
                    req.flash('message', "That username has already been taken");
                    req.flash('type', 'danger');
                    res.status(400).json({message: "User not successfully created"});
                } else {
                    req.flash('message', "User not successfully created. Something went wrong...");
                    req.flash('type', 'danger');
                    res.status(500).json({message: "User not successfully created. Something went wrong."});
                    console.log("User not successfully created: " + err.message);
                }
            } else {
                //make flash message when going to /login
                req.flash('message', "Registration successful. Welcome " + user + " to AdventureChat! Please log in.");
                req.flash('type', 'success');
                res.status(201).json({ message: `Registration successful. Welcome ${user} to AdventureChat! Please log in.`, user: user })
            };
        });
        closedb(db);    
    });
    next();
};

exports.login = (req, res, next) => {
    console.log(req.body.user);
    const { user, pass } = req.body
    // Check if username and password is provided
    if (!user) {
        req.flash('message', 'Please enter a username.');
        req.flash('type', 'danger');
        return res.status(400).json({message: "Please enter a username."});
    } 
    if (!pass) {
        req.flash('message', 'Please enter a password.');
        req.flash('type', 'danger');
        return res.status(400).json({message: "Please enter a password."}); 
    }
    //console.log(`SELECT * FROM users WHERE username ='${user}' AND passkey ='${pass}' LIMIT 1`)
    const db = opendb();
    db.get(`SELECT * FROM users WHERE username=? LIMIT 1`, [user], async function (err, row) {
        console.log('finding stuff');
        if (err) {
            req.flash('message', "Login unsuccessful. Something went wrong...");
            req.flash('type', 'danger');
            res.status(500).json({message: "Login unsuccessful. Something went wrong."});
            console.log("Login unsuccessful: " + err.message);
        } else if (!row) {
            req.flash('message', "Invalid username or password.");
            req.flash('type', 'danger');
            res.status(400).json({ message: "Invalid username or password." });
        } else {
            var result = await bcrypt.compare(pass, row.passkey_hash);
            if (result) {
                const maxAge = session_max_age;
                const token = jwt.sign(
                    {id: row.id, user: row.username},
                    jwtSecret,
                    {expiresIn: maxAge}
                );
                res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: maxAge*1000
                });
                //console.log(token); //console.log(row.username);
                req.session.logged_in = true;
                req.session.userid = row.id;
                req.session.user = row.username;
                //console.log(req.session.user);
                res.status(201).json({ message: "Login successful.", token: token });
            } else {
                req.flash('message', "Invalid username or password.");
                req.flash('type', 'danger');
                res.status(400).json({ message: "Invalid username or password." });
            } 
        }
    });
    closedb(db);
};

exports.userAuth = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (token) {
            jwt.verify(token, jwtSecret, (err, decodedToken) => {
                if (err) {
                    req.session.destroy();
                    req.flash('message', "Unauthorized.");
                    req.flash('type', 'danger');
                    return res.status(403).json({ message: "Unauthorized" });
                } else {
                    next();
                }
            });
        } else {
            req.session.destroy();
            req.flash('message', "Unauthorized.");
            req.flash('type', 'danger');
            return res.status(403).json({ message: "Unauthorized" });
        }    
    } catch (err) {
        req.session.destroy();
        req.flash('message', "Unauthorized.");
        req.flash('type', 'danger');
        return res.status(403).json({ message: "Unauthorized" });
    }
    //if (!this.user_is_logged_in(req)) return res.status(401).json({ message: "Unauthorized" });
    //else next();
};

//exports.session_max_age = session_max_age;
exports.sessionMiddleware = sessionMiddleware;
