const axios = require("axios");
const cheerio = require("cheerio");

console.log("SNKRS Scraper");

// cron expression would wrap this logic

const response = axios.get("https://cheerio.js.org");

const html = response.data;

const $ = cheerio.load(String(response.data));
//console.log($.html());
