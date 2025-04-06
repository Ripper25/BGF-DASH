"use client";

import React from 'react';
import { FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';

// Import workflow stages from constants
import { REQUEST_STATUS } from '@/constants/request.constants';

interface WorkflowStage {
  id: string;
  label: string;
  description: string;
}

interface WorkflowStatusProps {
  currentStatus: string;
  className?: string;
}

/**
 * Workflow visualization component
 * Shows the current stage of a request in the workflow
 */
const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ currentStatus, className = '' }) => {
  // Define the workflow stages in order
  const workflowStages: WorkflowStage[] = [
    {
      id: REQUEST_STATUS.SUBMITTED,
      label: 'Submitted',
      description: 'Request has been submitted and is awaiting initial review'
    },
    {
      id: REQUEST_STATUS.UNDER_REVIEW,
      label: 'Under Review',
      description: 'Request is being reviewed by the Head of Programs'
    },
    {
      id: REQUEST_STATUS.OFFICER_REVIEWED,
      label: 'Officer Review',
      description: 'Field officer has conducted due diligence and verification'
    },
    {
      id: REQUEST_STATUS.HOP_REVIEWED,
      label: 'Program Manager Review',
      description: 'Head of Programs has completed final review'
    },
    {
      id: REQUEST_STATUS.DIRECTOR_REVIEWED,
      label: 'Director Review',
      description: 'Director has reviewed and forwarded to executives'
    },
    {
      id: REQUEST_STATUS.APPROVED,
      label: 'Approved',
      description: 'Request has been approved by CEO/Patron'
    }
  ];

  // Find the current stage index
  const currentStageIndex = workflowStages.findIndex(stage => 
    stage.id === currentStatus || 
    (currentStatus === REQUEST_STATUS.PENDING_INFORMATION && stage.id === REQUEST_STATUS.UNDER_REVIEW)
  );

  // Handle special cases
  const isRejected = currentStatus === REQUEST_STATUS.REJECTED;
  const isPending = currentStatus === REQUEST_STATUS.PENDING_INFORMATION;

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-playfair font-semibold mb-4">Request Progress</h3>
      
      {isRejected ? (
        <div className="bg-terracotta/10 border border-terracotta rounded-md p-4 mb-4">
          <div className="flex items-center">
            <FiAlertCircle className="text-terracotta mr-2" size={20} />
            <p className="text-terracotta font-medium">This request has been rejected</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {workflowStages.map((stage, index) => {
            // Determine the status of this stage
            let status: 'completed' | 'current' | 'pending' = 'pending';
            
            if (index < currentStageIndex) {
              status = 'completed';
            } else if (index === currentStageIndex) {
              status = 'current';
            }
            
            // For pending information, modify the current stage
            const isPendingAndCurrent = isPending && index === currentStageIndex;
            
            return (
              <div key={stage.id} className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {status === 'completed' ? (
                    <div className="w-8 h-8 rounded-full bg-forest-green flex items-center justify-center">
                      <FiCheck className="text-white" />
                    </div>
                  ) : status === 'current' ? (
                    <div className={`w-8 h-8 rounded-full ${isPendingAndCurrent ? 'bg-amber-500' : 'bg-bgf-burgundy'} flex items-center justify-center`}>
                      <FiClock className="text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-gray/20 flex items-center justify-center">
                      <span className="text-slate-gray">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${status === 'completed' ? 'text-forest-green' : status === 'current' ? (isPendingAndCurrent ? 'text-amber-500' : 'text-bgf-burgundy') : 'text-slate-gray'}`}>
                    {stage.label}
                    {isPendingAndCurrent && ' (Pending Information)'}
                  </p>
                  <p className="text-sm text-text-muted">{stage.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkflowStatus;
