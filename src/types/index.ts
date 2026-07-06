// Re-export types from services
export type { User } from '../services/authService';
export type { Chat, Message } from '../services/chatService';
export type { CustomTable, TableRecord } from '../services/customTableService';
export type { Inscription } from '../services/inscriptionService';

// Campaign types
export interface Recipient {
    _id?: string;
    email: string;
    name: string;
    status: 'pending' | 'sent' | 'failed';
    sentAt?: string;
    error?: string;
    // Tracking fields
    opened?: boolean;
    openedAt?: string;
    openCount?: number;
    clicked?: boolean;
    clickedAt?: string;
    clickCount?: number;
}

export interface Campaign {
    _id: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    trackOpens?: boolean;
    trackClicks?: boolean;
    callToActionUrl?: string;
    callToActionLabel?: string;
    recipients: Recipient[];
    status: 'draft' | 'sending' | 'sent' | 'failed' | 'partial';
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    createdBy: string;
    emailCredential: string | EmailCredential;
    // Statistics fields
    openCount?: number;
    clickCount?: number;
    uniqueOpens?: number;
    uniqueClicks?: number;
    openRate?: number;
    clickRate?: number;
    sentAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CampaignStats {
    totalCampaigns: number;
    totalSent: number;
    totalFailed: number;
    totalRecipients: number;
    totalOpens: number;
    totalClicks: number;
    averageOpenRate: number;
    averageClickRate: number;
}

export interface CreateCampaignData {
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    trackOpens?: boolean;
    trackClicks?: boolean;
    callToActionUrl?: string;
    callToActionLabel?: string;
    recipients?: Recipient[];
    emailCredentialId: string;
}

// Email Credential types
export interface EmailCredential {
    _id: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    fromName: string;
    fromEmail: string;
    sendingDomain?: SendingDomain | string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEmailCredentialData {
    name: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromEmail: string;
    sendingDomainId: string;
}

export interface DnsRecord {
    key: 'ownership' | 'spf' | 'dkim' | 'dmarc' | 'tracking' | 'bounce';
    label: string;
    type: 'TXT' | 'CNAME';
    host: string;
    value: string;
}

export interface DnsVerificationStatus {
    status: 'pending' | 'configured' | 'error';
    host?: string;
    expectedValue?: string;
    actualValue?: string;
    errorMessage?: string;
    checkedAt?: string;
}

export interface SendingDomain {
    _id: string;
    domain: string;
    verificationToken: string;
    verificationHost: string;
    dkimSelector: string;
    dkimPublicKey: string;
    trackingSubdomain: string;
    trackingTarget: string;
    bounceSubdomain: string;
    bounceTarget: string;
    spfValue: string;
    dmarcRua: string;
    dmarcValue: string;
    verificationStatus: {
        ownership: DnsVerificationStatus;
        spf: DnsVerificationStatus;
        dkim: DnsVerificationStatus;
        dmarc: DnsVerificationStatus;
        tracking: DnsVerificationStatus;
        bounce: DnsVerificationStatus;
    };
    dnsRecords: DnsRecord[];
    isVerified: boolean;
    isReadyForSending: boolean;
    lastVerifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSendingDomainData {
    domain: string;
    dkimSelector?: string;
    trackingPrefix?: string;
    bouncePrefix?: string;
    dmarcRua?: string;
}

export interface WhatsAppCampaignRecipient {
    _id?: string;
    phoneNumber: string;
    name: string;
    status: 'pending' | 'accepted' | 'sent' | 'delivered' | 'read' | 'failed';
    whatsAppMessageId?: string | null;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    failedAt?: string;
    lastStatusAt?: string;
    error?: string;
}

export interface WhatsAppCampaign {
    _id: string;
    name: string;
    template: string | {
        _id: string;
        name: string;
        status: string;
        category: string;
        language: string;
    };
    templateName: string;
    templateLanguage: string;
    templateCategory: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    bodyPreview: string;
    parameters: string[];
    recipients: WhatsAppCampaignRecipient[];
    status: 'draft' | 'sending' | 'completed' | 'partial' | 'failed';
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
    createdBy: string;
    clientId: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWhatsAppCampaignData {
    name: string;
    templateId: string;
    parameters?: string[];
    recipients?: Array<Pick<WhatsAppCampaignRecipient, 'phoneNumber' | 'name'>>;
}

export interface WhatsAppCampaignStats {
    totalCampaigns: number;
    totalRecipients: number;
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
}
