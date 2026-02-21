import { format, addDays } from "date-fns";

/**
 * Utility class providing date manipulation and formatting helpers
 * for scheduling drop notifications across different stores.
 */
class Utility {
	constructor() {}

	/**
	 * Gets the current date in ISO format (YYYY-MM-DD).
	 *
	 * @returns The current date as a string in YYYY-MM-DD format
	 */
	static getDate(): string {
		return new Date().toISOString().slice(0, 10);
	}

	/**
	 * Gets the current year as a 4-digit number.
	 *
	 * @returns The current year (e.g., 2026)
	 */
	static getFullYear(): number {
		return new Date().getFullYear();
	}

	/**
	 * Determines the current Supreme season based on the date.
	 * Fall-Winter runs from July 1st onwards, Spring-Summer before that.
	 *
	 * @returns "fall-winter" or "spring-summer"
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
	 * Gets the upcoming Thursday date for Supreme drops.
	 * If today is Thursday, returns today's date.
	 *
	 * @returns Date string in YYYY-MM-DD format
	 */
	static getThursdayOfCurrentWeek(): string {
		const today = new Date();
		const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		const daysUntilThursday = (4 - currentDayOfWeek + 7) % 7; // Calculate how many days to Thursday, 0 if today is Thursday

		// Set the date to Thursday of the current week
		today.setDate(today.getDate() + daysUntilThursday);

		// Format the date as YYYY-MM-DD
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	/**
	 * Gets the upcoming Friday date for Palace drops.
	 * If today is Friday, returns today's date.
	 *
	 * @returns Date string in YYYY-MM-DD format
	 */
	static getFridayOfCurrentWeek(): string {
		const today = new Date();
		const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
		const daysUntilFriday = (5 - currentDayOfWeek + 7) % 7; // Calculate how many days to Friday, 0 if today is Friday

		// Set the date to Friday of the current week
		today.setDate(today.getDate() + daysUntilFriday);

		// Format the date as YYYY-MM-DD
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	/**
	 * Converts a 3-letter month abbreviation to its 2-digit number.
	 *
	 * @param month - Month abbreviation (e.g., "Jan", "Feb", "Mar")
	 * @returns 2-digit month string (e.g., "01", "02", "03"), or undefined if invalid
	 */
	static convertMonthToNumber(month: string) {
		switch (month) {
			case "Jan":
				return "01";
			case "Feb":
				return "02";
			case "Mar":
				return "03";
			case "Apr":
				return "04";
			case "May":
				return "05";
			case "Jun":
				return "06";
			case "Jul":
				return "07";
			case "Aug":
				return "08";
			case "Sep":
				return "09";
			case "Oct":
				return "10";
			case "Nov":
				return "11";
			case "Dec":
				return "12";
		}
	}

	/**
	 * Gets tomorrow's date for SNKRS drop scheduling.
	 *
	 * @returns Date string in MM-DD format
	 */
	static getTomorrowsDate() {
		const currentDate = new Date();

		// Calculate tomorrow's date
		const tomorrowDate = new Date(currentDate);
		tomorrowDate.setDate(currentDate.getDate() + 1);

		// Get the day and month components of tomorrow's date
		const day = tomorrowDate.getDate().toString().padStart(2, "0");
		const month = (tomorrowDate.getMonth() + 1).toString().padStart(2, "0");

		return `${month}-${day}`;
	}

	/**
	 * Gets the upcoming Monday date for Kith Monday Program drops.
	 * If today is Monday, returns today's date.
	 *
	 * @returns Date string in lowercase mmm-dd format (e.g., "feb-24")
	 */
	static getUpcomingMonday(): string {
		const today = new Date();
		const daysUntilMonday = (8 - today.getDay()) % 7; // Calculate days until next Monday, 0 if today is Monday
		const nextMonday = addDays(today, daysUntilMonday);
		return format(nextMonday, "MMM-dd").toLowerCase(); // Format as "mmm-dd" and convert to lowercase
	}
}

export default Utility;
