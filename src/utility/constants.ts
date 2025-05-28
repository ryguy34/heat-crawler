const constants = Object.freeze({
	SNKRS: {
		BASE_URL: "https://www.nike.com",
		URL: "https://www.nike.com/launch?s=upcoming",
		CATEGORY_ID: "915088080699023401",
		HEADERS: {
			headers: {
				Accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.5",
				"Accept-Encoding": "gzip, deflate, br",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
			},
		},
	},
	SUPREME: {
		COMMUNITY_BASE_URL: "https://www.supremecommunity.com",
		STORE_BASE_URL: "https://us.supreme.com/",
		CATEGORY_ID: "867052008094826546",
	},
	PALACE: {
		COMMUNITY_BASE_URL: "https://www.palacecmty.com",
		STORE_BASE_URL: "https://shop-usa.palaceskateboards.com",
		CATEGORY_ID: "873011958591418448",
	},
	KITH: {
		MONDAY_PROGRAM_URL: "https://kith.com/collections/kith-monday-program",
		CATEGORY_ID: "1358597868096717024",
	},
	params: {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
			"accept-encoding": "*",
		},
	},
	TEST: {
		CATEGORY_ID: "1145474605205688412",
	},
});

export default constants;
