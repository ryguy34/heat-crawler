import winston from "winston";
import fs from "fs";
import path from "path";

// Set log level based on NODE_ENV
const logLevel = process.env.NODE_ENV === "dev" ? "debug" : "info";

// Custom formatter to handle objects and arrays properly
const customFormat = winston.format.printf(
	({ level, message, timestamp, ...meta }) => {
		const formattedMessage =
			typeof message === "object"
				? JSON.stringify(message, null, 2)
				: message;

		const metaString = Object.keys(meta).length
			? JSON.stringify(meta, null, 2)
			: "";

		return `[${timestamp}] ${level}: ${formattedMessage} ${metaString}`;
	},
);

// Base format without colors (used by file transport)
const baseFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	customFormat,
);

// Console format with colors
const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	customFormat,
);

// Create the logger - colorize only on console transport
const logger = winston.createLogger({
	level: logLevel,
	transports: [
		new winston.transports.Console({
			format: consoleFormat,
		}),
	],
});

/**
 * Initialize a log file for the current run.
 * Creates a file transport that mirrors console output (without colors).
 * @param moduleName - Name of the module (e.g., "supreme", "palace", "kith")
 */
export function initLogFile(moduleName: string): void {
	// Create logs directory if it doesn't exist
	const logsDir = path.join(process.cwd(), "logs");
	fs.mkdirSync(logsDir, { recursive: true });

	// Generate timestamp-based filename: <module>-YYYY-MM-DD_HH-mm-ss.log
	const now = new Date();
	const timestamp = now
		.toISOString()
		.replace(/T/, "_")
		.replace(/:/g, "-")
		.replace(/\..+/, "");
	const filename = `${moduleName}-${timestamp}.log`;
	const filepath = path.join(logsDir, filename);

	// Add file transport (uses uncolorized format)
	logger.add(
		new winston.transports.File({
			filename: filepath,
			level: logLevel,
			format: baseFormat,
		}),
	);

	logger.info(`Log file initialized: ${filename}`);
}

export default logger;
