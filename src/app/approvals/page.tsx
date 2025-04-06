"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { FiFilter, FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { workflowService, WorkflowData } from '@/services/workflow.service';
import { RequestData } from '@/services/request.service';

interface ApprovalItem extends WorkflowData {
  request?: RequestData;
}

export default function Approvals() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        // Set empty approvals array since there's no database
        setApprovals([]);
        setTotalPages(0);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch approvals');
        console.error('Error fetching approvals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [statusFilter, currentPage, searchQuery, user?.id]);

  const getStageName = (stage: string): string => {
    switch (stage) {
      case 'hop_initial_review':
        return 'Head of Programs Initial Review';
      case 'officer_review':
        return 'Officer Review';
      case 'hop_final_review':
        return 'Head of Programs Final Review';
      case 'director_review':
        return 'Director Review';
      case 'executive_approval':
        return 'Executive Approval';
      default:
        return stage;
    }
  };

  return (
    <DashboardLayout title="Approvals">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search approvals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md border border-slate-gray/30 focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          </div>
          <Button variant="secondary">
            <FiFilter className="mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="border border-slate-gray/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-gray/20">
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Request ID</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Title</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Requester</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Current Stage</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Assigned To</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Status</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-terracotta">{error}</td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">No approvals found</td>
                </tr>
              ) : (
                approvals.map((approval) => (
                  <tr key={approval.id} className="border-b border-slate-gray/10 hover:bg-slate-gray/5">
                    <td className="py-4 px-6 font-lato text-text-primary">{approval.request_id}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{approval.request?.title}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{approval.request?.requester_name}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{getStageName(approval.current_stage)}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{approval.assigned_to_name}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={approval.request?.status as any} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button variant="tertiary" size="sm">
                          Review
                        </Button>
                        <Button variant="tertiary" size="sm" className="text-forest-green">
                          <FiCheckCircle className="mr-1" /> Approve
                        </Button>
                        <Button variant="tertiary" size="sm" className="text-terracotta">
                          <FiXCircle className="mr-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 px-6">
          <div className="text-sm text-text-muted">
            {loading ? (
              'Loading...'
            ) : (
              <>Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(approvals.length, 10)}</span> of <span className="font-medium">{approvals.length}</span> approvals</>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex space-x-1">
              <Button
                variant="secondary"
                size="sm"
                className="px-3"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                <FiChevronLeft size={18} />
              </Button>

              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "primary" : "secondary"}
                  size="sm"
                  className="px-4"
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={loading}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="secondary"
                size="sm"
                className="px-3"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
              >
                <FiChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
