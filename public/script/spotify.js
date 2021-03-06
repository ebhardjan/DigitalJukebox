let access_token;
let refresh_token;

function SpotifyPlayer() {
    this.timeout = undefined;
}

function formatSeconds(seconds) {
	var min = Math.floor(seconds / 60).toString();
	var sec = Math.floor(seconds % 60).toString();
	if (sec.length === 1) sec = '0' + sec;
	return min + ':' + sec;
}

SpotifyPlayer.prototype.play = function (playlistElement, callback) {
    if (this.timeout !== undefined) {
        this.timeout.cancel();
        console.log("timeout cancelled");
    }
    setTrackTo(playlistElement.id, function() {
        window.setTimeout(function() {
            getRemainingTime(function (remaining_time, length, progress) {
                console.log(remaining_time * 1000);
                var counter = 0;
                var periodical = setInterval(function() {
                	  var actualProgress = progress + counter/2;
                    var percentage = (actualProgress / length) * 100;
                    $('#fancy-bar-fill').css('width', percentage + '%');
                    counter++;
                    $('#song-time').html(formatSeconds(actualProgress) + ' / ' + formatSeconds(length));
                }, 500);
                this.timeout = window.setTimeout(function f() {
                    console.log("next element callback");
                    window.clearInterval(periodical);
                    callback();
                }, remaining_time * 1000 + 1000);
                updateCurrentlyPlaying();
            }.bind(this));
        }, 1000)}.bind(this));
};

SpotifyPlayer.prototype.playRandom = function (callback) {
    var elements = [{'id': 'spotify:track:0uH3OXsGFEPLylZyi2S9EJ'},
        {'id': 'https://open.spotify.com/track/6o1IkT0nSi9qwfvYDyLC3l'},
        {'id': 'spotify:track:67zorZoUSqyq0uB2s5OCGs'}
    ];
    var random = Math.floor((Math.random() * elements.length));
    var playlistElement = elements[random];
    this.play(playlistElement, callback);
};

SpotifyPlayer.prototype.stop = function (callback) {
    doPut('me/player/pause', {}, function () {
        callback();
    });
};

/*
 Ajax Get and Put methods util methods
 */
function doGet(endpoint, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/' + endpoint,
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
            callback(response);
        }
    });
}

function doPut(endpoint, payload, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/' + endpoint,
        type: 'put',
        data: JSON.stringify(payload),
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': "application/json"
        },
        success: function (response) {
            callback(response);
        },
        error: function () {
            refreshAccessToken();
        }
    });
}

//TODO: untested...
function refreshAccessToken() {
    $.ajax({
        url: '/refresh_token#refresh_token=' + refresh_token,
        success: function (response) {
            alert("successfully refreshed token?");
            console.log(response);
            access_token = response.access_token;
        },
        error: function () {
            console.log("failed to refresh access token");
            alert("fatal error: unable to refresh access token");
        }
    });
}

/**
 * sets the access token global variable
 */
function checkLoginSetToken() {
    const params = _getHashParams();

    if (params.error) {
        alert('There was an error during the authentication');
    } else {
        if (params.access_token) {
            access_token = params.access_token;
            refresh_token = params.refresh_token;
            console.log(refresh_token);
        } else {
            alert('Error? Redirect back to login screen');
        }
    }
}

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function _getHashParams() {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    console.log(hashParams);
    return hashParams;
}

/**
 * update the displayed name, album art etc.
 */
function updateCurrentlyPlaying() {
    doGet('me/player/currently_playing', function (result) {
        const song_name = result['item']['name'];
        const artist_name = result['item']['artists'][0]['name'];
        const progress = parseInt(result['progress_ms']) / 1000;
        const length = parseInt(result['item']['duration_ms']) / 1000;
        const remaining = length - progress;
        const image = result['item']['album']['images'][2]['url']; // this is the largest one
        $('#current_song').text(song_name);
        $('#current_artist').text(artist_name);
        $('#progress').text(progress);
        $('#total_length').text(length);
        $('#remaining').text(remaining);
        $('#album-art').attr('src', image);
        $('#background-image').css('background-image', 'url(' + image + ')');
        console.log(result);
    });
}

/**
 * helper function, queries how much time we have left to play and calls
 * callback with the remaining time as the first argument
 */
function getRemainingTime(callback) {
    doGet('me/player/currently_playing', function (result) {
        const progress = parseInt(result['progress_ms']) / 1000;
        const length = parseInt(result['item']['duration_ms']) / 1000;
        const remaining = length - progress;
        callback(remaining, length, progress);
    });
}

//probably not used...
function setNextTrack() {
    const song_id = $('#next_song_id').val();
    getRemainingTime(function (remaining_time) {
        console.log(remaining_time * 1000);
        window.setTimeout(function f() {
            setTrackTo(song_id, updateCurrentlyPlaying)
        }, remaining_time * 1000);
    });
}

function setTrackTo(songID, callback) {
    const payload = {'uris': [songID]};
    console.log(payload);
    doPut('me/player/play', payload, function (data) {
        callback(data);
    });
}

function searchSpotify(query, cb) {
    doGet('search?q=' + query + '&type=track', cb);
}
