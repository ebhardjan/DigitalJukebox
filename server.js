
const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http').Server(app);
const io = socketio(http);

import Host from './host';
import Guest from "./guest";

// serve 'public' folder
app.use(express.static('public'));
http.listen(3000, () => {
	console.log('listening on port 3000');
});

const connections = new Map();

// mappings of location => hosts, guests
const hosts = new Map();
const guests = new Map();

io.on('connection', socket => {
	connections.set(socket.id, socket);

	socket.on('registerHost', data => {
		const locationId = data.locationId;
		if (!hosts.has(locationId)) hosts.set(locationId, []);
		hosts.get(locationId).push(new Host(socket, data));
	});

	socket.on('registerGuest', data => {
		const locationId = data.locationId;
		const availableHosts = hosts.get(locationId) || [];

		if (!guests.has(locationId)) guests.set(locationId, []);
		guests.get(locationId).push(new Guest(socket, data, availableHosts));
	});

	socket.on('disconnect', () => connections.delete(socket.id));
});

