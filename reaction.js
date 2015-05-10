var player = null;
var recorder = null;
var query = {};
var prepTime = 3;
var defaultReactionTime = 3;

var init = function() {
	iframe = document.getElementsByTagName('iframe')[0];
	player = new playerjs.Player(iframe);
	console.log('created player')
	
	player.on('ready', function() {
		console.log('set current time', query['start'])
		player.setCurrentTime(parseInt(query['start']))
		player.pause();
	})
}

var parseQuerystring = function() {
	query['reaction_time'] = defaultReactionTime;
	$.each(document.location.search.substr(1).split('&'), function(idx, val) {
		var parts = val.split('=');
		query[parts[0].toString()] = parts[1].toString();
	})
	query['url'] = decodeURIComponent(query['url'])
	query['start'] = parseInt(query['start'])
	query['playtime'] = parseInt(query['playtime'])
	query['reaction_time'] = parseInt(query['reaction_time'])
}

document.addEventListener('DOMContentLoaded', function() {
	var goButton = document.getElementById('go');
	goButton.addEventListener('click', go)

	var newUrlButton = document.getElementById('new-url-go');
	newUrlButton.addEventListener('click', function() {
		newQuery = {
			'url': $('#url').val(),
			'start': $('#start').val(),
			'playtime': $('#playtime').val(),
			'reaction_time': $('#reaction-time').val(),
		}

		console.log('new query', $.param(newQuery))

		document.location.search = '?' + $.param(newQuery)
	})

	parseQuerystring()

	$('#url').val(query['url']);
	$('#start').val(query['start']);
	$('#playtime').val(query['playtime']);
	$('#reaction-time').val(query['reaction_time']);

	$('#video-embed').html('<a href="' + query['url'] + '" class="embedly-card"></a>')
	
	recorder = ZiggeoApi.Embed.embed('#recorder', {
		'width': 250,
		'height': 200,
		//'responsive': true,
		'disable_first_screen': true,
		'countdown': prepTime,
		'disable_snapshots': true,
		'immediate_playback': true,
	});
})

var go = function() {
	if (player === null) {
		init()
		//return;
	}

	console.log('play!', player)
	player.on('ready', function() {
		window.setTimeout(function() {
			player.unmute()
			player.play()
			playing = true;
		}, (prepTime + 1) * 1000)
	})

	player.on('timeupdate', function(time) {
		if (playing && time.seconds > query.start + query.playtime) {
			playing = false;
			player.pause();
			console.log('hit end of playtime', query.playtime)
			window.setTimeout(function() {
				recorder.stopRecord();
				console.log('hit end of reaction time', query.reaction_time)
			}, query.reaction_time * 1000)
		}
	})

	console.log('record!', recorder)
	recorder.record();

	ZiggeoApi.Events.on('finished', function(data) {
		console.log(data);
		$('#ziggeo-url').val(data.sources[0]);
	});
}
