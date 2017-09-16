var $venueselection = $('#venueselection');
var $editplaylist = $('#editplaylist');
var socket = null;
var socketId = null;
var location = null;

function establishConnection() {
	socket = io();
	socket.on('connect', function() {
		socketId = 
	});
}

function findVenuesNearby() {
	$editplaylist.hide();
	$venueselection.show();
	$venueselection.html('Connecting...');


}

$(function(){
	findVenuesNearby();
});
