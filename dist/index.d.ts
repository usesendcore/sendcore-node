/** Configuration for the SendCore client */
interface SendCoreConfig {
    /** Your API key from the SendCore dashboard */
    apiKey: string;
    /** Base URL of the SendCore API (default: https://api.sendcore.elasto.ng) */
    baseUrl?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Number of automatic retries on 5xx errors (default: 2) */
    retries?: number;
}
interface EmailAttachment {
    /** Filename of the attachment */
    filename: string;
    /** Base64-encoded content of the file */
    content: string;
    /** MIME content type (e.g. 'application/pdf') */
    contentType?: string;
}
interface SendEmailParams {
    /** Sender address (e.g. 'John <john@example.com>') */
    from: string;
    /** One or more recipient email addresses */
    to: string | string[];
    /** Email subject line */
    subject?: string;
    /** HTML body of the email */
    html?: string;
    /** Plain text body of the email */
    text?: string;
    /** CC recipients */
    cc?: string | string[];
    /** BCC recipients */
    bcc?: string | string[];
    /** Reply-to addresses */
    replyTo?: string | string[];
    /** Use a pre-built template by its ID */
    templateId?: string;
    /** Variables to inject into the template */
    templateData?: Record<string, any>;
    /** File attachments */
    attachments?: EmailAttachment[];
    /** Custom tags for tracking and analytics */
    tags?: Record<string, string>;
}
interface SendEmailResponse {
    id: string;
    message: string;
    [key: string]: any;
}
interface SubscribeParams {
    /** Email address of the contact */
    email: string;
    /** First name */
    firstName?: string;
    /** Last name */
    lastName?: string;
    /** ID of the audience list to add the contact to */
    listId?: string;
    /** Any additional custom data */
    customData?: Record<string, any>;
}
interface UnsubscribeParams {
    /** Email address to unsubscribe */
    email: string;
}
interface SendCoreErrorDetail {
    statusCode: number;
    message: string;
    error?: string;
    [key: string]: any;
}

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
declare class SendCore {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    private readonly retries;
    /** Email operations */
    readonly emails: EmailsResource;
    /** Audience / contact operations */
    readonly contacts: ContactsResource;
    constructor(apiKeyOrConfig: string | SendCoreConfig);
    /** @internal */
    _request<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: Record<string, any>): Promise<T>;
}
declare class EmailsResource {
    private readonly client;
    constructor(client: SendCore);
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
    send(params: SendEmailParams): Promise<SendEmailResponse>;
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
    sendTemplate(params: Omit<SendEmailParams, 'html' | 'text'> & {
        templateId: string;
        templateData?: Record<string, any>;
    }): Promise<SendEmailResponse>;
}
declare class ContactsResource {
    private readonly client;
    constructor(client: SendCore);
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
    subscribe(params: SubscribeParams): Promise<any>;
    /**
     * Unsubscribe a contact from your audience.
     *
     * @example
     * ```ts
     * await sendcore.contacts.unsubscribe({ email: 'user@example.com' });
     * ```
     */
    unsubscribe(params: UnsubscribeParams): Promise<any>;
}

/**
 * Custom error class for SendCore API errors.
 * Contains the HTTP status code and structured error detail from the server.
 */
declare class SendCoreError extends Error {
    readonly statusCode: number;
    readonly detail: SendCoreErrorDetail;
    constructor(statusCode: number, detail: SendCoreErrorDetail);
}

export { type EmailAttachment, SendCore, type SendCoreConfig, SendCoreError, type SendCoreErrorDetail, type SendEmailParams, type SendEmailResponse, type SubscribeParams, type UnsubscribeParams };
