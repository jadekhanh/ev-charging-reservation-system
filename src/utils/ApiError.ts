/**
 * A custom API Error class to create middleware that catches async controller errors automatically
 */
export class ApiError extends Error {
    statusCode: number;

    // constructor for the class
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}