// Validation and type guard utilities for Knova
// Provides runtime type safety and branded types

import { MarketCategory, MarketStatus, VerificationLevel, ProfileVisibility, Currency } from './index';

// Branded types for enhanced type safety
export type UserId = string & { readonly __brand: 'UserId' };
export type MarketId = string & { readonly __brand: 'MarketId' };
export type PredictionId = string & { readonly __brand: 'PredictionId' };
export type TransactionId = string & { readonly __brand: 'TransactionId' };
export type WalletAddress = string & { readonly __brand: 'WalletAddress' };
export type WorldIdNullifier = string & { readonly __brand: 'WorldIdNullifier' };

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Type guards for UUID validation
export function isUserId(value: string): value is UserId {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isMarketId(value: string): value is MarketId {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isPredictionId(value: string): value is PredictionId {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isTransactionId(value: string): value is TransactionId {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// Wallet address validation (Ethereum format)
export function isWalletAddress(value: string): value is WalletAddress {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

// World ID nullifier validation
export function isWorldIdNullifier(value: string): value is WorldIdNullifier {
  // World ID nullifiers are typically hex strings
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

// Enum validation helpers
export function validateMarketCategory(category: string): category is MarketCategory {
  return ['sports', 'crypto', 'music', 'user_generated'].includes(category);
}

export function validateMarketStatus(status: string): status is MarketStatus {
  return ['draft', 'pending_approval', 'active', 'paused', 'closed', 'resolved', 'cancelled'].includes(status);
}

export function validateVerificationLevel(level: string): level is VerificationLevel {
  return ['device', 'orb'].includes(level);
}

export function validateProfileVisibility(visibility: string): visibility is ProfileVisibility {
  return ['public', 'verified_only', 'private'].includes(visibility);
}

export function validateCurrency(currency: string): currency is Currency {
  return ['WLD', 'USDC', 'ETH'].includes(currency);
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Username validation (alphanumeric, underscores, hyphens, 3-20 chars)
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

// Display name validation (allows spaces, 1-50 chars)
export function isValidDisplayName(displayName: string): boolean {
  return displayName.length >= 1 && displayName.length <= 50 && displayName.trim().length > 0;
}

// Country code validation (ISO 3166-1 alpha-2)
export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

// Age validation (18-120 years for compliance)
export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= 18 && age <= 120;
}

// Stake amount validation
export function isValidStakeAmount(amount: number, minStake: number, maxStake?: number): ValidationResult {
  const errors: string[] = [];
  
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('Stake amount must be a positive number');
  }
  
  if (amount < minStake) {
    errors.push(`Stake amount must be at least ${minStake}`);
  }
  
  if (maxStake && amount > maxStake) {
    errors.push(`Stake amount cannot exceed ${maxStake}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// URL validation (for image uploads)
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Image URL validation (checks for common image extensions)
export function isValidImageUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowercaseUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowercaseUrl.includes(ext));
}

// File validation for uploads
export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedTypes: string[]; // MIME types
  allowedExtensions: string[];
}

export function validateFile(file: File, options: FileValidationOptions): ValidationResult {
  const errors: string[] = [];
  
  if (file.size > options.maxSize) {
    errors.push(`File size must be less than ${Math.round(options.maxSize / 1024 / 1024)}MB`);
  }
  
  if (!options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!options.allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Market validation
export function validateMarketTitle(title: string): ValidationResult {
  const errors: string[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Market title is required');
  } else if (title.length < 10) {
    errors.push('Market title must be at least 10 characters');
  } else if (title.length > 200) {
    errors.push('Market title cannot exceed 200 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMarketDescription(description: string): ValidationResult {
  const errors: string[] = [];
  
  if (!description || description.trim().length === 0) {
    errors.push('Market description is required');
  } else if (description.length < 20) {
    errors.push('Market description must be at least 20 characters');
  } else if (description.length > 1000) {
    errors.push('Market description cannot exceed 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMarketEndDate(endDate: Date): ValidationResult {
  const errors: string[] = [];
  const now = new Date();
  const minFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  const maxFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  
  if (endDate <= minFuture) {
    errors.push('Market end date must be at least 24 hours in the future');
  }
  
  if (endDate > maxFuture) {
    errors.push('Market end date cannot be more than 1 year in the future');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Prediction validation
export function validatePredictionOutcome(outcome: string, validOutcomes: string[]): ValidationResult {
  const errors: string[] = [];
  
  if (!validOutcomes.includes(outcome)) {
    errors.push('Invalid prediction outcome');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// World ID proof validation structure
export interface WorldIdProofValidation {
  proof: string;
  merkleRoot: string;
  nullifierHash: string;
  verificationLevel: VerificationLevel;
}

export function validateWorldIdProof(proof: any): ValidationResult {
  const errors: string[] = [];
  
  if (!proof || typeof proof !== 'object') {
    errors.push('World ID proof is required');
    return { isValid: false, errors };
  }
  
  if (!proof.proof || typeof proof.proof !== 'string') {
    errors.push('Invalid World ID proof format');
  }
  
  if (!proof.merkle_root || typeof proof.merkle_root !== 'string') {
    errors.push('Invalid World ID merkle root');
  }
  
  if (!proof.nullifier_hash || typeof proof.nullifier_hash !== 'string') {
    errors.push('Invalid World ID nullifier hash');
  }
  
  if (!validateVerificationLevel(proof.verification_level)) {
    errors.push('Invalid World ID verification level');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Comprehensive object validation
export function validateRequired<T>(obj: T, requiredFields: (keyof T)[]): ValidationResult {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`${String(field)} is required`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Type assertion helpers
export function assertUserId(value: string): UserId {
  if (!isUserId(value)) {
    throw new Error(`Invalid user ID: ${value}`);
  }
  return value as UserId;
}

export function assertMarketId(value: string): MarketId {
  if (!isMarketId(value)) {
    throw new Error(`Invalid market ID: ${value}`);
  }
  return value as MarketId;
}

export function assertWalletAddress(value: string): WalletAddress {
  if (!isWalletAddress(value)) {
    throw new Error(`Invalid wallet address: ${value}`);
  }
  return value as WalletAddress;
} 