
/**
 * Keep track of playlist of songs/videos.
 * Also keep track of already removed songs so they cannot be added again.
 */
export class Playlist {
	constructor() {
		this.list = [];
	}

	addEntry(entry) {
		this.list.push(entry);
	}

	getEntry(type, id) {
		return this.list.find(e => e.type === type && e.id === id) || null;
	}

	/**
	 * stringify object with data relevant for host, i.e. what entries to play next.
	 */
	serializeHost() {

	}

	/**
	 * stringify object with data relevant for guest, i.e. what entries are up next, what they are called,
	 * how many up-/downvotes they have, ...
	 */
	serializeGuest() {

	}
}

/**
 * An entry for a playlist, either a video or a song. An entry is uniquely identified by type + id.
 * Keeps track of which users voted up or down.
 *
 * We can extend this to a 9gag etc. entry and maintain separate playlists later on...
 */
export class PlaylistEntry {
	constructor(type, id) {
		this.type = type; // 'youtube' or 'spotify'
		this.id = id; // either video ID or song ID
		this.upvotes = new Set();
		this.downvotes = new Set();
	}

	voteUp(guest) {
		this.upvotes.add(guest.id);
		this.downvotes.delete(guest.id);
	}

	voteDown(guest) {
		this.downvotes.add(guest.id);
		this.upvotes.delete(guest.id);
	}

	getBalance() {
		return this.upvotes.size - this.downvotes.size;
	}
}