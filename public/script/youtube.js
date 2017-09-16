function YoutubePlayer() {
	this.videoEndsTimeout = null;
	this.player = null;
	this.onEndCallback = null;
	this.videoContainer = $('#youtube-video');
}

YoutubePlayer.prototype.onReady = function(event) {
	event.target.playVideo();
};

YoutubePlayer.prototype.onStateChange = function(event) {
	var that = this;
	if (event.data === YT.PlayerState.PLAYING) {
		var timeLeft = this.player.getDuration() - this.player.getCurrentTime();
		this.videoEndsTimeout = setTimeout(function() {
			that.player.stopVideo();
			that.videoContainer.html();
			if (typeof that.onEndCallback === 'function') that.onEndCallback();
		}, timeLeft - 0.5);
	} else {
		if(this.videoEndsTimeout) {
			clearTimeout(this.videoEndsTimeout);
			this.videoEndsTimeout = null;
		}
	}
};

YoutubePlayer.prototype.play = function (playlistElement, callback) {
	this.onEndCallback = callback;
	$('#video-title').html(playlistElement.name);

	var iframeScript = $('<script/>');
	iframeScript.attr('src', "https://www.youtube.com/iframe_api");
	this.videoContainer.html(iframeScript);

	// will be called by the yt script when it loads
	var that = this;
	window.onYouTubeIframeAPIReady = function() {
		this.player = new YT.Player('player', {
			height: '360',
			width: '640',
			videoId: playlistElement.id,
			events: {
				'onReady': that.onReady.bind(that),
				'onStateChange': that.onStateChange.bind(that)
			}
		});
	}
};

YoutubePlayer.prototype.playRandom = function (callback) {
    //stub method
};
