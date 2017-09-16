const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http').Server(app);
const io = socketio(http);
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const Host = require('./host');
const Guest = require('./guest');

const winston = require('winston');
winston.level = 'debug';

var client_id = 'dc5b0bf3bcfe4e01bfaa3ebe4b95d613';
var client_secret = 'df48c711091643b4a32115232480feb6';
var redirect_uri = 'http://localhost:3000/callback';
var stateKey = 'spotify_auth_state';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.get('/login', function(req, res) {

    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    console.log(body);
                });

                // we can also pass the token to the browser to make requests from there
                res.redirect('/host_logged_in.html#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});


// serve 'public' folder
app.use(express.static('public'))
    .use(cookieParser());
http.listen(3000, () => {
	winston.debug('listening on port 3000');
});

const connections = new Map();

// mappings of location => hosts, guests
const hosts = new Map();
const guests = new Map();

// handle socket.io requests
io.on('connection', socket => {
	winston.debug('new connection ' + socket.id);
	connections.set(socket.id, socket);

	socket.on('registerHost', data => {
		winston.debug(`register host`, data);
		const locationId = data.locationId;
		if (!hosts.has(locationId)) hosts.set(locationId, []);
		hosts.get(locationId).push(new Host(socket, data));
	});

	socket.on('registerGuest', data => {
		winston.debug(`register guest`, data);
		const locationId = data.locationId;
		const availableHosts = hosts.get(locationId) || [];

		if (!guests.has(locationId)) guests.set(locationId, []);
		guests.get(locationId).push(new Guest(socket, data, availableHosts));
	});

	socket.on('disconnect', () => {
		winston.debug(`disconnect ${socket.id}`);
		connections.delete(socket.id)
	});
});

