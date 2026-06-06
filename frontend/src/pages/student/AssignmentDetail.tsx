// src/pages/student/AssignmentDetail.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Upload, ArrowLeft, Loader2, Calendar, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { assignmentApi } from '../../api/api';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: { name: string };
  dueDate: string;
  totalMarks: number;
  passingMarks: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
  attachments: { id: number; fileName: string; fileUrl: string }[];
  submission?: {
    id: number;
    submittedAt: string;
    marksObtained?: number;
    grade?: string;
    feedback?: string;
    attachments?: { id: number; fileName: string; fileUrl: string }[];
  };
}

const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [comment, setComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await assignmentApi.getAssignmentById(Number(id));
      if (response.data.success) {
        setAssignment(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load assignment');
      navigate('/student/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to submit');
      return;
    }

    setSubmitting(true);
    try {
      const response = await assignmentApi.submitAssignment(Number(id), selectedFiles, comment);
      if (response.data.success) {
        toast.success('Assignment submitted successfully!');
        fetchAssignment();
        setSelectedFiles([]);
        setComment('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string, type: 'assignment' | 'submission') => {
    try {
      const response = await assignmentApi.downloadFile(type, fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPastDue = () => {
    if (!assignment) return false;
    return new Date(assignment.dueDate) < new Date() && assignment.status === 'PENDING';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!assignment) return null;

  const canSubmit = assignment.status === 'PENDING' && !isPastDue();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/assignments')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} /> Back to Assignments
      </button>

      {/* Assignment Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="flex flex-wrap gap-4 mt-3 text-blue-100">
            <div className="flex items-center gap-1">
              <FileText size={16} />
              <span>{assignment.subject?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Due: {formatDate(assignment.dueDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>Total Marks: {assignment.totalMarks}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-600">{assignment.description || 'No description provided.'}</p>
        </div>

        {/* Attachments */}
        {assignment.attachments.length > 0 && (
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Assignment Materials</h2>
            <div className="flex gap-3 flex-wrap">
              {assignment.attachments.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleDownload(file.id, file.fileName, 'assignment')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <Download size={16} />
                  {file.fileName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submission Section */}
        {assignment.status === 'GRADED' && assignment.submission ? (
          <div className="p-6 bg-green-50">
            <h2 className="text-lg font-semibold text-green-800 mb-3">Submission Result</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Marks Obtained:</span> {assignment.submission.marksObtained} / {assignment.totalMarks}</p>
              <p><span className="font-medium">Grade:</span> {assignment.submission.grade}</p>
              {assignment.submission.feedback && <p><span className="font-medium">Feedback:</span> {assignment.submission.feedback}</p>}
              {assignment.submission.attachments && assignment.submission.attachments.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium mb-2">Your Submitted Files:</p>
                  <div className="flex gap-2 flex-wrap">
                    {assignment.submission.attachments.map(file => (
                      <button
                        key={file.id}
                        onClick={() => handleDownload(file.id, file.fileName, 'submission')}
                        className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm hover:bg-gray-100"
                      >
                        <Download size={12} /> {file.fileName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : assignment.status === 'SUBMITTED' ? (
          <div className="p-6 bg-blue-50">
            <div className="flex items-center gap-2 text-blue-800 mb-3">
              <CheckCircle size={20} />
              <h2 className="text-lg font-semibold">Assignment Submitted</h2>
            </div>
            <p>Your assignment has been submitted. Waiting for teacher's review and grading.</p>
            {assignment.submission?.attachments && assignment.submission.attachments.length > 0 && (
              <div className="mt-3">
                <p className="font-medium mb-2">Your Submitted Files:</p>
                <div className="flex gap-2 flex-wrap">
                  {assignment.submission.attachments.map(file => (
                    <button
                      key={file.id}
                      onClick={() => handleDownload(file.id, file.fileName, 'submission')}
                      className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm hover:bg-gray-100"
                    >
                      <Download size={12} /> {file.fileName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isPastDue() ? (
          <div className="p-6 bg-red-50">
            <div className="flex items-center gap-2 text-red-800 mb-3">
              <XCircle size={20} />
              <h2 className="text-lg font-semibold">Assignment Overdue</h2>
            </div>
            <p>You missed the submission deadline. Please contact your teacher.</p>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit Your Work</h2>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="w-full p-2 border border-gray-200 rounded-lg"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <p className="text-xs text-gray-500 mt-1">Allowed: PDF, DOC, DOCX, JPG, PNG, TXT (Max 10MB per file)</p>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                <div className="space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any comments for your teacher..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedFiles.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;