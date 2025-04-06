/**
 * Utility functions for standardizing status format between frontend and backend
 */
import { REQUEST_STATUS, REQUEST_STATUS_LABELS } from '@/constants/request.constants';

/**
 * Convert backend status (with underscores) to frontend status (with hyphens)
 * @param backendStatus - Status string from the backend (e.g., 'under_review')
 * @returns Frontend status string (e.g., 'under-review')
 */
export function toFrontendStatus(backendStatus: string): string {
  if (!backendStatus) return '';
  return backendStatus.replace(/_/g, '-');
}

/**
 * Convert frontend status (with hyphens) to backend status (with underscores)
 * @param frontendStatus - Status string from the frontend (e.g., 'under-review')
 * @returns Backend status string (e.g., 'under_review')
 */
export function toBackendStatus(frontendStatus: string): string {
  if (!frontendStatus) return '';
  return frontendStatus.replace(/-/g, '_');
}

/**
 * Map of backend status values to human-readable labels
 * This is a re-export of the constants for backward compatibility
 */
export const STATUS_LABELS = REQUEST_STATUS_LABELS;

/**
 * Get a human-readable label for a backend status
 * @param backendStatus - Status string from the backend
 * @returns Human-readable label
 */
export function getStatusLabel(backendStatus: string): string {
  return REQUEST_STATUS_LABELS[backendStatus] || backendStatus;
}
