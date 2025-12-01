const constants = Object.freeze({
	SNKRS: {
		BASE_URL: "https://www.nike.com",
		URL: "https://www.nike.com/launch?s=upcoming",
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
	PALACE: {
		COMMUNITY_BASE_URL: "https://www.palacecmty.com",
		STORE_BASE_URL: "https://shop-usa.palaceskateboards.com",
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
	KITH: {
		MONDAY_PROGRAM_URL: "https://kith.com/collections/kith-monday-program",
	},
	params: {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
			"accept-encoding": "gzip, deflate, br",
			accept: "*/*",
		},
	},
});

export default constants;
