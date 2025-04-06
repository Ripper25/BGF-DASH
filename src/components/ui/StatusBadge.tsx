"use client";

import React from 'react';
import { toFrontendStatus, getStatusLabel } from '@/utils/status-formatter';
import { REQUEST_STATUS } from '@/constants/request.constants';

// Define all possible status types
type StatusType =
  | 'submitted'
  | 'under-review'
  | 'pending-info'
  | 'officer-reviewed'
  | 'hop-reviewed'
  | 'director-reviewed'
  | 'approved'
  | 'rejected'
  | 'completed';

interface StatusBadgeProps {
  status: string; // Accept any status string, will be converted to frontend format
  className?: string;
}

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  // Convert backend status to frontend format if needed
  const frontendStatus = toFrontendStatus(status) as StatusType;

  const statusConfig: Record<string, { label: string, bgColor: string, textColor: string }> = {
    'submitted': {
      label: 'Submitted',
      bgColor: 'bg-slate-gray/20',
      textColor: 'text-slate-gray'
    },
    'under-review': {
      label: 'Under Review',
      bgColor: 'bg-navy-blue/20',
      textColor: 'text-navy-blue'
    },
    'pending-info': {
      label: 'Pending Information',
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-700'
    },
    'officer-reviewed': {
      label: 'Officer Reviewed',
      bgColor: 'bg-indigo-500/20',
      textColor: 'text-indigo-700'
    },
    'hop-reviewed': {
      label: 'Program Manager Reviewed',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-700'
    },
    'director-reviewed': {
      label: 'Director Reviewed',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-700'
    },
    'approved': {
      label: 'Approved',
      bgColor: 'bg-forest-green/20',
      textColor: 'text-forest-green'
    },
    'rejected': {
      label: 'Rejected',
      bgColor: 'bg-terracotta/20',
      textColor: 'text-terracotta'
    },
    'completed': {
      label: 'Completed',
      bgColor: 'bg-gray-500/20',
      textColor: 'text-gray-700'
    }
  };

  // Use the frontendStatus to get the config, fallback to a default if not found
  const config = statusConfig[frontendStatus] || {
    label: getStatusLabel(status) || status,
    bgColor: 'bg-gray-300',
    textColor: 'text-gray-800'
  };

  const { label, bgColor, textColor } = config;

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
