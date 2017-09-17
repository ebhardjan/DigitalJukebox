var locationId = null;

function findLocation(cb) {
	$.ajax('https://ipinfo.io', {
		success: function(response) {
			locationId = response.ip.toString();
			cb();
		},
		error: function() {
			console.log('getting location failed!');
			locationId = 'defaultlocation';
			cb();
		},
		dataType: 'jsonp'
	});
}

function getId() {
	// TODO
	return Math.random().toString();
}
