var access_token;
var refresh_token;

/*
 Ajax Get and Put methods util methods
 */
function doGet(endpoint, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/me/' + endpoint,
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
        url: 'https://api.spotify.com/v1/me/' + endpoint,
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
        url: '/refresh_token#refresh_token='+refresh_token,
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
    var params = _getHashParams();

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
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
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
    doGet('player/currently_playing', function (result) {
        var song_name = result['item']['name'];
        var artist_name = result['item']['artists'][0]['name'];
        var progress = parseInt(result['progress_ms']) / 1000;
        var length = parseInt(result['item']['duration_ms']) / 1000;
        var remaining = length - progress;
        $('#current_song').text(song_name);
        $('#current_artist').text(artist_name);
        $('#progress').text(progress);
        $('#total_length').text(length);
        $('#remaining').text(remaining);
        console.log(result);
    });
}

/**
 * helper function, queries how much time we have left to play and calls
 * callback with the remaining time as the first argument
 */
function getRemainingTime(callback) {
    doGet('player/currently_playing', function (result) {
        var progress = parseInt(result['progress_ms']) / 1000;
        var length = parseInt(result['item']['duration_ms']) / 1000;
        var remaining = length - progress;
        callback(remaining);
    });
}

function setNextTrack() {
    var song_id = $('#next_song_id').val();
    getRemainingTime(function (remaining_time) {
        console.log(remaining_time * 1000);
        window.setTimeout(function f() {
            setTrackTo(song_id)
        }, remaining_time * 1000);
    });
}

function setTrackTo(songID) {
    var payload = {'uris': [songID]};
    console.log(payload);
    doPut('player/play', payload, function (data) {
        updateCurrentlyPlaying();
    });
}
