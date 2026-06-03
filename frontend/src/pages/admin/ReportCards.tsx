import React, { useEffect, useState } from 'react';
import { 
  Download, Eye, X, RefreshCw, Printer,
  School, FileText, Calendar, Loader2,
  CheckCircle, XCircle, Users, Award,
  Search, Filter, ChevronLeft, ChevronRight,
  Mail, Send, Plus, AlertCircle, TrendingUp,
  BarChart3, Crown, Medal, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Class {
  id: number;
  displayName: string;
}

interface ExamType {
  id: number;
  name: string;
}

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

interface Exam {
  id: number;
  name: string;
  examTypeId: number;
  classId: number;
  examDate: string;
  isLocked: boolean;
  maxMarks: number;
  subject: { id: number; name: string; code: string };
  class?: { name: string; section: string };
}

interface Student {
  studentId: number;
  rollNumber: string;
  studentName: string;
  marksObtained: number | null;
  percentage: number | null;
  grade: string | null;
  hasResult: boolean;
  isPublished?: boolean;
}

const AdminReportCards: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(true);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear && selectedClass && selectedExamType) {
      fetchExams();
    }
  }, [selectedAcademicYear, selectedClass, selectedExamType]);

  useEffect(() => {
    if (selectedExam) {
      fetchStudents();
    }
  }, [selectedExam]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const yearsRes = await fetch('http://localhost:3000/api/teacher-assignments/academic-years', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const yearsData = await yearsRes.json();
      if (yearsData.success) {
        setAcademicYears(yearsData.data || []);
        const activeYear = yearsData.data?.find((y: AcademicYear) => y.isActive);
        if (activeYear) {
          setSelectedAcademicYear(activeYear.id.toString());
        }
      }
      
      const typesRes = await fetch('http://localhost:3000/api/exams/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const typesData = await typesRes.json();
      if (typesData.success) setExamTypes(typesData.data || []);
      
      const classesRes = await fetch('http://localhost:3000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classesData = await classesRes.json();
      if (classesData.success) {
        setClasses(classesData.data.map((c: any) => ({
          id: c.id,
          displayName: `${c.name} ${c.section}`
        })));
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    if (!selectedAcademicYear || !selectedClass) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/exams/class/${selectedClass}?academicYearId=${selectedAcademicYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (data.success) {
        let examsList = data.data || [];
        if (selectedExamType) {
          examsList = examsList.filter((e: Exam) => e.examTypeId.toString() === selectedExamType);
        }
        setExams(examsList);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedExam) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/report-cards/exam/${selectedExam}/students`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
        setSelectedStudents([]);
        setSelectAll(false);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSingle = async (studentId: number, rollNumber: string, studentName: string) => {
    setDownloading(studentId);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/report-cards/student/${studentId}/exam/${selectedExam}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Report_Card_${rollNumber}_${studentName.replace(/\s/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`Report card downloaded for ${studentName}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to download report card');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report card');
    } finally {
      setDownloading(null);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setBulkDownloading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/report-cards/exam/${selectedExam}/bulk-download`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ studentIds: selectedStudents })
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Report_Cards_Exam_${selectedExam}_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`${selectedStudents.length} report cards downloaded`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to download report cards');
      }
    } catch (error) {
      console.error('Bulk download error:', error);
      toast.error('Failed to download report cards');
    } finally {
      setBulkDownloading(false);
    }
  };

  const handlePublishToStudent = async (studentId: number) => {
    setPublishing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/report-cards/publish/${studentId}/${selectedExam}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Report card published to student dashboard');
        setStudents(prev => prev.map(s => 
          s.studentId === studentId ? { ...s, isPublished: true } : s
        ));
      } else {
        toast.error(data.message || 'Failed to publish');
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishAll = async () => {
    const studentsToPublish = students.filter(s => s.hasResult && !s.isPublished);
    if (studentsToPublish.length === 0) {
      toast.error('No unpublished report cards to publish');
      return;
    }

    setPublishing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/report-cards/publish-all/${selectedExam}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`${data.publishedCount || studentsToPublish.length} report cards published to student dashboards`);
        setStudents(prev => prev.map(s => 
          s.hasResult ? { ...s, isPublished: true } : s
        ));
      } else {
        toast.error(data.message || 'Failed to publish');
      }
    } catch (error) {
      console.error('Publish all error:', error);
      toast.error('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.filter(s => s.hasResult).map(s => s.studentId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedExamDetails = exams.find(e => e.id.toString() === selectedExam);
  
  const completedCount = students.filter(s => s.hasResult).length;
  const pendingCount = students.length - completedCount;
  const publishedCount = students.filter(s => s.isPublished).length;
  const passCount = students.filter(s => s.hasResult && (s.percentage || 0) >= 35).length;
  const avgPercentage = students.filter(s => s.hasResult).reduce((sum, s) => sum + (s.percentage || 0), 0) / (completedCount || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Animated Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                <h1 className="text-3xl font-bold">Report Cards</h1>
              </div>
              <p className="text-blue-100 text-sm">Generate, download, and publish student report cards instantly</p>
            </div>
            <button 
              onClick={fetchInitialData} 
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && selectedExam && students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-75" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Results Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-75" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Results</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500 opacity-75" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-purple-500 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Published</p>
                  <p className="text-2xl font-bold text-purple-600">{publishedCount}</p>
                </div>
                <Send className="w-8 h-8 text-purple-500 opacity-75" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Percentage</p>
                  <p className="text-2xl font-bold text-indigo-600">{avgPercentage.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-500 opacity-75" />
              </div>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Filter Options</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      📅 {year.year} {year.isActive && '✓'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>🏫 {cls.displayName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select Type</option>
                  {examTypes.map((type) => (
                    <option key={type.id} value={type.id}>📋 {type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  disabled={!selectedClass || !selectedExamType}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">Select Exam</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      📝 {exam.name} - {exam.subject?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {selectedExam && students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <School className="w-5 h-5 text-blue-600" />
                  {selectedExamDetails?.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedExamDetails?.subject?.name} • {new Date(selectedExamDetails?.examDate || '').toLocaleDateString()} • Max Marks: {selectedExamDetails?.maxMarks}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePublishAll}
                  disabled={publishing || students.filter(s => s.hasResult && !s.isPublished).length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {publishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Publish All
                </button>
                <button
                  onClick={handleBulkDownload}
                  disabled={selectedStudents.length === 0 || bulkDownloading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {bulkDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  Download ({selectedStudents.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {selectedExam && students.length > 0 && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
            <input 
              type="text" 
              placeholder="🔍 Search students by name or roll number..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm"
            />
          </div>
        )}

        {/* Students Table */}
        {!selectedExam ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
              <Award className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-gray-500 text-lg">Select filters to generate report cards</p>
            <p className="text-sm text-gray-400 mt-1">Choose academic year, class, exam type, and exam</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mb-4">
              <FileText className="w-10 h-10 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-lg">No students found for this exam</p>
            <p className="text-sm text-gray-400 mt-1">Make sure students are assigned to this class</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-5 py-4 text-center w-12">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">Marks</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">Grade</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">Published</th>
                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedStudents.map((student, idx) => (
                    <tr key={student.studentId} className="hover:bg-blue-50/30 transition-all duration-200">
                      <td className="px-5 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.studentId)}
                          onChange={() => handleSelectStudent(student.studentId)}
                          disabled={!student.hasResult}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-medium text-gray-700">#{student.rollNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {student.studentName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{student.studentName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {student.hasResult ? (
                          <span className={`font-bold ${(student.marksObtained || 0) >= 35 ? 'text-green-600' : 'text-red-600'}`}>
                            {student.marksObtained}
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center justify-center gap-1">
                            <AlertCircle size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {student.hasResult ? (
                          <div className="inline-flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                                style={{ width: `${student.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{student.percentage}%</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {student.hasResult ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                            student.grade === 'A+' ? 'bg-green-100 text-green-700' :
                            student.grade === 'A' ? 'bg-blue-100 text-blue-700' :
                            student.grade === 'B' ? 'bg-yellow-100 text-yellow-700' :
                            student.grade === 'C' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Award size={12} />
                            {student.grade}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {student.hasResult ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            <CheckCircle size={12} />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                            <AlertCircle size={12} />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {student.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                            <Send size={12} />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownloadSingle(student.studentId, student.rollNumber, student.studentName)}
                            disabled={!student.hasResult || downloading === student.studentId}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 disabled:opacity-50 group"
                            title="Download Report Card"
                          >
                            {downloading === student.studentId ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Download size={16} className="group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                          <button
                            onClick={() => handlePublishToStudent(student.studentId)}
                            disabled={!student.hasResult || student.isPublished || publishing}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-200 disabled:opacity-50 group"
                            title="Publish to Student"
                          >
                            <Send size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-5 border-t bg-gray-50">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportCards;