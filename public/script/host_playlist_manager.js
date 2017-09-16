function HostPlaylistManager(f) {
    this.playlist = {};
    this.notifyServer = f;
    this.showMemes = false;
    this.spotifyPlayer = new SpotifyPlayer();
    this.youtubePlayer = new YoutubePlayer();
    this.memePlayer = new MemePlayer();
}

HostPlaylistManager.prototype.updatePlaylist = function(playlist) {
    console.log('HostPlaylistManager: updatePlaylist to ' + JSON.stringify(playlist));
    this.playlist = playlist;
};

/**
 * plays the next element from the playlist
 * if it's a spotify song, we also start showing memes off the playlist
 */
HostPlaylistManager.prototype.nextElement = function() {
    console.log('PlaylistManager, nextElement()');

    if (this.playlist === undefined || this.playlist.playlist === undefined
        || this.playlist.playlist.length === 0) {
        this.spotifyPlayer.playRandom(this.nextElement.bind(this));
        return;
    }

    var foundSong = false;

    for (var i = 0; i < this.playlist.playlist.length; i++) {
        var playlistElement = this.playlist.playlist[i];
        if (playlistElement.type === 'spotify') {
            this.spotifyPlayer.play(playlistElement, this.nextElement.bind(this));
            this.showMemes = true;
            this.nextMeme();
            this.notifyServer(playlistElement);
            foundSong = true;
            return;
        } else if (playlistElement.type === 'youtube') {

            this.youtubePlayer.play(playlistElement, this.nextElement.bind(this));
            this.spotifyPlayer.stop(function(){});
            this.showMemes = false;
            this.notifyServer(playlistElement);
            foundSong = true;
            return;
        }
    }
    if (!foundSong) {
        this.spotifyPlayer.playRandom(this.nextElement.bind(this));
    }
};

/**
 * plays the next meme on the meme player
 */
HostPlaylistManager.prototype.nextMeme = function() {
    if (!this.showMemes) {
        return;
    }

    var foundMeme = false;
    for (var i = 0; i < this.playlist.length; i++) {
        var playlistElement = playlist[i];
        if (playlistElement.type === '9gag') {
            this.memePlayer.play(playlistElement, nextMeme());
            this.notifyServer(playlistElement);
            foundMeme = true;
            return;
        }
    }
    if (!foundMeme) {
        this.memePlayer.playRandom(this.nextMeme.bind(this));
    }
};
