const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http').Server(app);
const io = socketio(http);
const Host = require('./host');
const Guest = require('./guest');
const winston = require('winston');
winston.level = 'debug';

// serve 'public' folder
app.use(express.static('public'));
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

