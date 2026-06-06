// src/pages/teacher/TeacherAssignments.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Download, Users, FileText, Loader2, Eye, Trash2, Edit2 } from 'lucide-react';
import { assignmentApi } from '../../api/api';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  title: string;
  description: string;
  class: { id: number; name: string; section: string };
  subject: { name: string };
  dueDate: string;
  totalMarks: number;
  submissions: { id: number; student: { user: { name: string } }; submittedAt: string; marksObtained: number | null }[];
  attachments: { id: number; fileName: string }[];
}

const TeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentApi.getTeacherAssignments();
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await assignmentApi.deleteAssignment(id);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubmissionStats = (assignment: Assignment) => {
    const total = assignment.submissions?.length || 0;
    const submitted = assignment.submissions?.filter(s => s.marksObtained !== null).length || 0;
    const pending = total - submitted;
    return { total, submitted, pending };
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-gray-500 mt-1">Manage and grade student assignments</p>
        </div>
        <Link
          to="/teacher/assignments/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Create Assignment
        </Link>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const stats = getSubmissionStats(assignment);
          return (
            <div key={assignment.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {assignment.class?.name} - {assignment.class?.section}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                        {assignment.subject?.name}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span>Total Marks: {assignment.totalMarks}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>Submissions: {stats.submitted}/{stats.total}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/teacher/assignments/${assignment.id}/submissions`}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition flex items-center gap-1"
                    >
                      <Eye size={14} /> View Submissions
                    </Link>
                    <Link
                      to={`/teacher/assignments/${assignment.id}/edit`}
                      className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition flex items-center gap-1"
                    >
                      <Edit2 size={14} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {stats.total > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Submission Progress</span>
                      <span className="text-gray-600">{stats.submitted}/{stats.total} submitted</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(stats.submitted / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No assignments created</h3>
            <p className="text-gray-500">Click "Create Assignment" to post your first assignment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;