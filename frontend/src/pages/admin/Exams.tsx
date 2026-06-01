import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, X, RefreshCw,
  School, BookOpen, Calendar, TrendingUp, Users,
  Loader2, Lock, Unlock, FileText,
  ChevronLeft, ChevronRight, BarChart3, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import CreateExamModal from '../../components/admin/CreateExamModal';
import ExamResultsModal from '../../components/admin/ExamResultsModal';

interface ExamType {
  id: number;
  name: string;
  description?: string;
  weightage: number;
  isActive: boolean;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Class {
  id: number;
  name: string;
  section: string;
  displayName: string;
}

interface Exam {
  id: number;
  name: string;
  examTypeId: number;
  examType: ExamType;
  classId: number;
  class: Class;
  subjectId: number;
  subject: Subject;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  description?: string;
  isLocked: boolean;
  academicYearId: number;
}

interface ExamResult {
  studentId: number;
  rollNumber: string;
  studentName: string;
  marksObtained: number;
  percentage: number;
  grade: string;
  remark?: string;
  rank: number;
}

interface ExamAnalytics {
  totalStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
}

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

const AdminExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [examAnalytics, setExamAnalytics] = useState<ExamAnalytics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterExams();
  }, [searchTerm, selectedClass, selectedExamType, selectedAcademicYear, exams]);

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
      if (classesData.success) setClasses(classesData.data || []);
      
      const subjectsRes = await fetch('http://localhost:3000/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjectsData = await subjectsRes.json();
      if (subjectsData.success) setSubjects(subjectsData.data || []);
      
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAcademicYear && classes.length > 0) {
      fetchExams();
    }
  }, [selectedAcademicYear, classes]);

  const fetchExams = async () => {
    if (!selectedAcademicYear) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const allExams: Exam[] = [];
      
      for (const cls of classes) {
        const response = await fetch(
          `http://localhost:3000/api/exams/class/${cls.id}?academicYearId=${selectedAcademicYear}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await response.json();
        if (data.success && data.data) {
          allExams.push(...data.data);
        }
      }
      
      setExams(allExams);
      setFilteredExams(allExams);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async (examId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${examId}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setExamResults(data.data.results || []);
        setExamAnalytics(data.data.analytics || null);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load exam results');
    }
  };

  const handleLockExam = async (exam: Exam) => {
    if (!confirm(`Lock "${exam.name}"? Once locked, marks cannot be edited.`)) return;
    
    setActionLoading(exam.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${exam.id}/lock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Exam locked successfully');
        fetchExams();
      } else {
        toast.error(data.message || 'Failed to lock exam');
      }
    } catch (error) {
      toast.error('Failed to lock exam');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlockExam = async (exam: Exam) => {
    if (!confirm(`Unlock "${exam.name}"? Teachers can edit marks again.`)) return;
    
    setActionLoading(exam.id);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${exam.id}/unlock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Exam unlocked successfully');
        fetchExams();
      } else {
        toast.error(data.message || 'Failed to unlock exam');
      }
    } catch (error) {
      toast.error('Failed to unlock exam');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewResults = async (exam: Exam) => {
    setSelectedExam(exam);
    await fetchExamResults(exam.id);
    setShowResultsModal(true);
  };

  const filterExams = () => {
    let filtered = [...exams];
    
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.class.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.examType.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedClass) {
      filtered = filtered.filter(exam => exam.classId.toString() === selectedClass);
    }
    
    if (selectedExamType) {
      filtered = filtered.filter(exam => exam.examTypeId.toString() === selectedExamType);
    }
    
    setFilteredExams(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedExamType('');
  };

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (isLocked: boolean) => {
    if (isLocked) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 flex items-center gap-1 w-fit"><Lock size={10} /> Locked</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 flex items-center gap-1 w-fit"><Unlock size={10} /> Open</span>;
  };

  const stats = [
    { title: 'Total Exams', value: exams.length, icon: <FileText size={20} />, color: 'bg-blue-500' },
    { title: 'Open Exams', value: exams.filter(e => !e.isLocked).length, icon: <Unlock size={20} />, color: 'bg-green-500' },
    { title: 'Locked Exams', value: exams.filter(e => e.isLocked).length, icon: <Lock size={20} />, color: 'bg-red-500' },
    { title: 'Exam Types', value: examTypes.length, icon: <Award size={20} />, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Exam Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage exams, view results, and control exam locking</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={18} />
              Create Exam
            </button>
            <button 
              onClick={fetchExams} 
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 text-white shadow-sm`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-80">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-white/20 rounded-full p-2">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} {year.isActive && '(Active)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Types</option>
                {examTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search exams..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          {(selectedClass || selectedExamType || searchTerm) && (
            <div className="mt-3 flex justify-end">
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <X size={14} /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <FileText size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No exams found</p>
            <button onClick={() => setShowCreateModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Exam
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Exam Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Marks</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExams.map((exam) => (
                      <tr key={exam.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">{exam.name}</p>
                            <p className="text-xs text-gray-500">{exam.examType?.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <School size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{exam.class?.displayName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{exam.subject?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{new Date(exam.examDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm font-medium">{exam.maxMarks}</p>
                          <p className="text-xs text-gray-500">Pass: {exam.passingMarks}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(exam.isLocked)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewResults(exam)} 
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Results"
                            >
                              <BarChart3 size={16} />
                            </button>
                            {!exam.isLocked ? (
                              <button 
                                onClick={() => handleLockExam(exam)} 
                                disabled={actionLoading === exam.id}
                                className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition disabled:opacity-50" 
                                title="Lock Exam"
                              >
                                {actionLoading === exam.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUnlockExam(exam)} 
                                disabled={actionLoading === exam.id}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50" 
                                title="Unlock Exam"
                              >
                                {actionLoading === exam.id ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <CreateExamModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchExams}
          examTypes={examTypes}
          classes={classes}
          subjects={subjects}
        />
      )}

      {/* Exam Results Modal */}
      {showResultsModal && selectedExam && (
        <ExamResultsModal 
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          exam={selectedExam}
          results={examResults}
          analytics={examAnalytics}
        />
      )}
    </div>
  );
};

export default AdminExams;