export interface SendCoreConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType?: string;
}

export interface SendEmailParams {
  from: string;
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachment[];
  tags?: Record<string, string>;
}

export interface SendEmailResponse {
  id: string;
  status: string;
}

export interface SubscribeParams {
  email: string;
  firstName?: string;
  lastName?: string;
  listId?: string;
  customData?: Record<string, any>;
}

export interface UnsubscribeParams {
  email: string;
}

export interface SendCoreErrorDetail {
  statusCode: number;
  message: string;
  error?: string;
}

export interface AddDomainParams {
  name: string;
}

export interface Domain {
  id: string;
  name: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  spfStatus: boolean;
  dkimStatus: boolean;
  dmarcStatus: boolean;
  verificationToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
}

export interface VerifyEmailParams {
  email: string;
}

export interface VerificationResult {
  email: string;
  isValid: boolean;
  score: number;
  reason: string;
}

export interface BatchVerifyParams {
  emails: string[];
}

export interface AnalyticsParams {
  days?: number;
}

export interface AnalyticsData {
  data: any[];
}

export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface EmailBuilderParams {
  from?: string;
  to?: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  attachments?: EmailAttachment[];
  tags?: Record<string, string>;
}

// ─── Workflow Types ──────────────────────────

export interface WorkflowStepConfig {
  to?: string;
  from?: string;
  subject?: string;
  html?: string;
  templateSlug?: string;
  templateData?: Record<string, any>;
  duration?: number;
  unit?: string;
  field?: string;
  operator?: string;
  value?: string;
  prompt?: string;
  listId?: string;
  fields?: Record<string, any>;
  url?: string;
  body?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  order: number;
  type: string;
  config: WorkflowStepConfig;
  label?: string;
  parentStepId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: Record<string, any>;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  aiGenerated: boolean;
  executionCount: number;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionLog {
  id: string;
  stepId: string;
  stepType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  input?: any;
  output?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  contactId?: string;
  triggerEntityType?: string;
  triggerEntityId?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  currentStep: number;
  context: Record<string, any>;
  logs: WorkflowExecutionLog[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowParams {
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig?: Record<string, any>;
  steps?: Omit<WorkflowStep, 'id' | 'createdAt' | 'updatedAt'>[];
  aiGenerated?: boolean;
}

// ─── Broadcast / Campaign Types ──────────────

export interface Broadcast {
  id: string;
  name: string;
  subject?: string;
  content?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
  listIds?: string[];
  scheduledAt?: string;
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBroadcastParams {
  name: string;
  subject?: string;
  content?: string;
  listIds?: string[];
}

export interface ScheduleBroadcastParams {
  scheduledAt: string;
}

// ─── Audience List Types ──────────────────────

export interface AudienceList {
  id: string;
  name: string;
  description?: string;
  contactCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAudienceListParams {
  name: string;
  description?: string;
}

export interface AddContactParams {
  email: string;
  firstName?: string;
  lastName?: string;
  listIds?: string[];
  customData?: Record<string, any>;
}

// ─── Template Types ───────────────────────────

export interface EmailTemplate {
  id: string;
  name: string;
  subject?: string;
  html?: string;
  text?: string;
  design?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateParams {
  name: string;
  subject?: string;
  html?: string;
  text?: string;
  design?: Record<string, any>;
}

// ─── Suppression Types ────────────────────────

export interface Suppression {
  id: string;
  email: string;
  reason?: string;
  createdAt: string;
}

export interface AddSuppressionParams {
  email: string;
  reason?: string;
}

export interface SuppressionListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ─── API Key Types ────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface CreateApiKeyParams {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  createdAt: string;
}
