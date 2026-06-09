import type { SendCoreErrorDetail } from './types';

const HINTS: Record<number, string> = {
  400: 'Check your request payload for missing or invalid fields.',
  401: 'Your API key is invalid or missing. Get one at https://usesendcore.com/dashboard/api-keys',
  403: "You don't have permission for this action. Check your plan limits or team role.",
  404: 'The requested resource was not found. Verify the ID or endpoint path.',
  413: "Payload too large. Reduce attachment sizes or email content.",
  429: "Rate limit exceeded. Slow down — you'll be retried automatically.",
  500: 'Server error. If this persists, check https://status.usesendcore.com',
  502: 'Temporary gateway error. Automatic retry has been attempted.',
  503: 'Service temporarily unavailable. Automatic retry has been attempted.',
};

function describe(detail: SendCoreErrorDetail): string {
  const hint = HINTS[detail.statusCode];
  const parts = [detail.message];
  if (hint) parts.push(`\n  💡 ${hint}`);
  if (detail.error) parts.push(`\n  🔍 Server detail: ${detail.error}`);
  return parts.join('');
}

export class SendCoreError extends Error {
  public readonly statusCode: number;
  public readonly detail: SendCoreErrorDetail;

  constructor(statusCode: number, detail: SendCoreErrorDetail) {
    super(describe(detail));
    this.name = 'SendCoreError';
    this.statusCode = statusCode;
    this.detail = detail;
    Object.setPrototypeOf(this, SendCoreError.prototype);
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

export function isSendCoreError(err: unknown): err is SendCoreError {
  return err instanceof SendCoreError;
}
