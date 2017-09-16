function YoutubePlayer() {
	this.videoEndsTimeout = null;
	this.player = null;
	this.onEndCallback = null;
	this.videoContainer = $('#youtube-video');
}

YoutubePlayer.prototype.onReady = function(event) {
	event.target.playVideo();
	// TODO fix me
	// this should in theory trigger full screen for the youtube video but it doesn't...
	// https://codepen.io/bfred-it/pen/GgOvLM
	var request_obj = $('#youtube-player');
    var requestFullScreen = request_obj.requestFullScreen
		|| request_obj.mozRequestFullScreen
		|| request_obj.webkitRequestFullScreen;
    if (requestFullScreen) {
        requestFullScreen.bind(request_obj)();
    }
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

