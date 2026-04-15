import winston, { Logger, transports, format } from "winston";

/**
 * Configures and exports a reusable Winston logger instance.
 *
 * This logger is set up with three different transports:
 * 1. Console: For logging to the terminal with colors, suitable for development.
 * 2. File (info): For logging all informational messages and above to `success.log`.
 * 3. File (error): For logging only error messages to `error.log`.
 *
 * The log format includes a timestamp, log level, message, and a stack trace for errors.
 * @returns {Logger} The configured Winston logger instance.
 **/

const logger: Logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `[${timestamp}] [${level.toUpperCase()}]: ${message} - Stack: ${stack}`
        : `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, stack }) => {
          return stack
            ? `[${timestamp}] [${level}]: ${message} - Stack: ${stack}`
            : `[${timestamp}] [${level}]: ${message}`;
        }),
      ),
    }),
    new transports.File({ filename: "success.log", level: "info" }),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

export default logger;
