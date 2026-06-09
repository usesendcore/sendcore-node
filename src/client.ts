import type {
  SendCoreConfig, SendEmailParams, SendEmailResponse,
  SubscribeParams, UnsubscribeParams,
  AddDomainParams, Domain, DnsRecord,
  VerifyEmailParams, BatchVerifyParams, VerificationResult,
  AnalyticsParams, AnalyticsData,
  WebhookPayload,
  EmailBuilderParams,
} from './types';
import { SendCoreError } from './errors';

const DEFAULT_BASE_URL = 'https://api.usesendcore.com';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 2;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const SDK_VERSION = '1.1.0';

export class SendCore {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;

  readonly emails: EmailsResource;
  readonly contacts: ContactsResource;
  readonly domains: DomainsResource;
  readonly verify: EmailVerificationResource;
  readonly analytics: AnalyticsResource;
  readonly webhooks: WebhooksResource;
  readonly workflows: WorkflowsResource;

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

    this.emails = new EmailsResource(this);
    this.contacts = new ContactsResource(this);
    this.domains = new DomainsResource(this);
    this.verify = new EmailVerificationResource(this);
    this.analytics = new AnalyticsResource(this);
    this.webhooks = new WebhooksResource();
    this.workflows = new WorkflowsResource(this);
  }

  async _request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
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
        const responseBody = await response.json().catch(() => ({}));

        if (response.ok) {
          return responseBody as T;
        }

        if (!RETRYABLE_STATUS_CODES.has(response.status)) {
          throw new SendCoreError(response.status, {
            statusCode: response.status,
            message: responseBody.message || response.statusText,
            error: responseBody.error,
            ...responseBody,
          });
        }

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

      if (attempt < this.retries) {
        const delay = Math.min(1000 * 2 ** attempt, 10_000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError ?? new Error('SendCore: Request failed after all retries');
  }
}

// ─── Email Resource ───────────────────────────

class EmailsResource {
  constructor(private readonly client: SendCore) {}

  async send(params: SendEmailParams): Promise<SendEmailResponse> {
    if (!params.from) throw new Error("SendCore: 'from' is required");
    if (!params.to) throw new Error("SendCore: 'to' is required");

    const payload = {
      ...params,
      to: Array.isArray(params.to) ? params.to : [params.to],
      cc: params.cc ? (Array.isArray(params.cc) ? params.cc : [params.cc]) : undefined,
      bcc: params.bcc ? (Array.isArray(params.bcc) ? params.bcc : [params.bcc]) : undefined,
      replyTo: params.replyTo ? (Array.isArray(params.replyTo) ? params.replyTo : [params.replyTo]) : undefined,
    };

    return this.client._request<SendEmailResponse>('POST', '/emails/send', payload);
  }

  async sendTemplate(
    params: Omit<SendEmailParams, 'html' | 'text'> & {
      templateId: string;
      templateData?: Record<string, any>;
    }
  ): Promise<SendEmailResponse> {
    if (!params.templateId) throw new Error("SendCore: 'templateId' is required for sendTemplate");
    return this.send(params as SendEmailParams);
  }

  compose(): EmailBuilder {
    return new EmailBuilder(this);
  }
}

class ContactsResource {
  constructor(private readonly client: SendCore) {}

  async subscribe(params: SubscribeParams) {
    if (!params.email) throw new Error("SendCore: 'email' is required");
    return this.client._request('POST', '/organizations/audience/subscribe', params);
  }

  async unsubscribe(params: UnsubscribeParams) {
    if (!params.email) throw new Error("SendCore: 'email' is required");
    return this.client._request('POST', '/organizations/audience/unsubscribe', params);
  }
}

// ─── Email Builder (Fluent API) ───────────────

class EmailBuilder {
  private params: EmailBuilderParams = {};
  constructor(private readonly resource: EmailsResource) {}

  from(from: string): this { this.params.from = from; return this; }
  to(to: string | string[]): this { this.params.to = to; return this; }
  subject(subject: string): this { this.params.subject = subject; return this; }
  html(html: string): this { this.params.html = html; return this; }
  text(text: string): this { this.params.text = text; return this; }
  cc(cc: string | string[]): this { this.params.cc = cc; return this; }
  bcc(bcc: string | string[]): this { this.params.bcc = bcc; return this; }
  replyTo(replyTo: string | string[]): this { this.params.replyTo = replyTo; return this; }
  attach(filename: string, content: string, contentType?: string): this {
    if (!this.params.attachments) this.params.attachments = [];
    this.params.attachments.push({ filename, content, contentType });
    return this;
  }
  tag(key: string, value: string): this {
    if (!this.params.tags) this.params.tags = {};
    this.params.tags[key] = value;
    return this;
  }

