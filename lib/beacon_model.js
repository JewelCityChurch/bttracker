"use strict";

module.exports = class beacon {
	constructor(known, bttrack) {
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
				name: '',
				group_id: 0,
				group_name: '',
				extra_json	: {}
			}
		}
		for (const key in known) {
				if(known[key] && known[key]) beaconVanilla[key] = known[key];
		}
		this.beacon = beaconVanilla;
		this.bttrack = bttrack;
	}
	
	initFromDB () {
		var beacon = this.beacon;
		
		return new Promise((resolve, reject) => {
			this.bttrack.getAssetByBeacon(beacon).then(function(result) {
				for(const key in result) {
					if(beacon.asset[key] != undefined) beacon.asset[key] = result[key];
				}
				beacon.beacon_id = result.beacon_id;
				resolve(beacon);
			}).catch(reject);
		});
	}
};
