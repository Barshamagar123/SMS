import React, { useEffect, useState } from 'react';
import { 
  Search, Eye, X, RefreshCw, Download,
  School, BookOpen, Calendar, TrendingUp, Users,
  Loader2, FileText, ChevronLeft, ChevronRight,
  Award, Filter, BarChart3, CheckCircle, XCircle,
  Crown, Medal, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ExamType {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Class {
  id: number;
  displayName: string;
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
  examType: ExamType;
  subjectId: number;
  subject: Subject;
  examDate: string;
  maxMarks: number;
  passingMarks: number;
  isLocked: boolean;
}

interface ExamResult {
  studentId: number;
  rollNumber: string;
  studentName: string;
  marksObtained: number;
  percentage: number;
  grade: string;
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

const AdminResults: React.FC = () => {
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [examAnalytics, setExamAnalytics] = useState<ExamAnalytics | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
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
    filterExams();
  }, [searchTerm, exams]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch academic years
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
      
      // Fetch exam types
      const typesRes = await fetch('http://localhost:3000/api/exams/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const typesData = await typesRes.json();
      if (typesData.success) setExamTypes(typesData.data || []);
      
      // Fetch classes
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
      
      // Fetch subjects
      const subjectsRes = await fetch('http://localhost:3000/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjectsData = await subjectsRes.json();
      if (subjectsData.success) setSubjects(subjectsData.data || []);
      
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
        setFilteredExams(examsList);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async (exam: Exam) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/exams/${exam.id}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setExamResults(data.data.results || []);
        setExamAnalytics(data.data.analytics || null);
        setSelectedExam(exam);
        setShowResultsModal(true);
      } else {
        toast.error(data.message || 'Failed to fetch results');
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load exam results');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    if (searchTerm.trim() === '') {
      setFilteredExams(exams);
    } else {
      const filtered = exams.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExams(filtered);
    }
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-700';
      case 'A': return 'bg-blue-100 text-blue-700';
      case 'B': return 'bg-yellow-100 text-yellow-700';
      case 'C': return 'bg-orange-100 text-orange-700';
      case 'D': return 'bg-purple-100 text-purple-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={16} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={16} className="text-gray-400" />;
    if (rank === 3) return <Medal size={16} className="text-orange-500" />;
    return null;
  };

  const ResultsModal = () => {
    if (!showResultsModal || !selectedExam) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowResultsModal(false)}>
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Exam Results</h2>
                <p className="text-blue-100 text-sm">
                  {selectedExam.name} - {selectedExam.subject.name}
                </p>
                <p className="text-blue-100 text-xs mt-1">
                  Exam Date: {new Date(selectedExam.examDate).toLocaleDateString()} | 
                  Max Marks: {selectedExam.maxMarks} | 
                  Passing: {selectedExam.passingMarks}
                </p>
              </div>
              <button onClick={() => setShowResultsModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Analytics Cards */}
            {examAnalytics && examResults.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={16} className="text-blue-600" />
                      <p className="text-xs text-gray-500">Total Students</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{examAnalytics.totalStudents}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={16} className="text-green-600" />
                      <p className="text-xs text-gray-500">Average Marks</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{examAnalytics.averageMarks}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Award size={16} className="text-purple-600" />
                      <p className="text-xs text-gray-500">Pass Percentage</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{examAnalytics.passPercentage}%</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Award size={16} className="text-yellow-600" />
                      <p className="text-xs text-gray-500">Highest Marks</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{examAnalytics.highestMarks}</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-sm">Pass: <strong>{examAnalytics.passCount}</strong> students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle size={18} className="text-red-600" />
                    <span className="text-sm">Fail: <strong>{examAnalytics.failCount}</strong> students</span>
                  </div>
                </div>
              </>
            )}

            {/* Results Table */}
            {examResults.length === 0 ? (
              <div className="text-center py-10 bg-yellow-50 rounded-xl">
                <p className="text-yellow-800">No results available for this exam yet.</p>
                <p className="text-yellow-600 text-sm mt-1">Teachers need to enter marks first.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Roll No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Marks</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Percentage</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examResults.map((result) => (
                      <tr key={result.studentId} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {getRankIcon(result.rank)}
                            <span className="font-bold">#{result.rank}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{result.rollNumber}</td>
                        <td className="px-4 py-3 font-medium">{result.studentName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${result.marksObtained >= selectedExam.passingMarks ? 'text-green-600' : 'text-red-600'}`}>
                            {result.marksObtained}/{selectedExam.maxMarks}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{result.percentage}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { title: 'Total Exams', value: exams.length, icon: <FileText size={20} />, color: 'bg-blue-500' },
    { title: 'Subjects', value: subjects.length, icon: <BookOpen size={20} />, color: 'bg-green-500' },
    { title: 'Classes', value: classes.length, icon: <School size={20} />, color: 'bg-purple-500' },
    { title: 'Exam Types', value: examTypes.length, icon: <Award size={20} />, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>
            <p className="text-gray-500 text-sm mt-1">View results for all exams across classes</p>
          </div>
          <button 
            onClick={fetchInitialData} 
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 text-white`}>
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

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Year</option>
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Class</option>
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">
                <X size={14} className="inline mr-1" /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Exams Table */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : !selectedClass || !selectedAcademicYear ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <Filter size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Select Academic Year and Class to view exams</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <FileText size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No exams found for selected filters</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Exam Name</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Exam Date</th>
                    <th className="px-4 py-3 text-center">Max Marks</th>
                    <th className="px-4 py-3 text-center">Passing</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExams.map((exam) => (
                    <tr key={exam.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-xs text-gray-500">{exam.examType?.name}</p>
                      </td>
                      <td className="px-4 py-3">{exam.subject?.name}</td>
                      <td className="px-4 py-3">{new Date(exam.examDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">{exam.maxMarks}</td>
                      <td className="px-4 py-3 text-center">{exam.passingMarks}</td>
                      <td className="px-4 py-3 text-center">
                        {exam.isLocked ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Locked</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Open</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => fetchExamResults(exam)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Results"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Results Modal */}
      <ResultsModal />
    </div>
  );
};

export default AdminResults;