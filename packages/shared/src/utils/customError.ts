/**
 * A specialized error class for handling application-specific exceptions.
 * Extends the built-in Error class to include an HTTP status code, 
 * allowing the global error handler to send consistent responses to the client.
 */

export class CustomError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
