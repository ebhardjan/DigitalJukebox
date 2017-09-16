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

YoutubePlayer.prototype.init = function() {
	var iframeScript = $('<script/>');
	iframeScript.attr('src', "https://www.youtube.com/iframe_api");
	playlistManager.youtubePlayer.videoContainer.html(iframeScript);
};

YoutubePlayer.prototype.play = function (playlistElement, callback) {
	$('#video-title').html(playlistElement.name || playlistElement.id);

	this.player.loadVideoById({
		videoId: playlistElement.id,
		startSeconds: 0
	});
	this.onEndCallback = callback;

	this.player.playVideo();
};

YoutubePlayer.prototype.playRandom = function (callback) {
    //stub method
};

// global YT scripts...
// will be called by the yt script when it loads
function onYouTubeIframeAPIReady() {
	playlistManager.youtubePlayer.player = new YT.Player(playlistManager.youtubePlayer.videoContainer.attr('id'), {
		height: '360',
		width: '640',
		videoId: null,
		events: {
			'onReady': playlistManager.youtubePlayer.onReady.bind(playlistManager.youtubePlayer),
			'onStateChange': playlistManager.youtubePlayer.onStateChange.bind(playlistManager.youtubePlayer)
		}
	});
}

