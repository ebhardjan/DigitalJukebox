var $venuesview = null;
var $playlistview = null;
var id = null;
var socket = null;
var socketId = null;

function establishConnection(cb) {
	id = getId();
	socket = io();
	socket.on('connect', function() {
		socketId = socket.id;
		socket.on('setPlaylist', onSetPlaylist);
		socket.on('availableHosts', onAvailableHosts);
		socket.on('toGuest', onToGuest);
		cb();
	});
}

function updateSpotifySearchResults(results) {
	var $searchResults = $('#search-results');
	$searchResults.empty();
	for (var i = 0; i < results.length; i++) {
		(function(song) {
			var el = $('<div class="spotify-song">' + song.name + '</div>');
			el.on('click', function() {
				pushAddEntry('spotify', song.id, song.name);
			});
			$searchResults.append(el);
		})(results[i]);
	}
}

function onSearchSpotify(event) {
	event.preventDefault();
	var searchQuery = $('#search-input').val();
	pushToHost({type: 'spotifySearchQuery', payload: searchQuery});
}

/**
 * forward to host
 */
function pushToHost(data) {
	socket.emit('toHost', data);
}

/**
 * forwarded from host
 */
function onToGuest(data) {
	console.log('data from host: ' + JSON.stringify(data));
	if (data.type === 'spotifySearchResults') {
		updateSpotifySearchResults(data.payload);
	}
}

function findLocation(cb) {
	// TODO
	locationId = 'defaultlocation';
	cb();
}

function switchToVenuesMode() {
	$playlistview.hide();
	$venuesview.show();
	var $venues = $('#venueslist');
	$venues.html('Connecting...');
}

function findVenues() {
	socket.emit('registerGuest', {id: id, locationId: locationId});
}

function onAvailableHosts(data) {
	switchToVenuesMode();

	var $venues = $('#venueslist');
	$venues.empty();
	if (data.hosts.length === 0) {
		$venues.append('no venues found!');
	}
	for (var i = 0; i < data.hosts.length; i++) {
		(function(host){
			var el = $('<div class="venue"><a>' + host.name + '</a></div>');
			el.on('click', function() {
				switchToPlaylistMode();
				pushPickHost(host.id);
				$('#playlistname').html('Playlist at ' + host.name + ':');
			});
			$venues.append(el);
		})(data.hosts[i]);
	}
}

function pushPickHost(id) {
	socket.emit('pickHost', {hostId: id});
}

function switchToPlaylistMode() {
	$venuesview.hide();
	$playlistview.show();
	var $playlist = $('#playlist');
	$playlist.html('Loading...');
}

function onSetPlaylist(data) {
	// re-render whole playlist
	var $playlist = $('#playlist');
	$playlist.empty();

	for (var i = 0; i < data.playlist.length; i++) {
		(function(entry) {
			var upvote = $('<div class="upvote"><i class="fa fa-thumbs-up"></i></div>');
			var downvote = $('<div class="downvote"><i class="fa fa-thumbs-down"></i></div>');
			upvote.on('click', function() {
				pushVote(entry, 'up');
			});
			downvote.on('click', function() {
				pushVote(entry, 'down');
			});

			var el = $('<div class="playlistentry box"/>');
			el.append('<div>type: ' + entry.type + '  name: ' + entry.name + '</div>');
			var votingEl = $('<div class="voting"/>')
			votingEl.append(upvote);
			votingEl.append(entry.balance >= 0 ? '+' : '');
			votingEl.append(entry.balance.toString());
			votingEl.append(downvote);
			el.append(votingEl);

			$playlist.append(el);
		})(data.playlist[i]);
	}

	if (data.playlist.length === 0) {
        var $playlist = $('#playlist');
        $playlist.html('The playlist is empty, add a song!<br><br>');
	}
}

function pushVote(entry, dir) {
	socket.emit('vote', {type: entry.type, id: entry.id, dir: dir});
}

function pushAddEntry(type, id, name) {
	socket.emit('addEntry', {type: type, id: id, name: name});
}

function onAddYoutubeUrl(event) {
	event.preventDefault();
	var url = $('#search-input').val();
	var id = youtubeUrlToId(url);
	if (!id) {
		return alert('invalid youtube url!');
	}
	pushAddEntry('youtube', id, url);
}

function youtubeUrlToId(url) {
	var matches = /.*?v=(.{11}).*/.exec(url);
	return (matches && matches[1]) || null;
}

$(function(){
	$venuesview = $('#venuesview');
	$playlistview = $('#playlistview');

	switchToVenuesMode();

	$('#add-content-form').on('submit', onSearchSpotify);
	$('#search-spotify-submit').on('click', onSearchSpotify);
	$('#youtube-url-submit').on('click', onAddYoutubeUrl);

	findLocation(function() {
		establishConnection(function() {
			findVenues();
		});
	});
});