  async send(): Promise<SendEmailResponse> {
    return this.resource.send(this.params as SendEmailParams);
  }
}

// ─── Domains Resource ─────────────────────────

class DomainsResource {
  constructor(private readonly client: SendCore) {}

  async list(): Promise<Domain[]> {
    return this.client._request<Domain[]>('GET', '/domains');
  }

  async add(params: AddDomainParams): Promise<Domain> {
    return this.client._request<Domain>('POST', '/domains', params);
  }

  async remove(id: string): Promise<void> {
    await this.client._request('DELETE', `/domains/${id}`);
  }

  async verify(id: string): Promise<Domain> {
    return this.client._request<Domain>('POST', `/domains/${id}/verify`);
  }

  async getDnsRecords(id: string): Promise<DnsRecord[]> {
    return this.client._request<DnsRecord[]>('GET', `/domains/${id}/dns`);
  }

  async getHealth(id: string): Promise<{
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
    score: number;
  }> {
    return this.client._request('GET', `/domains/${id}/health`);
  }
}

// ─── Email Verification Resource ──────────────

class EmailVerificationResource {
  constructor(private readonly client: SendCore) {}

  async email(params: VerifyEmailParams): Promise<VerificationResult> {
    return this.client._request<VerificationResult>('POST', '/email-verification/verify', params);
  }

  async batch(params: BatchVerifyParams): Promise<VerificationResult[]> {
    return this.client._request<VerificationResult[]>('POST', '/email-verification/batch-verify', params);
  }
}

// ─── Analytics Resource ───────────────────────

class AnalyticsResource {
  constructor(private readonly client: SendCore) {}

  async get(params?: AnalyticsParams): Promise<AnalyticsData> {
    const query = params?.days ? `?days=${params.days}` : '';
    return this.client._request<AnalyticsData>('GET', `/emails/analytics${query}`);
  }

  async stats(): Promise<any> {
    return this.client._request('GET', '/emails/stats');
  }
}

// ─── Webhooks Resource ────────────────────────

class WebhooksResource {
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  verify(payload: WebhookPayload, signature: string, secret: string): boolean {
    return this.verifySignature(JSON.stringify(payload), signature, secret);
  }
}

// ─── Workflows Resource ──────────────────────

class WorkflowsResource {
  constructor(private readonly client: SendCore) {}

  async list(): Promise<any[]> {
    return this.client._request<any[]>('GET', '/organizations/workflows');
  }

  async get(id: string): Promise<any> {
    return this.client._request<any>('GET', `/organizations/workflows/${id}`);
  }

  async create(params: {
    name: string;
    description?: string;
    triggerType: string;
    triggerConfig?: any;
    steps?: any[];
  }): Promise<any> {
    return this.client._request<any>('POST', '/organizations/workflows', params);
  }

  async update(id: string, params: {
    name?: string;
    description?: string;
    triggerType?: string;
    triggerConfig?: any;
  }): Promise<any> {
    return this.client._request<any>('PUT', `/organizations/workflows/${id}`, params);
  }

  async delete(id: string): Promise<void> {
    await this.client._request('DELETE', `/organizations/workflows/${id}`);
  }

  async activate(id: string): Promise<any> {
    return this.client._request<any>('POST', `/organizations/workflows/${id}/activate`);
  }

  async pause(id: string): Promise<any> {
    return this.client._request<any>('POST', `/organizations/workflows/${id}/pause`);
  }

  async addStep(workflowId: string, params: {
    type: string;
    config: any;
    label?: string;
    order?: number;
  }): Promise<any> {
    return this.client._request<any>('POST', `/organizations/workflows/${workflowId}/steps`, params);
  }

  async updateStep(stepId: string, params: {
    type?: string;
    config?: any;
    label?: string;
  }): Promise<any> {
    return this.client._request<any>('PUT', `/organizations/workflows/steps/${stepId}`, params);
  }

  async deleteStep(stepId: string): Promise<void> {
    await this.client._request('DELETE', `/organizations/workflows/steps/${stepId}`);
  }

  async getExecutions(workflowId: string): Promise<any[]> {
    return this.client._request<any[]>('GET', `/organizations/workflows/${workflowId}/executions`);
  }

  async getExecution(executionId: string): Promise<any> {
    return this.client._request<any>('GET', `/organizations/workflows/executions/${executionId}`);
  }

  async test(workflowId: string, contactId?: string): Promise<any> {
    return this.client._request<any>('POST', `/organizations/workflows/${workflowId}/test`, { contactId });
  }

  async aiGenerate(prompt: string): Promise<any> {
    return this.client._request<any>('POST', '/organizations/workflows/ai/generate', { prompt });
  }
}

export { EmailBuilder };
