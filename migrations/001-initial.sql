--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE beacons (
	beacon_id		TEXT PRIMARY KEY,
	uuid				TEXT,
	major				INTEGER,
	minor				INTEGER,
	asset_id		INTEGER,
	
	CONSTRAINT beacons_fk_assets FOREIGN KEY (asset_id)
     REFERENCES assets (asset_id) ON DELETE CASCADE
);

CREATE TABLE encounters (
	encounter_id	INTEGER PRIMARY KEY,
	timestamp	DATETIME DEFAULT CURRENT_TIMESTAMP,
	sensor_id		INTEGER NOT NULL,
	mac				TEXT,
	beacon_id		INTEGER,
	
	CONSTRAINT enounters_fk_sensors FOREIGN KEY (sensor_id)
     REFERENCES sensors (sensors_id) ON DELETE CASCADE
);

CREATE TABLE sensors (
	sensor_id		TEXT PRIMARY KEY,
	location_id		INTEGER,
	name			TEXT,
	
	CONSTRAINT sensors_fk_locations FOREIGN KEY (location_id)
     REFERENCES locations (location_id)
);

CREATE TABLE locations (
	location_id		INTEGER PRIMARY KEY,
	name			TEXT
);

CREATE TABLE assets (
	asset_id		INTEGER PRIMARY KEY,
	name			TEXT,
	group_id		INTEGER NOT NULL,
	type				TEXT NOT NULL DEFAULT ('C'),
	extra_json				TEXT,
	
	CONSTRAINT assets_fk_groups FOREIGN KEY (group_id)
     REFERENCES groups (group_id)
);

CREATE TABLE groups (
	group_id		INTEGER PRIMARY KEY,
	name			TEXT
);

CREATE INDEX encounters_ix_sensorId ON encounters (sensor_id);

INSERT INTO locations (location_id, name) VALUES (1, 'TestLocation');
INSERT INTO sensors (sensor_id, location_id, name) VALUES ('34:f3:9a:b1:b2:6a', 1, 'DevTestSensor');
INSERT INTO sensors (sensor_id, location_id, name) VALUES ('b8:27:eb:61:dc:7e', 1, 'DevCrowsNest');
INSERT INTO groups (group_id, name) VALUES (1, 'testgroup');
INSERT INTO assets (asset_id, name, group_id, type) VALUES (1,'testasset',1,'T');
INSERT INTO assets (asset_id, name, group_id, type) VALUES (2,'testasset2',1,'T');
INSERT INTO beacons (beacon_id, uuid, major, minor, asset_id) VALUES ('77.77', '00000000000000007777000000000001', 77, 77, 1);
INSERT INTO beacons (uuid, major, minor, asset_id) VALUES ('00000000000000007777000000000001', 78, 100, 2);
INSERT INTO beacons (beacon_id, uuid, major, minor, asset_id) VALUES ('88.88', '13974-8172-1827-fb-9812', 777, 321, 2);
INSERT INTO encounters (sensor_id, beacon_id) VALUES (1,1);
INSERT INTO encounters (sensor_id, beacon_id) VALUES (1,1);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX encounters_ix_sensorId;
DROP TABLE encounters;
DROP TABLE sensors;
DROP TABLE locations;
DROP TABLE beacons;
DROP TABLE assets;
DROP TABLE groups;