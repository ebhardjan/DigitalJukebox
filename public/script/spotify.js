let access_token;
let refresh_token;

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
    doGet('me/player/currently_playing', function (result) {
        const progress = parseInt(result['progress_ms']) / 1000;
        const length = parseInt(result['item']['duration_ms']) / 1000;
        const remaining = length - progress;
        callback(remaining);
    });
}

function setNextTrack() {
    const song_id = $('#next_song_id').val();
    getRemainingTime(function (remaining_time) {
        console.log(remaining_time * 1000);
        window.setTimeout(function f() {
            setTrackTo(song_id)
        }, remaining_time * 1000);
    });
}

function setTrackTo(songID) {
    const payload = {'uris': [songID]};
    console.log(payload);
    doPut('me/player/play', payload, function (data) {
        updateCurrentlyPlaying();
    });
}

function searchSpotify(query, cb) {
    doGet('search?q='+query+'&type=track', cb);
}
