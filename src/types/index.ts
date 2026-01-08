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
