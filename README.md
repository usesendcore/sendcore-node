# SendCore Node.js SDK

The official Node.js SDK for [SendCore](https://usesendcore.com) — reliable email infrastructure for developers and businesses.

## Installation

```bash
npm install sendcore
```

## Quick Start

```ts
import { SendCore } from 'sendcore';

const sendcore = new SendCore('sc_live_xxxxxxxxxx');

// Send an email
await sendcore.emails.send({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello World</h1>',
});
```

## Features

- **Zero dependencies** — uses native `fetch` (Node 18+)
- **Full TypeScript support** — complete type definitions included
- **Automatic retries** — exponential backoff on 5xx errors
- **Configurable timeouts** — prevent hanging requests
- **Secure by default** — API key via `x-api-key` header

---

## Configuration

```ts
import { SendCore } from 'sendcore';

// Simple — just pass your API key
const sendcore = new SendCore('sc_live_xxxxxxxxxx');

// Advanced — full configuration
const sendcore = new SendCore({
  apiKey: 'sc_live_xxxxxxxxxx',
  baseUrl: 'https://api.usesendcore.com',  // optional
  timeout: 30000,                              // optional, ms
  retries: 2,                                  // optional
});
```

Get your API key from the [SendCore Dashboard](https://usesendcore.com/dashboard/api-keys).

---

## Sending Emails

### Basic Email

```ts
await sendcore.emails.send({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello!',
  html: '<h1>Welcome to our platform</h1>',
});
```

### With Multiple Recipients

```ts
await sendcore.emails.send({
  from: 'Team <team@yourdomain.com>',
  to: ['alice@example.com', 'bob@example.com'],
  cc: 'manager@example.com',
  bcc: ['audit@yourdomain.com'],
  subject: 'Team Update',
  html: '<p>Here is your weekly update.</p>',
  replyTo: 'support@yourdomain.com',
});
```

### Using a Template

```ts
await sendcore.emails.sendTemplate({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  templateId: 'welcome-email',
  templateData: {
    name: 'John',
    plan: 'Pro',
    loginUrl: 'https://app.example.com/login',
  },
});
```

### With Attachments

```ts
import { readFileSync } from 'fs';

await sendcore.emails.send({
  from: 'billing@yourdomain.com',
  to: 'user@example.com',
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: readFileSync('./invoice.pdf').toString('base64'),
      contentType: 'application/pdf',
    },
  ],
});
```

### With Tags

```ts
await sendcore.emails.send({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Order Confirmation',
  html: '<p>Your order is confirmed!</p>',
  tags: {
    category: 'transactional',
    orderId: 'ORD-12345',
  },
});
```

---

## Managing Contacts

### Subscribe a Contact

```ts
await sendcore.contacts.subscribe({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  listId: 'lst_abc123',          // optional
  customData: { plan: 'pro' },   // optional
});
```

### Unsubscribe a Contact

```ts
await sendcore.contacts.unsubscribe({
  email: 'user@example.com',
});
```

---

## Error Handling

```ts
import { SendCore, SendCoreError } from 'sendcore';

const sendcore = new SendCore('sc_live_xxxxxxxxxx');

try {
  await sendcore.emails.send({
    from: 'hello@yourdomain.com',
    to: 'user@example.com',
    subject: 'Test',
    html: '<p>Hello</p>',
  });
} catch (error) {
  if (error instanceof SendCoreError) {
    console.error('Status:', error.statusCode);  // e.g. 400, 401, 422
    console.error('Message:', error.message);
    console.error('Detail:', error.detail);
  } else {
    console.error('Network error:', error);
  }
}
```

---

## Requirements

- **Node.js 18+** (uses native `fetch`)
- A SendCore API key

## License

MIT
