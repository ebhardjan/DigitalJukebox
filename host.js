// handle host interaction here
const winston = require('winston');
const {Playlist, PlaylistEntry} = require('./playlist');

module.exports = class Host {

	constructor(socket, data, hostLocations, guestLocations) {
		const venueSettings = data.venueSettings;
		this.id = data.id;
		this.socket = socket;
		this.connectionId = socket.id;
		this.guests = new Set();
		this.name = venueSettings.name;
		this.nDownvotes = venueSettings.nDownvotes;
		this.sortByPopularity = venueSettings.sortByPopularity;
		this.locationId = data.locationId;
		this.hostLocations = hostLocations;
		this.guestLocations = guestLocations;
		this.playlist = new Playlist(this, this.nDownvotes, this.sortByPopularity);

		socket.on('disconnect', this.onDisconnectHost.bind(this));
		socket.on('setCurrentPlaylistEntry', this.onSetCurrentPlaylistEntry.bind(this));
		socket.on('toGuest', this.onToGuest.bind(this));
	}

	onDisconnectHost() {
		// delete from global hosts list
		this.hostLocations.set(this.locationId, this.hostLocations.get(this.locationId).filter(h => h !== this));

		// disconnect from connected guests
		this.guests.forEach(guest => {
			guest.host = null;
			guest.pushDisconnectHost();
		});

		// re-send the 'availableHosts' message, to all guests
		(this.guestLocations.get(this.locationId) || []).forEach(g => g.pushAvailableHosts());
	}

	/**
	 * Called, when the next song/video plays on the host.
	 */
	onSetCurrentPlaylistEntry(data) {
		// drop all playlist entries before the current one.
		for (let i = 0; i < this.playlist.list.length; i++) {
			const entry = this.playlist.list[i];
			if (entry.type === data.type && entry.id === data.id) {
				this.playlist.list = this.playlist.list.slice(i + 1);
				break;
			}
		}
		this.playlist.list.unshift(new PlaylistEntry(data.type, data.id, data.name, this.playlist));
		this.pushPlaylistToAll();
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

	/**
	 * forward to host
	 */
	pushToHost(data) {
		this.socket.emit('toHost', data);
	}

	/**
	 * forward to a guest
	 */
	onToGuest(data) {
		winston.debug(`host: tunnel to guest`, data);
		// find guest
		let guest = null;
		for (let g of this.guests) {
			if (g.id === data.guestId) {
				guest = g; break;
			}
		}
		if (!guest) {
			return winston.error(`no guest with id ${data.guestId} found to foward data!`, data);
		}
		guest.pushToGuest(data);
	}
};

