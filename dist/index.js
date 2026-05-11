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
  SendCore: () => SendCore,
  SendCoreError: () => SendCoreError
});
module.exports = __toCommonJS(index_exports);

// src/errors.ts
var SendCoreError = class _SendCoreError extends Error {
  statusCode;
  detail;
  constructor(statusCode, detail) {
    const msg = detail.message || `SendCore API error (${statusCode})`;
    super(msg);
    this.name = "SendCoreError";
    this.statusCode = statusCode;
    this.detail = detail;
    Object.setPrototypeOf(this, _SendCoreError.prototype);
  }
};

// src/client.ts
var DEFAULT_BASE_URL = "https://api.usesendcore.com";
var DEFAULT_TIMEOUT = 3e4;
var DEFAULT_RETRIES = 2;
var RETRYABLE_STATUS_CODES = /* @__PURE__ */ new Set([408, 429, 500, 502, 503, 504]);
var SDK_VERSION = "1.0.0";
var SendCore = class {
  apiKey;
  baseUrl;
  timeout;
  retries;
  /** Email operations */
  emails;
  /** Audience / contact operations */
  contacts;
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
  }
  // ─── Internal HTTP layer ────────────────────
  /** @internal */
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
    throw lastError ?? new Error("SendCore: Request failed after retries");
  }
};
var EmailsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
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
  async send(params) {
    if (!params.from) {
      throw new Error("SendCore: The 'from' field is required to send an email.");
    }
    if (!params.to) {
      throw new Error("SendCore: The 'to' field is required to send an email.");
    }
    const payload = {
      ...params,
      to: Array.isArray(params.to) ? params.to : [params.to],
      cc: params.cc ? Array.isArray(params.cc) ? params.cc : [params.cc] : void 0,
      bcc: params.bcc ? Array.isArray(params.bcc) ? params.bcc : [params.bcc] : void 0,
      replyTo: params.replyTo ? Array.isArray(params.replyTo) ? params.replyTo : [params.replyTo] : void 0
    };
    return this.client._request("POST", "/emails/send", payload);
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
  async sendTemplate(params) {
    return this.send(params);
  }
};
var ContactsResource = class {
  constructor(client) {
    this.client = client;
  }
  client;
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
  async subscribe(params) {
    if (!params.email) {
      throw new Error("SendCore: The 'email' field is required.");
    }
    return this.client._request("POST", "/organizations/audience/subscribe", params);
  }
  /**
   * Unsubscribe a contact from your audience.
   *
   * @example
   * ```ts
   * await sendcore.contacts.unsubscribe({ email: 'user@example.com' });
   * ```
   */
  async unsubscribe(params) {
    if (!params.email) {
      throw new Error("SendCore: The 'email' field is required.");
    }
    return this.client._request("POST", "/organizations/audience/unsubscribe", params);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SendCore,
  SendCoreError
});
