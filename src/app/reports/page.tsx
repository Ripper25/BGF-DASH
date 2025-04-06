"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiDownload, FiCalendar, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';

export default function Reports() {
  const [dateRange, setDateRange] = useState<string>('month');
  const [reportType, setReportType] = useState<string>('requests');

  // Mock data for charts
  const requestsByStatusData = {
    labels: ['Submitted', 'Under Review', 'Verified', 'Approved', 'Rejected'],
    values: [25, 15, 20, 35, 5],
    colors: ['#708090', '#1A365D', '#D4AF37', '#2F5233', '#C35A38']
  };

  const requestsByTypeData = {
    labels: ['Financial Aid', 'Educational Support', 'Healthcare', 'Business Grant', 'Community Project'],
    values: [40, 30, 15, 10, 5],
    colors: ['#9A2A2A', '#D4AF37', '#1A365D', '#2F5233', '#708090']
  };

  const requestsTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [12, 19, 15, 22, 30, 25],
    color: '#9A2A2A'
  };

  return (
    <DashboardLayout title="Reports">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <select 
            className="border border-slate-gray/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gold"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="requests">Requests Report</option>
            <option value="users">Users Report</option>
            <option value="approvals">Approvals Report</option>
            <option value="financial">Financial Report</option>
          </select>
          
          <div className="flex items-center space-x-2 border border-slate-gray/30 rounded-md px-3 py-2 bg-white">
            <FiCalendar className="text-text-muted" />
            <select 
              className="bg-transparent focus:outline-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        
        <Button variant="primary">
          <FiDownload className="mr-2" />
          Export Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-playfair font-semibold">Requests by Status</h2>
            <div className="text-text-muted">
              <FiPieChart size={20} />
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {/* In a real application, we would use a chart library like Chart.js or Recharts */}
            <div className="flex items-end h-full w-full space-x-4 px-4">
              {requestsByStatusData.values.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full rounded-t-md" 
                    style={{ 
                      height: `${value * 2}%`, 
                      backgroundColor: requestsByStatusData.colors[index] 
                    }}
                  ></div>
                  <span className="text-xs mt-2 text-text-muted">{requestsByStatusData.labels[index]}</span>
                  <span className="text-sm font-medium">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-playfair font-semibold">Requests by Type</h2>
            <div className="text-text-muted">
              <FiBarChart2 size={20} />
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {/* In a real application, we would use a chart library like Chart.js or Recharts */}
            <div className="flex items-end h-full w-full space-x-4 px-4">
              {requestsByTypeData.values.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full rounded-t-md" 
                    style={{ 
                      height: `${value * 2}%`, 
                      backgroundColor: requestsByTypeData.colors[index] 
                    }}
                  ></div>
                  <span className="text-xs mt-2 text-text-muted text-center">{requestsByTypeData.labels[index]}</span>
                  <span className="text-sm font-medium">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-playfair font-semibold">Requests Trend</h2>
          <div className="text-text-muted">
            <FiTrendingUp size={20} />
          </div>
        </div>
        
        <div className="h-64 flex items-center justify-center">
          {/* In a real application, we would use a chart library like Chart.js or Recharts */}
          <div className="flex items-end h-full w-full space-x-4 px-4">
            {requestsTrendData.values.map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full rounded-t-md" 
                  style={{ 
                    height: `${(value / Math.max(...requestsTrendData.values)) * 80}%`, 
                    backgroundColor: requestsTrendData.color 
                  }}
                ></div>
                <span className="text-xs mt-2 text-text-muted">{requestsTrendData.labels[index]}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <div className="text-center py-4">
            <h3 className="text-lg font-playfair font-semibold mb-2">Total Requests</h3>
            <p className="text-3xl font-playfair font-bold text-bgf-burgundy">124</p>
            <p className="text-sm text-text-muted mt-1">Last 30 days</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center py-4">
            <h3 className="text-lg font-playfair font-semibold mb-2">Approval Rate</h3>
            <p className="text-3xl font-playfair font-bold text-forest-green">72%</p>
            <p className="text-sm text-text-muted mt-1">Last 30 days</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center py-4">
            <h3 className="text-lg font-playfair font-semibold mb-2">Average Processing Time</h3>
            <p className="text-3xl font-playfair font-bold text-gold">5.2 days</p>
            <p className="text-sm text-text-muted mt-1">Last 30 days</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
