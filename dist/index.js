"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  EmailBuilder: () => EmailBuilder,
  SendCore: () => SendCore,
  SendCoreError: () => SendCoreError,
  isSendCoreError: () => isSendCoreError
});
module.exports = __toCommonJS(index_exports);

// src/errors.ts
var HINTS = {
  400: "Check your request payload for missing or invalid fields.",
  401: "Your API key is invalid or missing. Get one at https://usesendcore.com/dashboard/api-keys",
  403: "You don't have permission for this action. Check your plan limits or team role.",
  404: "The requested resource was not found. Verify the ID or endpoint path.",
  413: "Payload too large. Reduce attachment sizes or email content.",
  429: "Rate limit exceeded. Slow down \u2014 you'll be retried automatically.",
  500: "Server error. If this persists, check https://status.usesendcore.com",
  502: "Temporary gateway error. Automatic retry has been attempted.",
  503: "Service temporarily unavailable. Automatic retry has been attempted."
};
function describe(detail) {
  const hint = HINTS[detail.statusCode];
  const parts = [detail.message];
  if (hint) parts.push(`
  \u{1F4A1} ${hint}`);
  if (detail.error) parts.push(`
  \u{1F50D} Server detail: ${detail.error}`);
  return parts.join("");
}
var SendCoreError = class _SendCoreError extends Error {
  statusCode;
  detail;
  constructor(statusCode, detail) {
    super(describe(detail));
    this.name = "SendCoreError";
    this.statusCode = statusCode;
    this.detail = detail;
    Object.setPrototypeOf(this, _SendCoreError.prototype);
  }
  get isRateLimited() {
    return this.statusCode === 429;
  }
  get isUnauthorized() {
    return this.statusCode === 401;
  }
  get isServerError() {
    return this.statusCode >= 500;
  }
};
function isSendCoreError(err) {
  return err instanceof SendCoreError;
}

