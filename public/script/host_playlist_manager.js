function HostPlaylistManager(f) {
    this.playlist = {};
    this.notifyServer = f;
    this.showMemes = false;
    this.spotifyPlayer = new SpotifyPlayer();
    this.youtubePlayer = new YoutubePlayer();
    this.memePlayer = new MemePlayer();
}

HostPlaylistManager.prototype.updatePlaylist = function(playlist) {
    console.log('host playlist manager, updatePlaylist:' + JSON.stringify(playlist));
    this.playlist = playlist;
};

/**
 * plays the next element from the playlist
 * if it's a spotify song, we also start showing memes off the playlist
 */
HostPlaylistManager.prototype.nextElement = function() {
    console.log('PlaylistManager, nextElement()');

    if (this.playlist === undefined) {
        this.spotifyPlayer.playRandom(this.nextElement);
    }

    var foundSong = false;

    for (var i = 0; i < this.playlist.length; i++) {
        var playlistElement = playlist[i];
        if (playlistElement.type === 'spotify') {
            this.spotifyPlayer.play(playlistElement, this.nextElement);
            this.showMemes = true;
            this.nextMeme();
            this.notifyServer(playlistElement);
            foundSong = true;
        } else if (playlistelement.type === 'youtube') {
            this.youtubePlayer.play(playlistElement, this.nextElement);
            this.showMemes = false;
            this.notifyServer(playlistElement);
            foundSong = true;
        }
    }
    if (!foundSong) {
        this.spotifyPlayer.playRandom(this.nextElement);
    }
}

/**
 * plays the next meme on the meme player
 */
function nextMeme() {
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
        }
    }
    if (!foundMeme) {
        this.memePlayer.playRandom(nextMeme());
    }
}