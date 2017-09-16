
/**
 * Keep track of playlist of songs/videos.
 * Also keep track of already removed songs so they cannot be added again.
 */
export class Playlist {
	constructor(host) {
		this.host = host;
		this.list = [];
		this.blacklist = new Set();
	}

	/**
	 * Checks if entry has been added and voted out before, if not then add it to playlist.
	 */
	addEntry(type, id, name) {
		if (this.blacklist.has({type, id})) return;

		const entry = PlaylistEntry(type, id, name, this);
		this.list.push(entry);
		this.host.pushPlaylistToAll();
	}

	getEntry(type, id) {
		return this.list.find(e => e.type === type && e.id === id) || null;
	}

	/**
	 * Return representation with data relevant for host, i.e. what entries to play next.
	 */
	serializeHost() {
		return this.list.map(e => ({type: e.type, id: e.id}));
	}

	/**
	 * Return representation with data relevant for guest, i.e. what entries are up next, what they are called,
	 * how many up-/downvotes they have, ...
	 */
	serializeGuest() {
		return this.list.map(e => ({type: e.type, id: e.id, balance: e.getBalance()}));
	}
}

/**
 * An entry for a playlist, either a video or a song. An entry is uniquely identified by type + id.
 * Keeps track of which users voted up or down.
 *
 * We can extend this to a 9gag etc. entry and maintain separate playlists later on...
 */
export class PlaylistEntry {
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
	}

	/**
	 * If balance is -5, delete from playlist and blacklist.
	 */
	voteDown(guest) {
		this.downvotes.add(guest.id);
		this.upvotes.delete(guest.id);

		if (this.getBalance() <= -5) {
			this.playlist.blacklist.add({type: this.type, id: this.id});
			const idx = this.playlist.list.indexOf(this);
			if(idx >= 0) {
				this.playlist.list.splice(idx, 1);
			}
			this.playlist.host.pushPlaylistToAll();
		}
	}

	getBalance() {
		return this.upvotes.size - this.downvotes.size;
	}
}