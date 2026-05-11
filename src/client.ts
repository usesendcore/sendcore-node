import type {
  SendCoreConfig,
  SendEmailParams,
  SendEmailResponse,
  SubscribeParams,
  UnsubscribeParams,
} from './types';
import { SendCoreError } from './errors';

const DEFAULT_BASE_URL = 'https://api.usesendcore.com';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 2;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const SDK_VERSION = '1.0.1';

/**
 * SendCore — Official Node.js SDK
 *
 * @example
 * ```ts
 * import { SendCore } from 'sendcore';
 *
 * const sendcore = new SendCore('sc_live_xxxxxxxxxx');
 *
 * await sendcore.emails.send({
 *   from: 'hello@yourdomain.com',
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<h1>Hello World</h1>',
 * });
 * ```
 */
export class SendCore {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;

  /** Email operations */
  public readonly emails: EmailsResource;
  /** Audience / contact operations */
  public readonly contacts: ContactsResource;

  constructor(apiKeyOrConfig: string | SendCoreConfig) {
    const config: SendCoreConfig =
      typeof apiKeyOrConfig === 'string'
        ? { apiKey: apiKeyOrConfig }
        : apiKeyOrConfig;

    if (!config.apiKey) {
      throw new Error(
        'SendCore: An API key is required. Get one at https://usesendcore.com/dashboard/api-keys'
      );
    }

    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retries = config.retries ?? DEFAULT_RETRIES;

    // Initialize resource namespaces
    this.emails = new EmailsResource(this);
    this.contacts = new ContactsResource(this);
  }

  // ─── Internal HTTP layer ────────────────────

  /** @internal */
  async _request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': `sendcore-node/${SDK_VERSION}`,
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);

        // Parse response body
        const responseBody = await response.json().catch(() => ({}));

        // Success
        if (response.ok) {
          return responseBody as T;
        }

        // Non-retryable error — throw immediately
        if (!RETRYABLE_STATUS_CODES.has(response.status)) {
          throw new SendCoreError(response.status, {
            statusCode: response.status,
            message: responseBody.message || response.statusText,
            error: responseBody.error,
            ...responseBody,
          });
        }

        // Retryable error — store and continue
        lastError = new SendCoreError(response.status, {
          statusCode: response.status,
          message: responseBody.message || response.statusText,
          error: responseBody.error,
          ...responseBody,
        });
      } catch (err) {
        if (err instanceof SendCoreError) throw err;
        lastError = err as Error;
      }

      // Exponential backoff before retry
      if (attempt < this.retries) {
        const delay = Math.min(1000 * 2 ** attempt, 10_000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError ?? new Error('SendCore: Request failed after retries');
  }
}

// ─── Resource: Emails ─────────────────────────

class EmailsResource {
  constructor(private readonly client: SendCore) { }

  /**
   * Send an email.
   *
   * @example
   * ```ts
   * const result = await sendcore.emails.send({
   *   from: 'hello@yourdomain.com',
   *   to: 'user@example.com',
   *   subject: 'Hello!',
   *   html: '<h1>Welcome</h1>',
   * });
   * ```
   */
  async send(params: SendEmailParams): Promise<SendEmailResponse> {
    if (!params.from) {
      throw new Error("SendCore: The 'from' field is required to send an email.");
    }
    if (!params.to) {
      throw new Error("SendCore: The 'to' field is required to send an email.");
    }

    // Normalize string → array for the backend
    const payload = {
      ...params,
      to: Array.isArray(params.to) ? params.to : [params.to],
      cc: params.cc
        ? Array.isArray(params.cc)
          ? params.cc
          : [params.cc]
        : undefined,
      bcc: params.bcc
        ? Array.isArray(params.bcc)
          ? params.bcc
          : [params.bcc]
        : undefined,
      replyTo: params.replyTo
        ? Array.isArray(params.replyTo)
          ? params.replyTo
          : [params.replyTo]
        : undefined,
    };

    return this.client._request<SendEmailResponse>('POST', '/emails/send', payload);
  }

  /**
   * Send an email using a pre-built template.
   *
   * @example
   * ```ts
   * await sendcore.emails.sendTemplate({
   *   from: 'hello@yourdomain.com',
   *   to: 'user@example.com',
   *   templateId: 'welcome-email',
   *   templateData: { name: 'John', plan: 'Pro' },
   * });
   * ```
   */
  async sendTemplate(
    params: Omit<SendEmailParams, 'html' | 'text'> & {
      templateId: string;
      templateData?: Record<string, any>;
    }
  ): Promise<SendEmailResponse> {
    return this.send(params);
  }
}

// ─── Resource: Contacts ───────────────────────

class ContactsResource {
  constructor(private readonly client: SendCore) { }

  /**
   * Subscribe a contact (add to your audience).
   *
   * @example
   * ```ts
   * await sendcore.contacts.subscribe({
   *   email: 'user@example.com',
   *   firstName: 'John',
   *   listId: 'lst_abc123',
   * });
   * ```
   */
  async subscribe(params: SubscribeParams) {
    if (!params.email) {
      throw new Error("SendCore: The 'email' field is required.");
    }
    return this.client._request('POST', '/organizations/audience/subscribe', params);
  }

  /**
   * Unsubscribe a contact from your audience.
   *
   * @example
   * ```ts
   * await sendcore.contacts.unsubscribe({ email: 'user@example.com' });
   * ```
   */
  async unsubscribe(params: UnsubscribeParams) {
    if (!params.email) {
      throw new Error("SendCore: The 'email' field is required.");
    }
    return this.client._request('POST', '/organizations/audience/unsubscribe', params);
  }
}
