const winston = require('winston');

/**
 * Keep track of playlist of songs/videos.
 * Also keep track of already removed songs so they cannot be added again.
 */
class Playlist {
	constructor(host, nDownvotes, sortByPopularity) {
		this.host = host;
		this.nDownvotes = nDownvotes;
		this.sortByPopularity = sortByPopularity;
		this.list = [];
		this.blacklist = new Set();
	}

	/**
	 * Add entry to playlist.
	 * Not valid if already in playist, or if the entry has been voted out before.
	 */
	addEntry(type, id, name) {
		if (this.blacklist.has({type, id})) return;
		if (this.list.find(e => e.type === type && e.id === id)) return;

		const entry = new PlaylistEntry(type, id, name, this);
		this.list.push(entry);
		this.maybeSort();
		this.host.pushPlaylistToAll();
	}

	maybeSort() {
		if (this.sortByPopularity) {
			const tmp = this.list[0];
			this.list = this.list.slice(1).sort((lhs, rhs) => rhs.getBalance() - lhs.getBalance());
			if (tmp) this.list.unshift(tmp);
		}
	}

	getEntry(type, id) {
		return this.list.find(e => e.type === type && e.id === id) || null;
	}

	/**
	 * Return representation with data relevant for host, i.e. what entries to play next.
	 */
	serializeHost() {
		return this.list.map(e => ({type: e.type, id: e.id, name: e.name, balance: e.getBalance()}));
	}

	/**
	 * Return representation with data relevant for guest, i.e. what entries are up next, what they are called,
	 * how many up-/downvotes they have, ...
	 */
	serializeGuest(guest) {
		return this.list.map(e => ({
			type: e.type,
			id: e.id,
			balance: e.getBalance(),
			name: e.name,
			yourVote: e.upvotes.has(guest.id) ? 'up' : (e.downvotes.has(guest.id) ? 'down' : null)
		}));
	}
}

/**
 * An entry for a playlist, either a video or a song. An entry is uniquely identified by type + id.
 * Keeps track of which users voted up or down.
 *
 * We can extend this to a 9gag etc. entry and maintain separate playlists later on...
 */
class PlaylistEntry {
	constructor(type, id, name, playlist) {
		this.type = type; // 'youtube' or 'spotify'
		this.id = id; // either video ID or song ID
		this.name = name;
		this.playlist = playlist;
		this.upvotes = new Set();
		this.downvotes = new Set();
	}

	voteUp(guest) {
		this.upvotes.add(guest.id);
		this.downvotes.delete(guest.id);
		this.playlist.maybeSort();
	}

	/**
	 * If balance is too low, delete from playlist and blacklist.
	 */
	voteDown(guest) {
		this.downvotes.add(guest.id);
		this.upvotes.delete(guest.id);

		if (this.getBalance() <= -this.playlist.nDownvotes) {
			this.playlist.blacklist.add({type: this.type, id: this.id});
			const idx = this.playlist.list.indexOf(this);
			if(idx >= 0) {
				this.playlist.list.splice(idx, 1);
			}
		}
		this.playlist.maybeSort();
	}

	getBalance() {
		return this.upvotes.size - this.downvotes.size;
	}
}

module.exports = {Playlist, PlaylistEntry};