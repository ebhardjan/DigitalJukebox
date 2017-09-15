// handle host interaction here

import {Playlist, PlaylistEntry} from "./playlist";

export default class Host {

	constructor(socket, data) {
		this.socket = socket;
		this.connectionId = socket.id;
		this.playlist = new Playlist();
		this.guests = new Set();

		socket.on('disconnect', this.onDisconnectHost.bind(this));
		socket.on('setCurrentPlaylistEntry', this.onSetCurrentPlaylistEntry.bind(this));
	}

	onDisconnectHost() {
		// TODO disconnect all clients?

	}

	/**
	 * called, when the next song/video plays on the host.
	 */
	onSetCurrentPlaylistEntry(data) {

	}

	/**
	 * send up-to-date playlist to this host.
	 */
	pushPlaylist() {
		// TODO
	}

	/**
	 * send up-to-date playlist to all guests.
	 * call this on votes or next song played.
	 */
	pushPlaylistToAllGuests() {
		this.guests.forEach(guest => guest.pushPlaylist());
	}

}

