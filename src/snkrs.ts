import axios from "axios";
import { load } from "cheerio";

const SnkrsDropInfo = require("./vo/snkrsDropInfo");
const constants = require("./constants");

export class SNKRS {
	snkrsDropInfo: any;

	constructor() {
		//this.snkrsDropInfo = new SnkrsDropInfo();
	}

	async getSnkrsDropInfo() {
		try {
			const response = await axios.get(
				constants.SNKRS_URL,
				constants.params
			);
			const $ = load(response.data);
		} catch (error) {
			console.log("Some error: " + error);
		}
	}
}
