"use strict";

var database = require('sqlite');
var path = require('path');

module.exports = class bttrack {
	constructor(config) {
		this.config = config;
		this.beacons = {};
		this.updateCallback;
		this.db = Promise.resolve()
			.then(() => database.open('./db.sqlite', { Promise }))
			.then(db => db.migrate({force: 'last'}));
	}
	
	async getEncounters (max) {
		if(! max && max < 1) {
			max = 1000;
		}
		try {
			const db = await this.db;
			const [select_res] = await Promise.all([
				db.all('SELECT * FROM encounters LIMIT 100'),
			]);
			return select_res;
			
		} catch (err) {
			console.log(err);
			//next(err);
		}
	}
	
	async addEncounter (bIn, insert) {
		var beacon = this.beaconIn(bIn);
		this.updateCallback(beacon);
		if(insert) {
			try {
				const db = await this.db;
				const [insert_res] = await Promise.all([
					db.run('INSERT INTO encounters (sensor_id, beacon_id, mac) VALUES (?,?,?)', beacon.sensorLast, beacon.beacon_id, beacon.mac),
				]);
				if (insert_res.changes === 1 && insert_res.lastID) {
					
					return {success : true, changed_rows : insert_res.changes, inserted_id : insert_res.lastID};
					
				} else {
					return {success : false };
				}
				
			} catch (err) {
				console.log(err);
			}
		}
	}
	
	async lostBeacon (beacon) {
		var bKey = beacon.uuid + '.' + beacon.major + '.' + beacon.minor;
		this.beacons[bKey].active = false;
		this.updateCallback(beacon);
	}
	
	async getAssetByBeacon (known) {
		const db = await this.db;
		const [beacon] = await Promise.all([
			db.get("SELECT beacons.beacon_id, assets.asset_id, assets.name as asset_name, assets.type, assets.extra_json, groups.group_id, groups.name as group_name " +
				"from beacons JOIN assets on beacons.asset_id = assets.asset_id JOIN groups on assets.group_id = groups.group_id " +
				"WHERE uuid = ? AND major = ? AND minor = ?", known.uuid, known.major, known.minor)
		]);
		//console.log(beacon);
		return beacon;
	}
	
	
	async beaconIn(bIn) {
		if(bIn.uuid == undefined || bIn.major == undefined || bIn.minor == undefined) {
			console.log ('ERROR: missing encounter properties');
			return {success : false, message : 'missing encounter properties'};
		} else {
			var bKey = bIn.uuid + '.' + bIn.major + '.' + bIn.minor;
			var beacon = {};
			if (this.beacons[bKey] == undefined) {
				beacon = this.newBeacon(bIn);
				beacon.bKey = bKey;
				beacon.active = true;
				beacon = await this.initBeacon(beacon);
				this.beacons[bKey] = beacon;
			} else {
				var beacon = this.beacons[bKey];
				beacon.active = true;
				for (const key in bIn) {
					if(beacon[key] != undefined) beacon[key] = bIn[key];
				}
				this.beacons[bKey] = beacon;
			}
		}
		return beacon;
	}
	
	
	newBeacon(known) {
		var beaconVanilla = 
		{
			uuid: '',
			beacon_id: '',
			major: 0,
			minor: 0,
			measuredPower: 0,
			rssi: 0,
			accuracy: 0.000000000,
			proximity: 'unk',
			lastSeen: 1516667409780,
			bID: '',
			sensorLast: '00:00:00:00:00',
			locationLast_name: 'unknown',
			active: false,
			asset: {
				asset_id: 0,
				type: 'C',
				asset_name: '',
				group_id: 0,
				group_name: '',
				extra_json	: {}
			}
		}
		for (const key in known) {
				if(known[key] && known[key]) beaconVanilla[key] = known[key];
		}
		return beaconVanilla;
	}
	
	
	async initBeacon(known) {
		const db = await this.db;
		const [result] = await Promise.all([
			db.get("SELECT beacons.beacon_id, assets.asset_id, assets.name as asset_name, assets.type, assets.extra_json, groups.group_id, groups.name as group_name " +
				"from beacons JOIN assets on beacons.asset_id = assets.asset_id JOIN groups on assets.group_id = groups.group_id " +
				"WHERE uuid = ? AND major = ? AND minor = ?", known.uuid, known.major, known.minor)
		]);
		for(const key in result) {
			if(known.asset[key] != undefined) known.asset[key] = result[key];
		}
		return known;
	}
	
	
	async initAllBeacons() {
		const db = await this.db;
		const [result] = await Promise.all([
			db.all("SELECT beacons.*, assets.asset_id, assets.name as asset_name, assets.type, assets.extra_json, groups.group_id, groups.name as group_name " +
				"from beacons JOIN assets on beacons.asset_id = assets.asset_id JOIN groups on assets.group_id = groups.group_id ")
		]);
		
		for (const row of result) {
			var beacon = this.newBeacon();
			for(const key in row) {
				console.log(key, row[key]);
				if(beacon[key] != undefined) beacon[key] = row[key];
				if(beacon.asset[key] != undefined) beacon.asset[key] = row[key];
			}
			if(beacon.uuid != undefined && beacon.major != undefined && beacon.minor != undefined) {
				var bKey = beacon.uuid + '.' + beacon.major + '.' + beacon.minor;
				this.beacons[bKey] = beacon;
				
			}
		}
	}
};