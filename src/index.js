const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const crypto = require('crypto')
app.use(bodyParser.json())

const tokenTimeout = Number.parseInt(process.env.token_timeout);

console.log("Using CouchDB: " + process.env.couchUserDB)
console.log("Timeout is set to: " + tokenTimeout)
console.log("Serving under path: " + process.env.token_path)

function createAxios() {
    const adminToken = jwt.sign({"sub": "admin", "_couchdb.roles": ["_admin"]}, process.env.secret);
    return require('axios').create({
        baseURL: process.env.couchUserDB,
        headers: {
            Authorization: "Bearer " + adminToken
        }
    });
}


function initRoutes() {
    const axios = createAxios();

    app.post(process.env.token_path, async function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        let roles = [];

        axios.get('org.couchdb.user:' + username)
            .catch(err => {
                if (!err.response)
                    throw {status: 500, message: "Something unexpected occurred."}
                if (err.response.statusCode === 400)
                    throw {status: 403, message: "Username or password wrong!"}
                throw {status: 500, message: "Something unexpected occurred."}
            })
            .then(res => res.data)
            .then(body => {
                if (body.password_scheme !== 'pbkdf2')
                    throw {status: 403, message: "Your password schema type is not supported!"}

                const derived_key = body.derived_key;
                const iterations = body.iterations;
                const salt = body.salt;

                if (!derived_key || typeof derived_key !== 'string')
                    throw {status: 403, message: "Your password hash is not supported!"}
                if (!iterations || typeof iterations !== 'number')
                    throw {status: 403, message: "Your password hash is not supported!"}
                if (!salt || typeof salt !== 'string')
                    throw {status: 403, message: "Your password hash is not supported!"}

                roles = body.roles;

                return {derived_key: derived_key, iterations: iterations, salt: salt}
            })
            .then(hashData => {
                const calculated = crypto.pbkdf2Sync(password, hashData.salt, hashData.iterations, 20, 'SHA1').toString('hex')
                if (calculated !== hashData.derived_key)
                    throw {status: 403, message: "Username or password wrong!"}
                return true
            })
            .then(passwordOk => {
                return jwt.sign({
                    "sub": username,
                    "_couchdb.roles": roles,
                    "exp": (Math.floor(Date.now() / 1000) + tokenTimeout)
                }, process.env.secret)
            })
            .then(jwt => {
                res.status(200);
                res.send({token: jwt})
                res.end();
            })
            .catch(err => {
                res.status(err.status);
                res.send(err);
                res.end();
            })
    });
}

initRoutes();
app.listen(8080)

