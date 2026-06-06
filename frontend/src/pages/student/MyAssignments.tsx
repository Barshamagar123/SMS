// src/pages/student/MyAssignments.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Download, Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { assignmentApi } from '../../api/api';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: { name: string };
  dueDate: string;
  totalMarks: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
  attachments: { id: number; fileName: string; fileUrl: string }[];
  submission?: {
    id: number;
    submittedAt: string;
    marksObtained?: number;
    grade?: string;
    feedback?: string;
  };
}

const MyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentApi.getMyAssignments();
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await assignmentApi.downloadFile('assignment', fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1"><Upload size={12} /> Submitted</span>;
      case 'GRADED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Graded</span>;
      case 'LATE':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><AlertCircle size={12} /> Late</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><Clock size={12} /> Pending</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Assignments</h1>
        <p className="text-gray-500 mt-1">View and submit your assignments</p>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="p-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{assignment.subject?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                    <div>
                      <span>Total Marks: {assignment.totalMarks}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/student/assignments/${assignment.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {assignment.status === 'SUBMITTED' ? 'View Submission' : 'Submit Assignment'}
                </Link>
              </div>

              {/* Attachments */}
              {assignment.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                  <div className="flex gap-2 flex-wrap">
                    {assignment.attachments.map(file => (
                      <button
                        key={file.id}
                        onClick={() => handleDownload(file.id, file.fileName)}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
                      >
                        <Download size={12} />
                        {file.fileName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Info */}
              {assignment.submission && (
                <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-3 rounded-b-xl">
                  <div>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(assignment.submission.submittedAt).toLocaleString()}
                    </p>
                    {assignment.submission.marksObtained !== undefined && (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        Marks: {assignment.submission.marksObtained}/{assignment.totalMarks} ({assignment.submission.grade})
                      </p>
                    )}
                    {assignment.submission.feedback && (
                      <p className="text-sm text-gray-600 mt-1">Feedback: {assignment.submission.feedback}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No assignments found</h3>
            <p className="text-gray-500">No assignments have been posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssignments;