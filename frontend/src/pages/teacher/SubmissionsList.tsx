// src/pages/teacher/SubmissionsList.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, CheckCircle, Clock, FileText, User } from 'lucide-react';
import { assignmentApi } from '../../api/api';
import toast from 'react-hot-toast';

interface Submission {
  id: number;
  studentId: number;
  student: {
    rollNumber: string;
    user: { name: string; email: string };
  };
  submittedAt: string;
  comment: string | null;
  marksObtained: number | null;
  grade: string | null;
  feedback: string | null;
  attachments: { id: number; fileName: string; fileUrl: string }[];
}

interface Assignment {
  id: number;
  title: string;
  totalMarks: number;
  passingMarks: number;
}

const SubmissionsList: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<number | null>(null);
  const [gradeModal, setGradeModal] = useState<{ 
    open: boolean; 
    submissionId: number; 
    marks: number; 
    feedback: string 
  }>({
    open: false, 
    submissionId: 0, 
    marks: 0, 
    feedback: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Only one API call needed - get assignment details with submissions
      const response = await assignmentApi.getAssignmentById(Number(assignmentId));
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const assignmentData = response.data.data;
        setAssignment({
          id: assignmentData.id,
          title: assignmentData.title,
          totalMarks: assignmentData.totalMarks,
          passingMarks: assignmentData.passingMarks
        });
        setSubmissions(assignmentData.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = (submissionId: number, currentMarks?: number, currentFeedback?: string) => {
    setGradeModal({
      open: true,
      submissionId,
      marks: currentMarks || 0,
      feedback: currentFeedback || ''
    });
  };

  const submitGrade = async () => {
    setGrading(gradeModal.submissionId);
    try {
      const response = await assignmentApi.gradeSubmission(
        gradeModal.submissionId,
        gradeModal.marks,
        gradeModal.feedback
      );
      if (response.data.success) {
        toast.success('Grade submitted successfully');
        setGradeModal({ open: false, submissionId: 0, marks: 0, feedback: '' });
        fetchSubmissions(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGrading(null);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await assignmentApi.downloadFile('submission', fileId);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate('/teacher/assignments')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft size={20} /> Back to Assignments
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{assignment?.title || 'Assignment'}</h1>
        <p className="text-gray-500 mt-1">
          Student Submissions - {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">{submission.student?.user?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{submission.student?.rollNumber || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(submission.submittedAt)}</td>
                  <td className="px-6 py-4">
                    {submission.attachments && submission.attachments.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {submission.attachments.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Download size={14} /> {file.fileName}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No files</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {submission.comment || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {submission.marksObtained !== null ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1 w-fit">
                        <CheckCircle size={12} /> Graded
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1 w-fit">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {submission.marksObtained !== null ? (
                      <span className="font-medium">{submission.marksObtained}/{assignment?.totalMarks || 100}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleGrade(
                        submission.id, 
                        submission.marksObtained || undefined, 
                        submission.feedback || undefined
                      )}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition"
                    >
                      {submission.marksObtained !== null ? 'Edit Grade' : 'Grade'}
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    No submissions yet
                    <p className="text-sm text-gray-400 mt-1">Students haven't submitted this assignment yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Modal */}
      {gradeModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Grade Submission</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks Obtained (Max: {assignment?.totalMarks || 100})
                </label>
                <input
                  type="number"
                  value={gradeModal.marks}
                  onChange={(e) => setGradeModal({ ...gradeModal, marks: Number(e.target.value) })}
                  min={0}
                  max={assignment?.totalMarks || 100}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (Optional)</label>
                <textarea
                  value={gradeModal.feedback}
                  onChange={(e) => setGradeModal({ ...gradeModal, feedback: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide feedback to the student..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setGradeModal({ open: false, submissionId: 0, marks: 0, feedback: '' })}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitGrade}
                  disabled={grading !== null}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {grading === gradeModal.submissionId ? <Loader2 size={18} className="animate-spin" /> : 'Submit Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;