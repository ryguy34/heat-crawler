import axios from "axios";
import { load } from "cheerio";
import logger from "./config/logger";
const constants = require("./constants");

export class SNKRS {
	constructor() {}

	async getSnkrsDropInfo() {
		try {
			const response = await axios.get(
				constants.SNKRS_URL,
				constants.params
			);
			const $ = load(response.data);
		} catch (error) {
			logger.error("Some error: " + error);
		}
	}
}
