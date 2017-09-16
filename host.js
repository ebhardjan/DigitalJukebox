// handle host interaction here
const winston = require('winston');
const {Playlist, PlaylistEntry} = require('./playlist');

module.exports = class Host {

	constructor(socket, data) {
		this.socket = socket;
		this.connectionId = socket.id;
		this.playlist = new Playlist(this);
		this.guests = new Set();
		this.name = data.name;

		socket.on('disconnect', this.onDisconnectHost.bind(this));
		socket.on('setCurrentPlaylistEntry', this.onSetCurrentPlaylistEntry.bind(this));
	}

	onDisconnectHost() {
		// re-send the 'availableHosts' message. guest shall interpret that as a dropped connection.
		this.guests.forEach(guest => {
			guest.host = null;
			guest.availableHosts.splice(guest.availableHosts.indexOf(this), 1);
			guest.pushAvailableHosts()
		});
	}

	/**
	 * Called, when the next song/video plays on the host.
	 */
	onSetCurrentPlaylistEntry(data) {
		// drop all playlist entries before the current one.
		for (let i = 0; i < this.playlist.list.length; i++) {
			const entry = this.playlist.list[i];
			if (entry.type === data.type && entry.id === data.id) {
				this.playlist.list = this.playlist.list.slice(i);
				break;
			}
		}
		this.pushPlaylistToGuests();
		// TODO is there a race condition here?
	}

	/**
	 * Send up-to-date playlist to this host.
	 */
	pushPlaylist() {
		const playlist = this.playlist.serializeHost();
		this.socket.emit('setPlaylist', {playlist});
	}

	pushPlaylistToGuests() {
		this.guests.forEach(guest => guest.pushPlaylist());
	}

	pushPlaylistToAll() {
		this.pushPlaylist();
		this.pushPlaylistToGuests();
	}
};

