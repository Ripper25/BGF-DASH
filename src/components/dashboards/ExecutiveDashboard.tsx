"use client";

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { FiFileText, FiUsers, FiCheckSquare, FiClock, FiBarChart2, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/app/routes';
import Link from 'next/link';
import { executiveService, ExecutiveStats, RequestTypeStats, MonthlyTrend, PendingApproval } from '@/services/executive.service';



export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExecutiveStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });
  const [requestTypes, setRequestTypes] = useState<RequestTypeStats[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.role) {
          throw new Error('User role not found');
        }

        // Ensure we have a valid role for API calls
        const apiRole = user.role === 'ceo' || user.role === 'director' || user.role === 'patron' || user.role === 'admin'
          ? user.role
          : 'director'; // Default to director if role doesn't match expected values

        // Fetch dashboard statistics
        const dashboardStats = await executiveService.getDashboardStats(apiRole);
        setStats(dashboardStats);

        // Fetch request type statistics
        const typeStats = await executiveService.getRequestTypeStats();
        setRequestTypes(typeStats);

        // Fetch monthly trends
        const trends = await executiveService.getMonthlyTrends(6);
        setMonthlyTrends(trends);

        // Fetch pending approvals
        const approvals = await executiveService.getPendingApprovals(apiRole);
        setPendingApprovals(approvals);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');

        // Set empty data
        setPendingApprovals([]);
        setRequestTypes([]);
        setMonthlyTrends([]);
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          totalAmount: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-playfair font-semibold">Welcome, {user?.full_name}</h1>
        <p className="text-text-muted mt-1">Here's an executive overview of the foundation's activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-bgf-burgundy/10 flex items-center justify-center mr-4">
              <FiFileText className="text-bgf-burgundy" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-playfair font-semibold">Total Requests</h2>
              <p className="text-3xl font-playfair font-bold text-bgf-burgundy">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mr-4">
              <FiClock className="text-gold" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-playfair font-semibold">Pending Approval</h2>
              <p className="text-3xl font-playfair font-bold text-gold">{pendingApprovals.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center mr-4">
              <FiCheckSquare className="text-forest-green" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-playfair font-semibold">Approved</h2>
              <p className="text-3xl font-playfair font-bold text-forest-green">{stats.approved}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-navy-blue/10 flex items-center justify-center mr-4">
              <FiDollarSign className="text-navy-blue" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-playfair font-semibold">Total Amount</h2>
              <p className="text-3xl font-playfair font-bold text-navy-blue">${stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-playfair font-semibold">Pending Executive Approvals</h2>
          <Link href={ROUTES.APPROVALS}>
            <Button variant="tertiary" size="sm">View All</Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-gray/20">
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">ID</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Title</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Requester</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Amount</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Status</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <div className="w-8 h-8 border-2 border-t-transparent border-bgf-burgundy rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-text-muted text-sm">Loading approvals...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-terracotta">
                    <div className="flex items-center justify-center">
                      <FiAlertTriangle className="mr-2" />
                      <span>{error}</span>
                    </div>
                  </td>
                </tr>
              ) : pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">No pending approvals requiring executive action</td>
                </tr>
              ) : (
                pendingApprovals.map((approval) => (
                  <tr key={approval.id} className="border-b border-slate-gray/10 hover:bg-slate-gray/5">
                    <td className="py-4 px-6 font-lato text-text-primary">{approval.request_id.substring(0, 8)}...</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{approval.title}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{approval.requester_name}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">
                      {approval.amount > 0 ? `$${approval.amount.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={approval.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Link href={`/requests/${approval.request_id}`}>
                          <Button variant="secondary" size="sm">View</Button>
                        </Link>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            // In a real implementation, this would call an API to approve the request
                            alert('Approval functionality would be implemented here');
                          }}
                        >
                          Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-playfair font-semibold">Request Types</h2>
            <Link href={ROUTES.REPORTS}>
              <Button variant="tertiary" size="sm">
                <FiBarChart2 className="mr-2" />
                View Reports
              </Button>
            </Link>
          </div>

          <div className="h-64 flex items-center justify-center">
            {loading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-t-transparent border-bgf-burgundy rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-text-muted text-sm">Loading data...</p>
              </div>
            ) : error ? (
              <div className="text-center text-terracotta flex items-center">
                <FiAlertTriangle className="mr-2" />
                <span>Failed to load data</span>
              </div>
            ) : requestTypes.length === 0 ? (
              <div className="text-center text-text-muted">
                <p>No request type data available</p>
              </div>
            ) : (
              <div className="flex items-end h-full w-full space-x-4 px-4">
                {requestTypes.map((type, index) => {
                  // Define colors for different types
                  const colors = [
                    'bg-bgf-burgundy',
                    'bg-gold',
                    'bg-navy-blue',
                    'bg-forest-green',
                    'bg-slate-gray'
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div key={type.type} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-full rounded-t-md ${color}`}
                        style={{ height: `${type.percentage}%` }}
                      ></div>
                      <span className="text-xs mt-2 text-text-muted text-center truncate w-full">
                        {type.type}
                      </span>
                      <span className="text-sm font-medium">{type.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-playfair font-semibold">Monthly Trends</h2>
            <Link href={ROUTES.REPORTS}>
              <Button variant="tertiary" size="sm">
                <FiBarChart2 className="mr-2" />
                View Reports
              </Button>
            </Link>
          </div>

          <div className="h-64 flex items-center justify-center">
            {loading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-t-transparent border-bgf-burgundy rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-text-muted text-sm">Loading data...</p>
              </div>
            ) : error ? (
              <div className="text-center text-terracotta flex items-center">
                <FiAlertTriangle className="mr-2" />
                <span>Failed to load data</span>
              </div>
            ) : monthlyTrends.length === 0 ? (
              <div className="text-center text-text-muted">
                <p>No monthly trend data available</p>
              </div>
            ) : (
              <div className="flex items-end h-full w-full space-x-4 px-4">
                {monthlyTrends.map((month) => {
                  // Calculate height percentage (max 90%)
                  const maxCount = Math.max(...monthlyTrends.map(m => m.count));
                  const heightPercentage = maxCount > 0
                    ? Math.min(90, Math.round((month.count / maxCount) * 90))
                    : 0;

                  return (
                    <div key={month.month} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full rounded-t-md bg-bgf-burgundy"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                      <span className="text-xs mt-2 text-text-muted">{month.month}</span>
                      <span className="text-xs font-medium">{month.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
