"use client";

import React, { useState, useEffect } from 'react';
import { FiX, FiUser } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { userService } from '@/services/user.service';
import { workflowService } from '@/services/workflow.service';

interface AssignOfficerModalProps {
  requestId: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignOfficerModal({ requestId, onClose, onAssigned }: AssignOfficerModalProps) {
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        // Fetch officers (users with role 'assistant_project_officer')
        const users = await userService.getUsers({ role: 'assistant_project_officer' });
        setOfficers(users);
      } catch (error) {
        console.error('Error fetching officers:', error);
        setError('Failed to load officers. Please try again.');
      }
    };

    fetchOfficers();
  }, []);

  const handleAssign = async () => {
    if (!selectedOfficerId) {
      setError('Please select an officer to assign.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Assign the officer to the request
      await workflowService.assignToOfficer(requestId, selectedOfficerId);
      
      // Notify parent component
      onAssigned();
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error assigning officer:', error);
      setError('Failed to assign officer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-playfair font-semibold">Assign Officer</h2>
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
              Select Officer
            </label>
            {officers.length === 0 ? (
              <div className="text-text-muted">Loading officers...</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {officers.map((officer) => (
                  <div 
                    key={officer.id}
                    className={`flex items-center p-3 rounded-md cursor-pointer ${
                      selectedOfficerId === officer.id 
                        ? 'bg-bgf-burgundy/10 border border-bgf-burgundy' 
                        : 'bg-slate-gray/5 hover:bg-slate-gray/10 border border-transparent'
                    }`}
                    onClick={() => setSelectedOfficerId(officer.id)}
                  >
                    <div className="bg-bgf-burgundy/10 text-bgf-burgundy rounded-full p-2 mr-3">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <div className="font-medium">{officer.full_name}</div>
                      <div className="text-sm text-text-muted">{officer.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              onClick={handleAssign}
              disabled={loading || !selectedOfficerId}
            >
              {loading ? 'Assigning...' : 'Assign Officer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
