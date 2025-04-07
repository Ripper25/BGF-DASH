"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { FiArrowLeft, FiSave, FiUpload, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/services/request.service';
import { ROUTES } from '@/app/routes';
import { REQUEST_TYPES, REQUEST_TYPE_LABELS } from '@/constants/request.constants';
import { getTemplateByType } from '@/constants/request-templates';

export default function NewRequest() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    request_type: REQUEST_TYPES.SCHOLARSHIP,
    amount: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load draft from localStorage when component mounts
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('bgf.request.draft');
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);

        // Check if the draft is less than 7 days old
        const draftDate = new Date(parsedDraft.timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - draftDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          // Set the form data from the draft
          setFormData(parsedDraft.formData);
          setDraftLoaded(true);
        } else {
          // Draft is too old, remove it
          localStorage.removeItem('bgf.request.draft');
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If the request type changes, check if we should apply a template
    if (name === 'request_type' && value !== formData.request_type) {
      // Only apply template if the form is mostly empty
      const isFormEmpty = !formData.title.trim() && !formData.description.trim();

      if (isFormEmpty) {
        const template = getTemplateByType(value);
        if (template) {
          setFormData({
            ...formData,
            request_type: value,
            title: template.title,
            description: template.description,
            amount: template.amount || '',
          });
          return;
        }
      }
    }

    setFormData({ ...formData, [name]: value });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Function to apply a template manually
  const applyTemplate = (requestType: string) => {
    const template = getTemplateByType(requestType);
    if (template) {
      // Ask for confirmation if the form has data
      const hasData = formData.title.trim() || formData.description.trim();

      if (hasData) {
        const confirmed = window.confirm('Applying a template will replace your current form data. Continue?');
        if (!confirmed) return;
      }

      setFormData({
        ...formData,
        request_type: template.request_type,
        title: template.title,
        description: template.description,
        amount: template.amount || '',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Validate file types and sizes
      const validFiles = newFiles.filter(file => {
        // Check file type (allow common document formats)
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const isValidType = validTypes.includes(file.type);

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        const isValidSize = file.size <= maxSize;

        if (!isValidType) {
          alert(`File "${file.name}" is not a supported file type. Please upload PDF, JPEG, PNG, or Word documents.`);
        } else if (!isValidSize) {
          alert(`File "${file.name}" exceeds the maximum file size of 5MB.`);
        }

        return isValidType && isValidSize;
      });

      setFiles([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.request_type) {
      newErrors.request_type = 'Request type is required';
    }

    if (formData.request_type === REQUEST_TYPES.GRANT && !formData.amount) {
      newErrors.amount = 'Amount is required for grant requests';
    } else if (formData.amount && isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    // Show preview
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      try {
        // Send the request to the API
        const requestData = await requestService.createRequest({
          ...formData,
          amount: formData.amount ? Number(formData.amount) : undefined,
        });

        // Upload documents if any
        if (files.length > 0) {
          const uploadFormData = new FormData();
          files.forEach(file => {
            uploadFormData.append('documents', file);
          });

          await requestService.uploadDocuments(requestData.id, uploadFormData);
        }

        // Clear the draft since the request was submitted successfully
        localStorage.removeItem('bgf.request.draft');

        // Success! Redirect to requests list
        router.push(ROUTES.REQUESTS);
        return;
      } catch (apiError: any) {
        console.error('API error:', apiError);
        // For development, show a more user-friendly error but don't redirect
        setApiError(apiError.message || 'Failed to create request. Please try again.');

        // In development mode, we'll still allow viewing the form
        setLoading(false);
        setShowPreview(false);
        return;
      }
    } catch (err: any) {
      console.error('Error creating request:', err);
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
      setShowPreview(false);
    } finally {
      setLoading(false);
    }
  };

  const cancelPreview = () => {
    setShowPreview(false);
  };

  const saveDraft = () => {
    // Save the current form data to localStorage
    const draft = {
      formData,
      timestamp: new Date().toISOString()
    };

    try {
      // We can't save the actual File objects, so we'll just save the file names
      const fileNames = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      localStorage.setItem('bgf.request.draft', JSON.stringify({
        ...draft,
        fileNames
      }));

      setDraftSaved(true);

      // Show a success message that disappears after 3 seconds
      setTimeout(() => {
        setDraftSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      // Show an error message
      setApiError('Failed to save draft. Please try again.');
    }
  };

  return (
    <DashboardLayout title="New Request">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.push(ROUTES.REQUESTS)}>
          <FiArrowLeft className="mr-2" />
          Back to Requests
        </Button>
      </div>

      {apiError && (
        <ErrorMessage
          message={apiError}
          onDismiss={() => setApiError(null)}
          className="mb-6"
        />
      )}

      {showPreview ? (
        <Card className="p-6">
          <h2 className="text-2xl font-playfair font-semibold mb-6">Preview Your Request</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Title</h3>
              <p className="p-3 bg-slate-gray/5 rounded-md">{formData.title}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Request Type</h3>
              <p className="p-3 bg-slate-gray/5 rounded-md">{REQUEST_TYPE_LABELS[formData.request_type]}</p>
            </div>

            {formData.amount && (
              <div>
                <h3 className="text-lg font-medium mb-2">Amount</h3>
                <p className="p-3 bg-slate-gray/5 rounded-md">${Number(formData.amount).toLocaleString()}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <div className="p-3 bg-slate-gray/5 rounded-md whitespace-pre-wrap">{formData.description}</div>
            </div>

            {files.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Attached Documents</h3>
                <ul className="p-3 bg-slate-gray/5 rounded-md">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center py-1">
                      <span className="mr-2">📎</span>
                      <span>{file.name}</span>
                      <span className="ml-2 text-text-muted text-sm">({(file.size / 1024).toFixed(1)} KB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={cancelPreview} disabled={loading}>
                Edit Request
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Confirm & Submit'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={handlePreview}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">Request Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Title <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.title ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                    placeholder="Enter request title"
                  />
                  {errors.title && <p className="text-terracotta text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Description <span className="text-terracotta">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.description ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                    rows={5}
                    placeholder="Provide a detailed description of your request"
                  ></textarea>
                  {errors.description && <p className="text-terracotta text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Request Type <span className="text-terracotta">*</span>
                    </label>
                    <select
                      name="request_type"
                      value={formData.request_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.request_type ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                    >
                      {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {errors.request_type && <p className="text-terracotta text-sm mt-1">{errors.request_type}</p>}

                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => applyTemplate(formData.request_type)}
                        className="text-sm text-bgf-burgundy hover:text-deep-burgundy underline"
                      >
                        Use template for {REQUEST_TYPE_LABELS[formData.request_type]}
                      </button>
                      <p className="text-xs text-text-muted mt-1">
                        Templates provide pre-filled content for common request types
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Amount {formData.request_type === REQUEST_TYPES.GRANT && <span className="text-terracotta">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-text-muted">$</span>
                      </div>
                      <input
                        type="text"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={`w-full pl-8 pr-4 py-3 border ${errors.amount ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && <p className="text-terracotta text-sm mt-1">{errors.amount}</p>}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mt-6">
              <h2 className="text-xl font-playfair font-semibold mb-6">Supporting Documents</h2>

              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-gray/30 rounded-md p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FiUpload className="mx-auto mb-2 text-text-muted" size={24} />
                    <p className="text-text-muted">Drag and drop files here or click to browse</p>
                    <p className="text-text-muted text-sm mt-1">PDF, Word, or image files (max 5MB each)</p>
                    <Button variant="secondary" className="mt-4" type="button">
                      <FiUpload className="mr-2" />
                      Upload Files
                    </Button>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-3">Uploaded Files</h3>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li key={index} className="flex justify-between items-center p-3 bg-slate-gray/5 rounded-md">
                          <div className="flex items-center">
                            <FiFileText className="text-bgf-burgundy mr-3" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{file.name}</p>
                              <p className="text-xs text-text-muted">
                                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-terracotta hover:text-deep-terracotta ml-3"
                            title="Remove file"
                          >
                            <FiX size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">Submission</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Requester Information</h3>
                  <p className="text-text-secondary">
                    <span className="font-medium">Name:</span> {user?.full_name || 'Current User'}
                  </p>
                  <p className="text-text-secondary mt-1">
                    <span className="font-medium">Email:</span> {user?.email || 'user@example.com'}
                  </p>
                </div>

                <div className="border-t border-slate-gray/10 pt-6">
                  <h3 className="font-medium mb-3">Request Process</h3>
                  <ol className="space-y-2 text-text-secondary">
                    <li className="flex items-start">
                      <span className="bg-bgf-burgundy text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                      <span>Submit your request with all required information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-bgf-burgundy text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                      <span>Head of Programs reviews and assigns to an officer</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-bgf-burgundy text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                      <span>Officer conducts due diligence and verification</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-bgf-burgundy text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                      <span>Final review by management and approval</span>
                    </li>
                  </ol>
                </div>

                <div className="pt-4 space-y-3">
                  {draftSaved && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-center text-sm">
                      Draft saved successfully! You can continue later.
                    </div>
                  )}

                  {draftLoaded && !draftSaved && (
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-center text-sm mb-3">
                      Draft loaded from your last session.
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1 justify-center"
                      type="button"
                      onClick={saveDraft}
                      disabled={loading}
                    >
                      <FiSave className="mr-2" />
                      Save Draft
                    </Button>

                    <Button
                      variant="primary"
                      className="flex-1 justify-center"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Preview Request'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </form>
      )}
    </DashboardLayout>
  );
}
