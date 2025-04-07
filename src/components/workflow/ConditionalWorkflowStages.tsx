"use client";

import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { workflowService } from '@/services/workflow.service';
import { WORKFLOW_STAGES } from '@/constants/workflow-conditions';

interface ConditionalWorkflowStagesProps {
  requestId: string;
  requestType: string;
  currentStage: string;
  onStageChange?: (newStage: string) => void;
  readOnly?: boolean;
}

export default function ConditionalWorkflowStages({
  requestId,
  requestType,
  currentStage,
  onStageChange,
  readOnly = false
}: ConditionalWorkflowStagesProps) {
  const [workflowConfig, setWorkflowConfig] = useState<any>(null);
  const [nextStages, setNextStages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the workflow configuration and next stages
  useEffect(() => {
    try {
      const config = workflowService.getWorkflowConfig(requestType);
      setWorkflowConfig(config);
      
      const nextPossibleStages = workflowService.getNextPossibleStages(requestType, currentStage);
      setNextStages(nextPossibleStages);
    } catch (err) {
      console.error('Error getting workflow configuration:', err);
      setError('Failed to load workflow configuration');
    }
  }, [requestType, currentStage]);

  // Handle stage change
  const handleStageChange = async (newStage: string) => {
    if (readOnly) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Update the stage
      await workflowService.updateStage(requestId, newStage);
      
      // Call the onStageChange callback if provided
      if (onStageChange) {
        onStageChange(newStage);
      }
      
      // Update the next stages
      const nextPossibleStages = workflowService.getNextPossibleStages(requestType, newStage);
      setNextStages(nextPossibleStages);
    } catch (err: any) {
      console.error('Error updating stage:', err);
      setError(err.message || 'Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  // Get stage name from stage ID
  const getStageName = (stageId: string): string => {
    if (!workflowConfig) return stageId;
    
    const stage = workflowConfig.stages[stageId];
    return stage ? stage.name : stageId;
  };

  // Get stage color based on stage ID
  const getStageColor = (stageId: string): string => {
    switch (stageId) {
      case WORKFLOW_STAGES.APPROVED:
        return 'bg-green-500 text-white';
      case WORKFLOW_STAGES.REJECTED:
      case WORKFLOW_STAGES.CANCELLED:
        return 'bg-terracotta text-white';
      case WORKFLOW_STAGES.SUBMITTED:
        return 'bg-blue-500 text-white';
      case WORKFLOW_STAGES.FINANCIAL_REVIEW:
      case WORKFLOW_STAGES.DOCUMENTATION_REVIEW:
        return 'bg-purple-500 text-white';
      case WORKFLOW_STAGES.SITE_VISIT:
      case WORKFLOW_STAGES.COMMITTEE_REVIEW:
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gold text-white';
    }
  };

  // Get stage icon based on stage ID
  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case WORKFLOW_STAGES.APPROVED:
        return <FiCheck />;
      case WORKFLOW_STAGES.REJECTED:
      case WORKFLOW_STAGES.CANCELLED:
        return <FiX />;
      default:
        return null;
    }
  };

  if (!workflowConfig) {
    return <div className="text-text-muted">Loading workflow...</div>;
  }

  return (
    <div>
      {error && (
        <div className="bg-terracotta/10 text-terracotta p-3 rounded-md mb-4 flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <div className="font-medium mb-2">Current Stage</div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${getStageColor(currentStage)}`}>
          {getStageIcon(currentStage) && <span className="mr-1">{getStageIcon(currentStage)}</span>}
          {getStageName(currentStage)}
        </div>
      </div>
      
      {!readOnly && nextStages.length > 0 && (
        <div>
          <div className="font-medium mb-2">Next Possible Stages</div>
          <div className="flex flex-wrap gap-2">
            {nextStages.map((stage) => (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                disabled={loading}
                className={`flex items-center px-3 py-1 rounded-full ${getStageColor(stage)} ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {getStageIcon(stage) && <span className="mr-1">{getStageIcon(stage)}</span>}
                {getStageName(stage)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {readOnly && nextStages.length > 0 && (
        <div>
          <div className="font-medium mb-2">Next Possible Stages</div>
          <div className="flex flex-wrap gap-2">
            {nextStages.map((stage) => (
              <div
                key={stage}
                className={`flex items-center px-3 py-1 rounded-full ${getStageColor(stage)} opacity-50`}
              >
                {getStageIcon(stage) && <span className="mr-1">{getStageIcon(stage)}</span>}
                {getStageName(stage)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {workflowConfig && (
        <div className="mt-6">
          <div className="font-medium mb-2">Workflow Path</div>
          <div className="flex flex-wrap items-center">
            {Object.keys(workflowConfig.stages)
              .filter(stageId => !workflowConfig.stages[stageId].isTerminal)
              .map((stageId, index, array) => (
                <React.Fragment key={stageId}>
                  <div 
                    className={`px-3 py-1 rounded-md ${
                      currentStage === stageId 
                        ? getStageColor(stageId)
                        : 'bg-slate-gray/10 text-text-secondary'
                    }`}
                  >
                    {getStageName(stageId)}
                  </div>
                  {index < array.length - 1 && (
                    <FiChevronRight className="mx-2 text-text-muted" />
                  )}
                </React.Fragment>
              ))}
            <FiChevronRight className="mx-2 text-text-muted" />
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-md bg-green-500/10 text-green-500 border border-green-500/20">
                Approved
              </div>
              <div className="px-3 py-1 rounded-md bg-terracotta/10 text-terracotta border border-terracotta/20">
                Rejected
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
