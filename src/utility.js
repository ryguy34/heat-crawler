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

	static getThursdayOfCurrentWeek() {
		const today = new Date();
		const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		const daysUntilThursday = (4 - currentDayOfWeek + 7) % 7; // Calculate how many days to Thursday

		// Set the date to Thursday of the current week
		today.setDate(today.getDate() + daysUntilThursday);

		// Format the date as YYYY-MM-DD
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	static getFridayOfCurrentWeek() {
		const today = new Date();
		const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		const daysUntilFriday = (5 - currentDayOfWeek + 7) % 7; // Calculate how many days to Friday

		// Set the date to Thursday of the current week
		today.setDate(today.getDate() + daysUntilFriday);

		// Format the date as YYYY-MM-DD
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}
}

module.exports = Utility;
