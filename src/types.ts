// ─────────────────────────────────────────────
// SendCore Node.js SDK — Type Definitions
// ─────────────────────────────────────────────

/** Configuration for the SendCore client */
export interface SendCoreConfig {
  /** Your API key from the SendCore dashboard */
  apiKey: string;
  /** Base URL of the SendCore API (default: https://api.sendcore.elasto.ng) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of automatic retries on 5xx errors (default: 2) */
  retries?: number;
}

// ─── Email Types ────────────────────────────

export interface EmailAttachment {
  /** Filename of the attachment */
  filename: string;
  /** Base64-encoded content of the file */
  content: string;
  /** MIME content type (e.g. 'application/pdf') */
  contentType?: string;
}

export interface SendEmailParams {
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

export interface SendEmailResponse {
  id: string;
  message: string;
  [key: string]: any;
}

// ─── Audience / Contact Types ───────────────

export interface SubscribeParams {
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

export interface UnsubscribeParams {
  /** Email address to unsubscribe */
  email: string;
}

// ─── Error Types ────────────────────────────

export interface SendCoreErrorDetail {
  statusCode: number;
  message: string;
  error?: string;
  [key: string]: any;
}
