class Utility {
	constructor() {}

	static getDate() {
		return new Date().toISOString().slice(0, 10);
	}

	static getFullYear() {
		return new Date().getFullYear();
	}

	static getCurrentSeason() {
		const todaysDate = new Date();
		const currentYear = todaysDate.getFullYear();
		if (todaysDate >= new Date().setFullYear(currentYear, 7, 1)) {
			return "fall-winter";
		} else {
			return "spring-summer";
		}
	}

	// TODO: make method to get current week Thursday date
}

module.exports = Utility;
