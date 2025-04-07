"use client";

import React, { useState, useEffect } from 'react';
import { FiClock, FiUser, FiCheckCircle, FiXCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { workflowService } from '@/services/workflow.service';
import { REQUEST_STATUS_LABELS } from '@/constants/request.constants';

interface WorkflowHistoryProps {
  requestId: string;
}

interface WorkflowHistoryItem {
  id: string;
  request_id: string;
  action: string;
  status: string;
  previous_status?: string;
  user_id: string;
  user_name: string;
  details?: Record<string, any>;
  created_at: string;
}

export default function WorkflowHistory({ requestId }: WorkflowHistoryProps) {
  const [history, setHistory] = useState<WorkflowHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflowHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const historyData = await workflowService.getWorkflowHistory(requestId);
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching workflow history:', error);
        setError('Failed to load workflow history');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowHistory();
  }, [requestId]);

  const getActionIcon = (action: string, status: string) => {
    if (action === 'status_change') {
      if (status === 'approved') return <FiCheckCircle className="text-green-500" />;
      if (status === 'rejected') return <FiXCircle className="text-terracotta" />;
      return <FiArrowRight className="text-gold" />;
    }
    
    if (action === 'assignment') return <FiUser className="text-bgf-burgundy" />;
    if (action === 'comment') return <FiAlertCircle className="text-blue-500" />;
    
    return <FiClock className="text-text-muted" />;
  };

  const getActionText = (item: WorkflowHistoryItem) => {
    switch (item.action) {
      case 'status_change':
        return item.previous_status 
          ? `Status changed from ${REQUEST_STATUS_LABELS[item.previous_status]} to ${REQUEST_STATUS_LABELS[item.status]}`
          : `Status set to ${REQUEST_STATUS_LABELS[item.status]}`;
      
      case 'assignment':
        return `Request assigned to ${item.details?.assigned_to_name || 'a staff member'}`;
      
      case 'comment':
        return `Comment added: "${item.details?.comment || ''}"`;
      
      default:
        return `Action: ${item.action}`;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading workflow history...</div>;
  }

  if (error) {
    return <div className="text-terracotta py-4">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="text-text-muted text-center py-8">No workflow history available</div>;
  }

  return (
    <div className="space-y-6">
      {history.map((item) => (
        <div key={item.id} className="relative pl-6 pb-6 border-l-2 border-slate-gray/20">
          <div className="absolute top-0 left-[-8px] w-4 h-4 rounded-full bg-slate-gray/30 flex items-center justify-center">
            {getActionIcon(item.action, item.status)}
          </div>
          <div className="text-sm text-text-muted mb-1">{new Date(item.created_at).toLocaleString()}</div>
          <div className="font-medium">{getActionText(item)}</div>
          <p className="text-text-secondary text-sm mt-1">By {item.user_name}</p>
          
          {item.details && item.details.notes && (
            <div className="mt-2 bg-slate-gray/5 p-3 rounded-md text-sm">
              {item.details.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
