var $setupView = null;
var $playerView = null;
var socket = null;
var socketId = null;

function onNewVenue() {
	var $newVenue = $('#new-venue');
	var $venueName = $('#venue-name');
	var name = $venueName.val();
	if (!name) {
		alert('Please enter a name for the venue.');
		return;
	}

	$newVenue.hide();
	$newVenue.after('Loading...');


	findLocation(function () {
		establishConnection(function() {
			socket.emit('registerHost', {name: name, locationId: locationId});
			switchToPlayerView();
		});
	});
}

function establishConnection(cb) {
	socket = io();
	socket.on('connect', function() {
		socketId = socket.id;

		cb();
	});
}

function switchToPlayerView() {
	$setupView.hide();
	$playerView.show();
}

$(function() {
	var $newVenue = $('#new-venue');
	$setupView = $('#setup-view');
	$playerView = $('#player-view');

	$newVenue.on('click', onNewVenue);
});