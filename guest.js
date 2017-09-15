
export default class Guest {
	constructor(socket, data, hosts) {
		this.socket = socket;
		this.connectionId = socket.id;
		this.id = data.id;
		this.availableHosts = hosts;
		this.host = null;

		socket.on('disconnect', this.onDisconnectGuest.bind(this));
		socket.on('pickHost', this.onPickHost.bind(this));
		socket.on('addEntry', this.onAddEntry.bind(this));
		socket.on('vote', this.onVote.bind(this));

		socket.emit('availableHosts', {
			hosts: this.availableHosts.map(h => ({name: h.name, id: h.id}))
		});
	}

	onDisconnectGuest() {
		if (this.host) {
			this.host.guests.remove(this);
		}
	}

	onPickHost(data) {
		this.host = this.availableHosts.find(h => h.id === data.host) || null;
		if (this.host) {
			this.host.guests.add(this);
			this.pushPlaylist();
		}
	}

	onVote(data) {
		if (!this.host) {
			return console.log('guest: onVote with no host set!');
		}

		const entry = this.host.playlist.getEntry(data.type, data.id);
		if (!entry) {
			return console.log(`guest: upVote on nonexisting playlist entry ${data.type}, ${data.id}!`);
		}
		switch (data.dir) {
			case 'up':
				entry.voteUp(this); break;
			case 'down':
				entry.voteDown(this); break;
			default:
				return console.log(`guest: onVote with invalid vote direction ${data.dir}!`);
		}
		this.host.pushPlaylistToAllGuests();
	}

	onAddEntry(data) {
		// TODO
	}

	/**
	 * send up-to-date playlist to this guest.
	 */
	pushPlaylist() {
		// TODO
	}
}