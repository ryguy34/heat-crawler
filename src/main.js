const Discord = require("./discord");
const SNKRS = require("./snkrs");
const Supreme = require("./supreme");
var cron = require("node-cron");

const snkrs = new SNKRS();
const supreme = new Supreme();
const discord = new Discord();
//discord.doesChannelExist("week-1");

var supremeDiscordTextChannelInfo = supreme.parseSupremeDrop();
