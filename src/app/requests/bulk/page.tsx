"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { FiUpload, FiDownload, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import { requestService } from '@/services/request.service';
import { ROUTES } from '@/app/routes';
import { REQUEST_TYPES, REQUEST_TYPE_LABELS } from '@/constants/request.constants';

export default function BulkRequestSubmission() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's a CSV or Excel file
      if (
        selectedFile.type === 'text/csv' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Please upload a CSV or Excel file');
      }
    }
  };

  const downloadTemplate = () => {
    // Create CSV content
    const headers = ['title', 'description', 'request_type', 'amount'];
    const exampleRow = [
      'Example Scholarship Request',
      'This is an example description for a scholarship request.',
      'scholarship',
      '1000'
    ];
    
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_request_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateAndSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadStatus('validating');
      
      // In a real implementation, we would send the file to the API for validation and processing
      // For this demo, we'll simulate the process
      
      // Simulate file reading and validation
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const rows = content.split('\n');
        const headers = rows[0].split(',');
        
        // Validate headers
        const requiredHeaders = ['title', 'description', 'request_type'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setError(`Missing required headers: ${missingHeaders.join(', ')}`);
          setUploadStatus('error');
          setLoading(false);
          return;
        }
        
        // Process each row
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          const values = rows[i].split(',');
          const rowData: Record<string, any> = {};
          
          // Map values to headers
          headers.forEach((header, index) => {
            rowData[header.trim()] = values[index]?.trim() || '';
          });
          
          // Validate row data
          const validationErrors = [];
          
          if (!rowData.title) validationErrors.push('Title is required');
          if (!rowData.description) validationErrors.push('Description is required');
          if (!rowData.request_type) {
            validationErrors.push('Request type is required');
          } else if (!Object.values(REQUEST_TYPES).includes(rowData.request_type)) {
            validationErrors.push(`Invalid request type. Valid types are: ${Object.values(REQUEST_TYPES).join(', ')}`);
          }
          
          if (rowData.amount && isNaN(Number(rowData.amount))) {
            validationErrors.push('Amount must be a number');
          }
          
          const result = {
            row: i,
            data: rowData,
            valid: validationErrors.length === 0,
            errors: validationErrors
          };
          
          results.push(result);
          
          if (result.valid) {
            successCount++;
            
            // In a real implementation, we would submit each valid request to the API
            try {
              // Simulate API call
              // await requestService.createRequest({
              //   ...rowData,
              //   amount: rowData.amount ? Number(rowData.amount) : undefined,
              // });
            } catch (error) {
              result.valid = false;
              result.errors = ['Failed to submit request'];
              successCount--;
              errorCount++;
            }
          } else {
            errorCount++;
          }
        }
        
        setValidationResults(results);
        setSuccessCount(successCount);
        setErrorCount(errorCount);
        setUploadStatus(errorCount === 0 ? 'success' : 'error');
        setLoading(false);
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setUploadStatus('error');
        setLoading(false);
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Error processing bulk upload:', error);
      setError('An unexpected error occurred. Please try again.');
      setUploadStatus('error');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">Bulk Request Submission</h1>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.REQUESTS)}
            className="flex items-center"
          >
            Back to Requests
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-playfair font-semibold mb-6">Upload Requests</h2>
              
              {error && (
                <div className="mb-6">
                  <ErrorMessage message={error} />
                </div>
              )}
              
              <div className="mb-6">
                <div className="bg-slate-gray/5 border-2 border-dashed border-slate-gray/30 rounded-md p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <FiUpload size={40} className="text-text-muted mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {file ? file.name : 'Drag and drop or click to upload'}
                    </p>
                    <p className="text-text-muted text-sm mb-4">
                      Supported formats: CSV, Excel
                    </p>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={loading}
                    >
                      Select File
                    </Button>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  variant="secondary"
                  onClick={downloadTemplate}
                  disabled={loading}
                  className="flex items-center"
                >
                  <FiDownload className="mr-2" />
                  Download Template
                </Button>
                
                <Button
                  variant="primary"
                  onClick={validateAndSubmit}
                  disabled={!file || loading}
                  className="flex items-center"
                >
                  {loading ? 'Processing...' : 'Validate & Submit'}
                </Button>
              </div>
            </Card>
            
            {uploadStatus !== 'idle' && (
              <Card className="p-6 mt-6">
                <h2 className="text-xl font-playfair font-semibold mb-6">Validation Results</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="font-medium">Total Rows:</span> {validationResults.length}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <FiCheck className="text-green-500 mr-2" />
                        <span>{successCount} Valid</span>
                      </div>
                      <div className="flex items-center">
                        <FiX className="text-terracotta mr-2" />
                        <span>{errorCount} Invalid</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-gray/10">
                        <tr>
                          <th className="px-4 py-3 text-left">Row</th>
                          <th className="px-4 py-3 text-left">Title</th>
                          <th className="px-4 py-3 text-left">Request Type</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResults.map((result) => (
                          <tr key={result.row} className="border-t border-slate-gray/10">
                            <td className="px-4 py-3">{result.row}</td>
                            <td className="px-4 py-3">{result.data.title || '-'}</td>
                            <td className="px-4 py-3">
                              {result.data.request_type 
                                ? REQUEST_TYPE_LABELS[result.data.request_type] || result.data.request_type
                                : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {result.valid ? (
                                <span className="flex items-center text-green-500">
                                  <FiCheck className="mr-1" /> Valid
                                </span>
                              ) : (
                                <span className="flex items-center text-terracotta">
                                  <FiX className="mr-1" /> Invalid
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {result.errors.length > 0 ? (
                                <ul className="text-sm text-terracotta">
                                  {result.errors.map((error: string, index: number) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {uploadStatus === 'success' && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-start">
                    <FiCheck className="mr-2 mt-1" />
                    <div>
                      <p className="font-medium">Success!</p>
                      <p>All requests have been submitted successfully.</p>
                    </div>
                  </div>
                )}
                
                {uploadStatus === 'error' && successCount > 0 && (
                  <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md flex items-start">
                    <FiInfo className="mr-2 mt-1" />
                    <div>
                      <p className="font-medium">Partial Success</p>
                      <p>{successCount} requests were submitted successfully. {errorCount} requests had errors.</p>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
          
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-playfair font-semibold mb-6">Instructions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">1. Download Template</h3>
                  <p className="text-text-secondary">
                    Start by downloading our CSV template. This ensures your data is formatted correctly.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">2. Fill in Your Requests</h3>
                  <p className="text-text-secondary">
                    Open the template in Excel or a text editor and add your requests. Each row represents one request.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">3. Required Fields</h3>
                  <ul className="list-disc pl-5 text-text-secondary">
                    <li>title - The title of your request</li>
                    <li>description - A detailed description</li>
                    <li>request_type - Must be one of: {Object.values(REQUEST_TYPES).join(', ')}</li>
                    <li>amount - Optional, must be a number</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">4. Upload & Validate</h3>
                  <p className="text-text-secondary">
                    Upload your completed file and click "Validate & Submit". We'll check for errors before submitting.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">5. Review Results</h3>
                  <p className="text-text-secondary">
                    After validation, you'll see which requests were successful and which had errors.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
