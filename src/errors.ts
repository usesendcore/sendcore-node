import type { SendCoreErrorDetail } from './types';

/**
 * Custom error class for SendCore API errors.
 * Contains the HTTP status code and structured error detail from the server.
 */
export class SendCoreError extends Error {
  public readonly statusCode: number;
  public readonly detail: SendCoreErrorDetail;

  constructor(statusCode: number, detail: SendCoreErrorDetail) {
    const msg = detail.message || `SendCore API error (${statusCode})`;
    super(msg);
    this.name = 'SendCoreError';
    this.statusCode = statusCode;
    this.detail = detail;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, SendCoreError.prototype);
  }
}