// src/client.ts
var DEFAULT_BASE_URL = "https://api.usesendcore.com";
var DEFAULT_TIMEOUT = 3e4;
var DEFAULT_RETRIES = 2;
var RETRYABLE_STATUS_CODES = /* @__PURE__ */ new Set([408, 429, 500, 502, 503, 504]);
var SDK_VERSION = "1.1.0";
var SendCore = class {
  apiKey;
  baseUrl;
  timeout;
  retries;
  emails;
  contacts;
  domains;
  verify;
  analytics;
  webhooks;
  workflows;
  constructor(apiKeyOrConfig) {
    const config = typeof apiKeyOrConfig === "string" ? { apiKey: apiKeyOrConfig } : apiKeyOrConfig;
    if (!config.apiKey) {
      throw new Error(
        "SendCore: An API key is required. Get one at https://usesendcore.com/dashboard/api-keys"
      );
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
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
  async _request(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "x-api-key": this.apiKey,
      "Content-Type": "application/json",
      "User-Agent": `sendcore-node/${SDK_VERSION}`
    };
    const fetchOptions = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
      ...body ? { body: JSON.stringify(body) } : {}
    };
    let lastError = null;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        const responseBody = await response.json().catch(() => ({}));
        if (response.ok) {
          return responseBody;
        }
        if (!RETRYABLE_STATUS_CODES.has(response.status)) {
          throw new SendCoreError(response.status, {
            statusCode: response.status,
            message: responseBody.message || response.statusText,
            error: responseBody.error,
            ...responseBody
          });
        }
        lastError = new SendCoreError(response.status, {
          statusCode: response.status,
          message: responseBody.message || response.statusText,
          error: responseBody.error,
          ...responseBody
        });
      } catch (err) {
        if (err instanceof SendCoreError) throw err;
        lastError = err;
      }
      if (attempt < this.retries) {
        const delay = Math.min(1e3 * 2 ** attempt, 1e4);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastError ?? new Error("SendCore: Request failed after all retries");
  }
};
var EmailsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  async send(params) {
    if (!params.from) throw new Error("SendCore: 'from' is required");
    if (!params.to) throw new Error("SendCore: 'to' is required");
    const payload = {
      ...params,
      to: Array.isArray(params.to) ? params.to : [params.to],
      cc: params.cc ? Array.isArray(params.cc) ? params.cc : [params.cc] : void 0,
      bcc: params.bcc ? Array.isArray(params.bcc) ? params.bcc : [params.bcc] : void 0,
      replyTo: params.replyTo ? Array.isArray(params.replyTo) ? params.replyTo : [params.replyTo] : void 0
    };
    return this.client._request("POST", "/emails/send", payload);
  }
  async sendTemplate(params) {
    if (!params.templateId) throw new Error("SendCore: 'templateId' is required for sendTemplate");
    return this.send(params);
  }
  compose() {
    return new EmailBuilder(this);
  }
};
var ContactsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  async subscribe(params) {
    if (!params.email) throw new Error("SendCore: 'email' is required");
    return this.client._request("POST", "/organizations/audience/subscribe", params);
  }
  async unsubscribe(params) {
    if (!params.email) throw new Error("SendCore: 'email' is required");
    return this.client._request("POST", "/organizations/audience/unsubscribe", params);
  }
};
var EmailBuilder = class {
  constructor(resource) {
    this.resource = resource;
  }
  resource;
  params = {};
  from(from) {
    this.params.from = from;
    return this;
  }
  to(to) {
    this.params.to = to;
    return this;
  }
  subject(subject) {
    this.params.subject = subject;
    return this;
  }
  html(html) {
    this.params.html = html;
    return this;
  }
  text(text) {
    this.params.text = text;
    return this;
  }
  cc(cc) {
    this.params.cc = cc;
    return this;
  }
  bcc(bcc) {
    this.params.bcc = bcc;
    return this;
  }
  replyTo(replyTo) {
    this.params.replyTo = replyTo;
    return this;
  }
  attach(filename, content, contentType) {
    if (!this.params.attachments) this.params.attachments = [];
    this.params.attachments.push({ filename, content, contentType });
    return this;
  }
  tag(key, value) {
    if (!this.params.tags) this.params.tags = {};
    this.params.tags[key] = value;
    return this;
  }
  async send() {
    return this.resource.send(this.params);
  }
};
var DomainsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  async list() {
    return this.client._request("GET", "/domains");
  }
  async add(params) {
    return this.client._request("POST", "/domains", params);
  }
  async remove(id) {
    await this.client._request("DELETE", `/domains/${id}`);
  }
  async verify(id) {
    return this.client._request("POST", `/domains/${id}/verify`);
  }
  async getDnsRecords(id) {
    return this.client._request("GET", `/domains/${id}/dns`);
  }
  async getHealth(id) {
    return this.client._request("GET", `/domains/${id}/health`);
  }
};
var EmailVerificationResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  async email(params) {
    return this.client._request("POST", "/email-verification/verify", params);
  }
  async batch(params) {
    return this.client._request("POST", "/email-verification/batch-verify", params);
  }
};
var AnalyticsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  async get(params) {
    const query = params?.days ? `?days=${params.days}` : "";
    return this.client._request("GET", `/emails/analytics${query}`);
  }
  async stats() {
    return this.client._request("GET", "/emails/stats");
  }
};
var WebhooksResource = class {
  verifySignature(payload, signature, secret) {
    const crypto = require("crypto");
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
  verify(payload, signature, secret) {
    return this.verifySignature(JSON.stringify(payload), signature, secret);
  }
};
var WorkflowsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
  async list() {
    return this.client._request("GET", "/organizations/workflows");
  }
  async get(id) {
    return this.client._request("GET", `/organizations/workflows/${id}`);
  }
  async create(params) {
    return this.client._request("POST", "/organizations/workflows", params);
  }
  async update(id, params) {
    return this.client._request("PUT", `/organizations/workflows/${id}`, params);
  }
  async delete(id) {
    await this.client._request("DELETE", `/organizations/workflows/${id}`);
  }
  async activate(id) {
    return this.client._request("POST", `/organizations/workflows/${id}/activate`);
  }
  async pause(id) {
    return this.client._request("POST", `/organizations/workflows/${id}/pause`);
  }
  async addStep(workflowId, params) {
    return this.client._request("POST", `/organizations/workflows/${workflowId}/steps`, params);
  }
  async updateStep(stepId, params) {
    return this.client._request("PUT", `/organizations/workflows/steps/${stepId}`, params);
  }
  async deleteStep(stepId) {
    await this.client._request("DELETE", `/organizations/workflows/steps/${stepId}`);
  }
  async getExecutions(workflowId) {
    return this.client._request("GET", `/organizations/workflows/${workflowId}/executions`);
  }
  async getExecution(executionId) {
    return this.client._request("GET", `/organizations/workflows/executions/${executionId}`);
  }
  async test(workflowId, contactId) {
    return this.client._request("POST", `/organizations/workflows/${workflowId}/test`, { contactId });
  }
  async aiGenerate(prompt) {
    return this.client._request("POST", "/organizations/workflows/ai/generate", { prompt });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmailBuilder,
  SendCore,
  SendCoreError,
  isSendCoreError
});
