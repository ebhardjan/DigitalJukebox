var $setupView = null;
var $playerView = null;
var socket = null;
var socketId = null;
var playlistManager = null;
var id = null;

function onNewVenue(event) {
    event.preventDefault();
    var $newVenue = $('#new-venue');
    var $venueName = $('#venue-name');
    var name = $venueName.val();
    if (!name) {
        alert('Please enter a name for the venue.');
        return;
    }
    id = getId();

    $newVenue.hide();
    $newVenue.after('Loading...');

    findLocation(function () {
        establishConnection(function () {
            socket.emit('registerHost', {id: id, name: name, locationId: locationId});
            switchToPlayerView();
        });
    });
}

function establishConnection(cb) {
    socket = io();
    console.log('estabslish connection');
    socket.on('connect', function () {
        console.log("connect");
        socketId = socket.id;
        socket.on('toHost', onToHost);
        socket.on('setPlaylist', onSetPlaylist);
        cb();
    });
}

function switchToSetupView() {
    $setupView.show();
    $playerView.hide();
}

function switchToPlayerView() {
    $setupView.hide();
    $playerView.show();
}

/**
 * forwarded from guest
 */
function onToHost(data) {
    console.log('forwarded from guest ' + JSON.stringify(data));
    if (data.type === 'spotifySearchQuery') {
        searchSpotify(data.payload, function (response) {
            console.log('spotify search result');
            console.log(response);

            var items = response.tracks.items.slice(0, 20);
            var guestData = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                guestData.push({
                    name: item.artists[0].name + ' - ' + item.name,
                    id: item.uri
                })
            }

            pushToGuest({type: 'spotifySearchResults', payload: guestData, guestId: data.guestId});
        });
    }
}

function pushToGuest(data) {
    socket.emit('toGuest', data);
}

function toGuest(data) {
    socket.emit('toGuest', data);
}

function setCurrentPlaylistEntry(data) {
    socket.emit('setCurrentPlaylistEntry', data);
    console.log('emitting set current playlist entry');
}

function onSetPlaylist(data) {
	console.log('incoming playlist update');
	playlistManager.updatePlaylist(data);
}

$(function() {
	$setupView = $('#setup-view');
	$playerView = $('#player-view');

	switchToSetupView();

	$('#new-venue').on('submit', onNewVenue);

	playlistManager = new HostPlaylistManager(setCurrentPlaylistEntry);
	playlistManager.youtubePlayer.init();

	checkLoginSetToken();
	console.log(access_token);
	updateCurrentlyPlaying();
	console.log('playManager:' + JSON.stringify(playlistManager));
});
