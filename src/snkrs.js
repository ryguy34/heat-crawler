const axios = require("axios");
const cheerio = require("cheerio");
const snkrsDropInfo = require("./vo/snkrsDropInfo");
const constants = require("./constants");

class SNKRS {
	constructor() {
		this.snkrsDropInfo = new snkrsDropInfo();
	}

	async getSnkrsDropInfo() {
		try {
			const response = await axios.get(constants.SNKRS_URL, constants.params);
			const $ = cheerio.load(response.data);
		} catch (error) {
			console.log("Some error: " + error);
		}
	}
}

module.exports = SNKRS;
