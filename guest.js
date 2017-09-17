const winston = require('winston');

module.exports = class Guest {
	constructor(socket, data, hostLocations) {
		this.socket = socket;
		this.connectionId = socket.id;
		this.locationId = data.locationId;
		this.id = data.id;
		this.hostLocations = hostLocations;
		this.host = null;

		socket.on('disconnect', this.onDisconnectGuest.bind(this));
		socket.on('pickHost', this.onPickHost.bind(this));
		socket.on('addEntry', this.onAddEntry.bind(this));
		socket.on('vote', this.onVote.bind(this));
		socket.on('toHost', this.onToHost.bind(this));

		this.pushAvailableHosts();
	}

	onDisconnectGuest() {
		if (this.host) {
			this.host.guests.delete(this);
		}
	}

	onPickHost(data) {
		const hosts = this.hostLocations.get(this.locationId) || null;
		this.host = (hosts && hosts.find(h => h.id === data.hostId)) || null;
		if (this.host) {
			this.host.guests.add(this);
			this.pushPlaylist();
		}
	}

	onVote(data) {
		if (!this.host) {
			return winston.error('guest: onVote with no host set!');
		}

		const entry = this.host.playlist.getEntry(data.type, data.id);
		if (!entry) {
			return winston.error(`guest: upVote on nonexisting playlist entry ${data.type}, ${data.id}!`);
		}
		switch (data.dir) {
			case 'up':
				entry.voteUp(this); break;
			case 'down':
				entry.voteDown(this); break;
			default:
				return winston.error(`guest: onVote with invalid vote direction ${data.dir}!`);
		}
		this.host.pushPlaylistToAll();
	}

	onAddEntry(data) {
		if(this.host) {
			this.host.playlist.addEntry(data.type, data.id, data.name);
		}
	}

	/**
	 * forward to host
	 */
	onToHost(data) {
		winston.debug(`guest: tunnel to host`, data);
		if (this.host) {
			this.host.pushToHost({...data, guestId: this.id});
		} else {
			winston.error(`guest: no host set!`);
		}
	}

	/**
	 * send up-to-date playlist to this guest.
	 */
	pushPlaylist() {
		if (this.host) {
			const playlist = this.host.playlist.serializeGuest(this);
			this.socket.emit('setPlaylist', {playlist});
		}
	}

	pushAvailableHosts() {
		const hosts = (this.hostLocations.get(this.locationId) || []).map(h => ({name: h.name, id: h.id}));
		this.socket.emit('availableHosts', {hosts});
	}

	/**
	 * forward to guest
	 */
	pushToGuest(data) {
		this.socket.emit('toGuest', data);
	}

	pushDisconnectHost() {
		this.socket.emit('disconnectHost');
	}
};