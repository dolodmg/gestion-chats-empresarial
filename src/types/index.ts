// Re-export types from services
export type { User } from '../services/authService';
export type { Chat, Message } from '../services/chatService';
export type { CustomTable, TableRecord } from '../services/customTableService';
export type { Inscription } from '../services/inscriptionService';

// Campaign types
export interface Recipient {
    email: string;
    name: string;
    status: 'pending' | 'sent' | 'failed';
    sentAt?: string;
    error?: string;
}

export interface Campaign {
    _id: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    recipients: Recipient[];
    status: 'draft' | 'sending' | 'sent' | 'failed' | 'partial';
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    createdBy: string;
    emailCredential: string | EmailCredential;
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
}

export interface CreateCampaignData {
    name: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
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
}
