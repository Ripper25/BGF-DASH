"use client";

import React, { useState, useEffect } from 'react';
import { FiX, FiUser } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { userService } from '@/services/user.service';
import { workflowService } from '@/services/workflow.service';

interface DelegateRequestModalProps {
  requestId: string;
  currentAssigneeId?: string;
  onClose: () => void;
  onDelegated: () => void;
}

export default function DelegateRequestModal({
  requestId,
  currentAssigneeId,
  onClose,
  onDelegated
}: DelegateRequestModalProps) {
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [delegationReason, setDelegationReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // Fetch staff users (users with staff roles)
        const users = await userService.getStaffUsers();
        
        // Filter out the current assignee
        const filteredStaff = currentAssigneeId
          ? users.filter(user => user.id !== currentAssigneeId)
          : users;
        
        setStaff(filteredStaff);
      } catch (error) {
        console.error('Error fetching staff:', error);
        setError('Failed to load staff members. Please try again.');
      }
    };

    fetchStaff();
  }, [currentAssigneeId]);

  const handleDelegate = async () => {
    if (!selectedStaffId) {
      setError('Please select a staff member to delegate to.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Delegate the request to the selected staff member
      await workflowService.delegateRequest(requestId, selectedStaffId, delegationReason);
      
      // Notify parent component
      onDelegated();
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error delegating request:', error);
      setError('Failed to delegate request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-playfair font-semibold">Delegate Request</h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-terracotta/10 text-terracotta p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-text-secondary font-medium mb-2">
              Select Staff Member
            </label>
            {staff.length === 0 ? (
              <div className="text-text-muted">Loading staff members...</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {staff.map((staffMember) => (
                  <div 
                    key={staffMember.id}
                    className={`flex items-center p-3 rounded-md cursor-pointer ${
                      selectedStaffId === staffMember.id 
                        ? 'bg-bgf-burgundy/10 border border-bgf-burgundy' 
                        : 'bg-slate-gray/5 hover:bg-slate-gray/10 border border-transparent'
                    }`}
                    onClick={() => setSelectedStaffId(staffMember.id)}
                  >
                    <div className="bg-bgf-burgundy/10 text-bgf-burgundy rounded-full p-2 mr-3">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <div className="font-medium">{staffMember.full_name}</div>
                      <div className="text-sm text-text-muted">{staffMember.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-text-secondary font-medium mb-2">
              Reason for Delegation (Optional)
            </label>
            <textarea
              value={delegationReason}
              onChange={(e) => setDelegationReason(e.target.value)}
              placeholder="Explain why you're delegating this request..."
              className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleDelegate}
              disabled={loading || !selectedStaffId}
            >
              {loading ? 'Delegating...' : 'Delegate Request'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
