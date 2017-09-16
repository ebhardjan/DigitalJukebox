function Manager(f) {
    this.updatePlaylist = updatePlaylist;
    this.playlist = {};
    this.notifyServer = f;
    this.showMemes = false;
    this.spotifyPlayer = spotifyPlayer;
    this.youtubePlayer = youtubePlayer;
    this.memePlayer = memePlayer;
}

function updatePlaylist(playlist) {
    this.playlist = playlist;
}

/**
 * plays the next element from the playlist
 * if it's a spotify song, we also start showing memes off the playlist
 */
function nextElement() {
    var foundSong = false;
    for (var i = 0; i < this.playlist.length; i++) {
        var playlistElement = playlist[i];
        if (playlistElement.type === 'spotify') {
            spotifyPlayer.play(playlistElement, nextElement);
            this.showMemes = true;
            this.nextMeme();
            this.notifyServer(playlistElement);
            foundSong = true;
        } else if (playlistelement.type === 'youtube') {
            youtubePlayer.play(playlistElement, nextElement);
            this.showMemes = false;
            this.notifyServer(playlistElement);
            foundSong = true;
        }
    }
    if (!foundSong) {
        spotifyPlayer.playRandom(nextElement);
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
            memePlayer.play(playlistElement, nextMeme());
            this.notifyServer(playlistElement);
            foundMeme = true;
        }
    }
    if (!foundMeme) {
        memePlayer.playRandomMeme(nextMeme());
    }
}