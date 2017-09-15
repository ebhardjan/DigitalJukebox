
const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http').Server(app);
const io = socketio(http);

// serve 'public' folder
app.use(express.static('public'));
http.listen(3000, () => {
	console.log('listening on port 3000');
});

io.on('connection', socket => {
	const id = socket.id;
	// do stuff

	socket.on('disconnect', () => {
		// clean up
	});
});

