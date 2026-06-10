interface SendCoreConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    retries?: number;
}
interface EmailAttachment {
    filename: string;
    content: string;
    contentType?: string;
}
interface SendEmailParams {
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
interface SendEmailResponse {
    id: string;
    status: string;
}
interface SubscribeParams {
    email: string;
    firstName?: string;
    lastName?: string;
    listId?: string;
    customData?: Record<string, any>;
}
interface UnsubscribeParams {
    email: string;
}
interface SendCoreErrorDetail {
    statusCode: number;
    message: string;
    error?: string;
}
interface AddDomainParams {
    name: string;
}
interface Domain {
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
interface DnsRecord {
    type: string;
    name: string;
    value: string;
    priority?: number;
}
interface VerifyEmailParams {
    email: string;
}
interface VerificationResult {
    email: string;
    isValid: boolean;
    score: number;
    reason: string;
}
interface BatchVerifyParams {
    emails: string[];
}
interface AnalyticsParams {
    days?: number;
}
interface AnalyticsData {
    data: any[];
}
interface WebhookPayload {
    event: string;
    data: Record<string, any>;
    timestamp: number;
}
interface EmailBuilderParams {
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
interface WorkflowStepConfig {
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
interface WorkflowStep {
    id: string;
    order: number;
    type: string;
    config: WorkflowStepConfig;
    label?: string;
    parentStepId?: string;
    createdAt: string;
    updatedAt: string;
}
interface Workflow {
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
interface WorkflowExecutionLog {
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
interface WorkflowExecution {
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
interface CreateWorkflowParams {
    name: string;
    description?: string;
    triggerType: string;
    triggerConfig?: Record<string, any>;
    steps?: Omit<WorkflowStep, 'id' | 'createdAt' | 'updatedAt'>[];
    aiGenerated?: boolean;
}
interface Broadcast {
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
interface CreateBroadcastParams {
    name: string;
    subject?: string;
    content?: string;
    listIds?: string[];
}
interface ScheduleBroadcastParams {
    scheduledAt: string;
}
interface AudienceList {
    id: string;
    name: string;
    description?: string;
    contactCount?: number;
    createdAt: string;
    updatedAt: string;
}
interface CreateAudienceListParams {
    name: string;
    description?: string;
}
interface AddContactParams {
    email: string;
    firstName?: string;
    lastName?: string;
    listIds?: string[];
    customData?: Record<string, any>;
}
interface EmailTemplate {
    id: string;
    name: string;
    subject?: string;
    html?: string;
    text?: string;
    design?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
interface CreateTemplateParams {
    name: string;
    subject?: string;
    html?: string;
    text?: string;
    design?: Record<string, any>;
}
interface Suppression {
    id: string;
    email: string;
    reason?: string;
    createdAt: string;
}
interface AddSuppressionParams {
    email: string;
    reason?: string;
}
interface SuppressionListParams {
    page?: number;
    limit?: number;
    search?: string;
}
interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    scopes: string[];
    createdAt: string;
    expiresAt?: string;
}
interface CreateApiKeyParams {
    name: string;
    scopes?: string[];
    expiresInDays?: number;
}
interface CreateApiKeyResponse {
    id: string;
    name: string;
    key: string;
    scopes: string[];
    createdAt: string;
}

declare class SendCore {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    private readonly retries;
    readonly emails: EmailsResource;
    readonly contacts: ContactsResource;
    readonly domains: DomainsResource;
    readonly verify: EmailVerificationResource;
    readonly analytics: AnalyticsResource;
    readonly webhooks: WebhooksResource;
    readonly workflows: WorkflowsResource;
    readonly broadcasts: BroadcastsResource;
    readonly audienceLists: AudienceListsResource;
    readonly templates: TemplatesResource;
    readonly suppressions: SuppressionsResource;
    readonly apiKeys: ApiKeysResource;
    constructor(apiKeyOrConfig: string | SendCoreConfig);
    _request<T = any>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: Record<string, any>): Promise<T>;
}
declare class EmailsResource {
    private readonly client;
    constructor(client: SendCore);
    send(params: SendEmailParams): Promise<SendEmailResponse>;
    sendTemplate(params: Omit<SendEmailParams, 'html' | 'text'> & {
        templateId: string;
        templateData?: Record<string, any>;
    }): Promise<SendEmailResponse>;
    compose(): EmailBuilder;
}
declare class ContactsResource {
    private readonly client;
    constructor(client: SendCore);
    subscribe(params: SubscribeParams): Promise<any>;
    unsubscribe(params: UnsubscribeParams): Promise<any>;
}
declare class EmailBuilder {
    private readonly resource;
    private params;
    constructor(resource: EmailsResource);
    from(from: string): this;
    to(to: string | string[]): this;
    subject(subject: string): this;
    html(html: string): this;
    text(text: string): this;
    cc(cc: string | string[]): this;
    bcc(bcc: string | string[]): this;
    replyTo(replyTo: string | string[]): this;
    attach(filename: string, content: string, contentType?: string): this;
    tag(key: string, value: string): this;
    send(): Promise<SendEmailResponse>;
}
declare class DomainsResource {
    private readonly client;
    constructor(client: SendCore);
    list(): Promise<Domain[]>;
    add(params: AddDomainParams): Promise<Domain>;
    remove(id: string): Promise<void>;
    verify(id: string): Promise<Domain>;
    getDnsRecords(id: string): Promise<DnsRecord[]>;
    getHealth(id: string): Promise<{
        spf: boolean;
        dkim: boolean;
        dmarc: boolean;
        score: number;
    }>;
}
declare class EmailVerificationResource {
    private readonly client;
    constructor(client: SendCore);
    email(params: VerifyEmailParams): Promise<VerificationResult>;
    batch(params: BatchVerifyParams): Promise<VerificationResult[]>;
}
declare class AnalyticsResource {
    private readonly client;
    constructor(client: SendCore);
    get(params?: AnalyticsParams): Promise<AnalyticsData>;
    stats(): Promise<any>;
}
declare class WebhooksResource {
    verifySignature(payload: string, signature: string, secret: string): boolean;
    verify(payload: WebhookPayload, signature: string, secret: string): boolean;
}
declare class WorkflowsResource {
    private readonly client;
    constructor(client: SendCore);
    list(): Promise<any[]>;
    get(id: string): Promise<any>;
    create(params: {
        name: string;
        description?: string;
        triggerType: string;
        triggerConfig?: any;
        steps?: any[];
    }): Promise<any>;
    update(id: string, params: {
        name?: string;
        description?: string;
        triggerType?: string;
        triggerConfig?: any;
    }): Promise<any>;
    delete(id: string): Promise<void>;
    activate(id: string): Promise<any>;
    pause(id: string): Promise<any>;
    addStep(workflowId: string, params: {
        type: string;
        config: any;
        label?: string;
        order?: number;
    }): Promise<any>;
    updateStep(stepId: string, params: {
        type?: string;
        config?: any;
        label?: string;
    }): Promise<any>;
    deleteStep(stepId: string): Promise<void>;
    getExecutions(workflowId: string): Promise<any[]>;
    getExecution(executionId: string): Promise<any>;
    test(workflowId: string, contactId?: string): Promise<any>;
    aiGenerate(prompt: string): Promise<any>;
}
declare class BroadcastsResource {
    private readonly client;
    constructor(client: SendCore);
    list(): Promise<Broadcast[]>;
    get(id: string): Promise<Broadcast>;
    create(params: CreateBroadcastParams): Promise<Broadcast>;
    update(id: string, params: Partial<CreateBroadcastParams>): Promise<Broadcast>;
    delete(id: string): Promise<void>;
    send(id: string): Promise<Broadcast>;
    schedule(id: string, params: ScheduleBroadcastParams): Promise<Broadcast>;
}
declare class AudienceListsResource {
    private readonly client;
    constructor(client: SendCore);
    list(): Promise<AudienceList[]>;
    create(params: CreateAudienceListParams): Promise<AudienceList>;
    update(id: string, params: Partial<CreateAudienceListParams>): Promise<AudienceList>;
    delete(id: string): Promise<void>;
    addContact(params: AddContactParams): Promise<any>;
    listContacts(listId?: string): Promise<any[]>;
}
declare class TemplatesResource {
    private readonly client;
    constructor(client: SendCore);
    list(): Promise<EmailTemplate[]>;
    get(id: string): Promise<EmailTemplate>;
    create(params: CreateTemplateParams): Promise<EmailTemplate>;
    update(id: string, params: Partial<CreateTemplateParams>): Promise<EmailTemplate>;
    delete(id: string): Promise<void>;
}
declare class SuppressionsResource {
    private readonly client;
    constructor(client: SendCore);
    list(params?: SuppressionListParams): Promise<Suppression[]>;
    add(params: AddSuppressionParams): Promise<Suppression>;
    remove(id: string): Promise<void>;
}
declare class ApiKeysResource {
    private readonly client;
    constructor(client: SendCore);
    list(): Promise<ApiKey[]>;
    create(params: CreateApiKeyParams): Promise<CreateApiKeyResponse>;
    createMcp(name: string): Promise<CreateApiKeyResponse>;
    revoke(id: string): Promise<void>;
}

declare class SendCoreError extends Error {
    readonly statusCode: number;
    readonly detail: SendCoreErrorDetail;
    constructor(statusCode: number, detail: SendCoreErrorDetail);
    get isRateLimited(): boolean;
    get isUnauthorized(): boolean;
    get isServerError(): boolean;
}
declare function isSendCoreError(err: unknown): err is SendCoreError;

export { type AddContactParams, type AddDomainParams, type AddSuppressionParams, type AnalyticsData, type AnalyticsParams, type ApiKey, type AudienceList, type BatchVerifyParams, type Broadcast, type CreateApiKeyParams, type CreateApiKeyResponse, type CreateAudienceListParams, type CreateBroadcastParams, type CreateTemplateParams, type CreateWorkflowParams, type DnsRecord, type Domain, type EmailAttachment, EmailBuilder, type EmailBuilderParams, type EmailTemplate, type ScheduleBroadcastParams, SendCore, type SendCoreConfig, SendCoreError, type SendCoreErrorDetail, type SendEmailParams, type SendEmailResponse, type SubscribeParams, type Suppression, type SuppressionListParams, type UnsubscribeParams, type VerificationResult, type VerifyEmailParams, type WebhookPayload, type Workflow, type WorkflowExecution, type WorkflowExecutionLog, type WorkflowStep, isSendCoreError };
