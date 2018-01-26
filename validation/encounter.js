var Joi = require('joi');

module.exports = {
  body: {
    sensor_id: Joi.string().required(),
    mac: Joi.string(),
	uuid: Joi.string(),
	high: Joi.number().integer(),
	low: Joi.number().integer(),
	beacon_id: Joi.number().integer()
  }
};