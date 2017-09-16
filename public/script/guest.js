var $venuesview = null;
var $playlistview = null;
var id = null;
var socket = null;
var socketId = null;
var location = null;

function establishConnection(cb) {
	id =
	socket = io();
	socket.on('connect', function() {
		socketId = socket.id;
		socket.on('setPlaylist', onSetPlaylist);
		socket.on('availableHosts', onAvailableHosts);
		cb();
	});
}

function findLocation(cb) {
	// TODO
	location = 'defaultlocation';
	cb();
}

function switchToVenuesMode() {
	$playlistview.hide();
	$venuesview.show();
	$venuesview.html('Connecting...');

	findLocation(function() {
		establishConnection(function() {
			findVenues();
		});
	});
}

function findVenues() {
	socket.emit('registerGuest', {});
}

function onAvailableHosts(data) {
	var $venues = $('#venueslist');
	$venues.clear();
	for (var i = 0; i < data.hosts.length; i++) {
		(function(host){
			var el = $('<div><a>name: ' + host.name + '</a></div>');
			el.on('click', function() {
				switchToPlaylistMode();
				pushPickHost(host.id);
			});
			$venues.append(el);
		})(data.hosts[i]);
	}
}

function pushPickHost(id) {
	socket.emit('pickHost', {host: id});
}

function switchToPlaylistMode() {
	$venuesview.hide();
	$playlistview.show();
	$playlistview.html('Loading...');
}

function onSetPlaylist() { }

function pushVote() { }

function pushAddEntry() { }

$(function(){
	$venuesview = $('#venuesview');
	$playlistview = $('#playlistview');
	switchToVenuesMode();
});
