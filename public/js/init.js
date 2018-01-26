//var socket = io();

(function($){
  $(function(){

    $('.button-collapse').sideNav();

  }); // end of document ready
})(jQuery); // end of jQuery name space


$.get( "api/beacons", function( data ) {
	var beacons = {};
	for (const key in data) {
		var bIn = data[key];
		var bKey = bIn.uuid + '.' + bIn.major + '.' + bIn.minor;
		var last = bIn.lastSeen;
		last = moment(bIn.lastSeen).fromNow()
		bIn.lastSeen_friendly = last;
		beacons[bKey] = bIn;
	}
	beaconsList.beacons = beacons;
});

var socket = io.connect(':3001');

socket.on('connection', function(socket){
  
});
socket.on('beacon', function(msg){
	console.log('beacon: ', msg);
	var bIn = msg.beacon;
	var bKey = bIn.uuid + '.' + bIn.major + '.' + bIn.minor;
	last = moment(bIn.lastSeen).fromNow()
	bIn.lastSeen_friendly = last;
	beaconsList.beacons[bKey] = bIn;
  });

var beaconsList = new Vue({
  el: '#beaconsList',
  data: {
    beacons: [],
	ready: function () {
	}
  }
})

setInterval(function () {
	var beacons = beaconsList.beacons;
	for (const key in beacons) {
		beacons[key].lastSeen_friendly = moment(beacons[key].lastSeen).fromNow();
	}
	beaconsList.beacons = beacons;
}, 5000)






moment.updateLocale('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s  : '%d seconds',
        ss : '%d seconds',
        m:  "a minute",
        mm: "%d minutes",
        h:  "an hour",
        hh: "%d hours",
        d:  "a day",
        dd: "%d days",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});