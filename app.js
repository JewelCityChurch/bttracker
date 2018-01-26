var express = require('express');
var morgan = require('morgan'); // logging
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var bttrack_model = require('./lib/bttrack_model.js');
var beacon_model = require('./lib/beacon_model.js');
var validator = require('express-validator');

var app = express();
app.use(morgan('dev')); // logging
app.use(bodyParser.json());
app.use(validator());

var bttrack = new bttrack_model({test:123});
bttrack.initAllBeacons().then(function(result) { console.log(bttrack.beacons) });


var beacons = {};


//View stuff
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.post('/api/encounters/:sensor_id', function (req, res) {
	try {
		var beacon = verifyBeacon(req.params.sensor_id, req.body)
		bttrack.addEncounter(beacon, true).then(function(result) {
			console.log(bttrack.beacons);
		});
		res.send('');
	} catch(e) {
		console.log(e);
		res.status(e.code).send(e.message);  
	};
});

app.post('/api/lostBeacon/:sensor_id', function (req, res) {
	try {
		var beacon = verifyBeacon(req.params.sensor_id, req.body)
		bttrack.lostBeacon(beacon).then(function(result) {
			console.log(bttrack.beacons);
		});
		res.send('');
	} catch(e) {
		console.log(e);
		res.status(e.code).send(e.message);  
	};
});

app.post('/api/beaconUpdate/:sensor_id', function (req, res) {
	try {
		var beaconsIn = req.body;
		
		for (const key in beaconsIn) {
			var beacon = beaconsIn[key];
			beacon = verifyBeacon(req.params.sensor_id, beacon)
			bttrack.addEncounter(beacon, false).then(function(result) {
				//console.log(bttrack.beacons);
			});
		}
		res.send('');
	} catch(e) {
		console.log(e);
		res.status(e.code).send(e.message);  
	};
});

app.get('/api/beacons', function (req, res) {
		res.json(bttrack.beacons);
});


bttrack.updateCallback = async function beaconBroadcast (beacon) {
	beacon = await beacon;
	console.log('beacon broadcast', {"beacon": beacon});
	io.emit('beacon', {"beacon": beacon});
}

io.on('connection', function(socket){
  console.log('ws connection');
});

http.listen(3001, function(){
  console.log('listening on *:3000');
});



function verifyBeacon(sensor_id, beacon) {
	beacon.sensorLast = sensor_id;
	if(beacon.uuid == undefined || beacon.major == undefined || beacon.minor == undefined) {
		throw { code : 422, message : 'missing parameters' };
	} else {
		return beacon;
	}
}



app.get('/', async (req, res, next) => {
	let encounters = bttrack.getEncounters();
	
	encounters.then(function(result) {
		res.render('index',  { encounters : result});
	});
	
});

app.listen(3000, function() {
	console.log('Server started on port 3000');
});