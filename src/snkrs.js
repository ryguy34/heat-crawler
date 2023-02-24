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
			const response = await axios.get(constants.SNKRS_URL);
			const $ = cheerio.load(response.data);
			var ele = $.find('[aria-label="Feed filter"]');
			console.log(ele.test());
		} catch (error) {
			console.log("Some error: " + error);
		}
		return;
	}
}

module.exports = SNKRS;
