export class Utility {
	constructor() {}

	/**
	 *
	 * @returns string
	 */
	static getDate(): string {
		return new Date().toISOString().slice(0, 10);
	}

	/**
	 * Returns in format YYYY
	 * @returns number
	 */
	static getFullYear(): number {
		return new Date().getFullYear();
	}

	/**
	 * Gets current season fall-winter or spring-summer
	 * @returns string
	 */
	static getCurrentSeason(): string {
		const todaysDate = new Date();
		const currentYear = todaysDate.getFullYear();
		if (todaysDate >= new Date(`${currentYear}-07-01`)) {
			return "fall-winter";
		} else {
			return "spring-summer";
		}
	}

	/**
	 * Gets the upcoming Thursday date for the current week in YYYY-MM-DD
	 * @returns string
	 */
	static getThursdayOfCurrentWeek(): string {
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

	/**
	 * Gets the upcoming Friday date for the current week in YYYY-MM-DD
	 * @returns string
	 */
	static getFridayOfCurrentWeek(): string {
		const today = new Date();
		const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		const daysUntilFriday = (5 - currentDayOfWeek + 7) % 7; // Calculate how many days to Friday

		// Set the date to Friday of the current week
		today.setDate(today.getDate() + daysUntilFriday);

		// Format the date as YYYY-MM-DD
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}
}
