// src/pages/teacher/AttendanceReports.tsx

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Download, TrendingUp, Users, 
  School, Loader2, FileText, AlertCircle, 
  BarChart3, Sparkles, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Class {
  id: number;
  name: string;
  section: string;
  displayName: string;
}

interface DailySummary {
  total: number;
  present: number;
  absent: number;
}

interface AttendanceReport {
  classId: number;
  month: number;
  year: number;
  classPercentage: number;
  dailySummary: Record<string, DailySummary>;
  totalRecords: number;
  holidays: Array<{ date: string; name: string }>;
}

const TeacherAttendanceReports: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    fetchMyClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchReport();
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const fetchMyClasses = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/teacher-assignments/my-classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Classes API Response:', data);
      
      if (data.success) {
        let classList = [];
        
        if (data.data?.classes) {
          classList = data.data.classes;
        } else if (Array.isArray(data.data)) {
          classList = data.data;
        } else if (Array.isArray(data)) {
          classList = data;
        }
        
        // Get UNIQUE classes by ID (remove duplicates from multiple subjects)
        const uniqueClassesMap = new Map();
        for (const cls of classList) {
          const classId = cls.id || cls.classId;
          if (!uniqueClassesMap.has(classId)) {
            uniqueClassesMap.set(classId, {
              id: classId,
              name: cls.name || cls.className,
              section: cls.section,
              displayName: cls.displayName || `${cls.name || cls.className} ${cls.section || ''}`
            });
          }
        }
        
        const formattedClasses = Array.from(uniqueClassesMap.values());
        
        console.log('Unique classes:', formattedClasses);
        setClasses(formattedClasses);
        
        if (formattedClasses.length > 0 && formattedClasses[0]?.id) {
          setSelectedClass(formattedClasses[0].id.toString());
        }
      } else {
        setError(data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setError('Failed to load classes. Please try again.');
      toast.error('Failed to load classes');
    }
  };

  const fetchReport = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/attendance/class/${selectedClass}/report?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      console.log('Report API Response:', data);
      
      if (data.success) {
        setReport(data.data);
      } else {
        setError(data.message || 'Failed to fetch report');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setError('Failed to load report');
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const downloadMonthlyReport = async () => {
    if (!selectedClass) return;
    
    setDownloading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/attendance/class/${selectedClass}/download-monthly?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_report_${selectedClass}_${selectedMonth}_${selectedYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Report downloaded successfully');
      } else {
        toast.error('Failed to download report');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const downloadYearlyReport = async () => {
    if (!selectedClass) return;
    
    setDownloading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/attendance/class/${selectedClass}/download-yearly?year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_yearly_${selectedClass}_${selectedYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Yearly report downloaded successfully');
      } else {
        toast.error('Failed to download yearly report');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download yearly report');
    } finally {
      setDownloading(false);
    }
  };

  const getSelectedClassDetails = () => {
    return classes.find(c => c.id.toString() === selectedClass);
  };

  const classDetails = getSelectedClassDetails();

  const calculateStats = () => {
    if (!report || !report.dailySummary) {
      return { totalPresent: 0, totalAbsent: 0, totalDays: 0 };
    }
    
    const days = Object.values(report.dailySummary);
    const totalPresent = days.reduce((sum, day) => sum + day.present, 0);
    const totalAbsent = days.reduce((sum, day) => sum + day.absent, 0);
    const totalDays = days.length;
    
    return { totalPresent, totalAbsent, totalDays };
  };

  const stats = calculateStats();

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700';
    if (percentage >= 75) return 'bg-blue-100 text-blue-700';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (error && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Classes</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={fetchMyClasses} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <School size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Classes Assigned</h2>
          <p className="text-gray-500">You don't have any classes assigned yet.</p>
          <Link to="/my-classes" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            Go to My Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} className="text-yellow-300" />
                  <span className="text-sm font-medium">Attendance Analytics</span>
                </div>
                <h1 className="text-3xl font-bold">Attendance Reports</h1>
                <p className="text-blue-100 mt-2">View and download attendance reports</p>
              </div>
              <Link to="/dashboard" className="bg-white/20 backdrop-blur rounded-full p-3 hover:bg-white/30 transition-all duration-300 hover:scale-110">
                <BarChart3 size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={downloadMonthlyReport}
                disabled={downloading || !selectedClass}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Monthly PDF
              </button>
              <button
                onClick={downloadYearlyReport}
                disabled={downloading || !selectedClass}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                Yearly PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-2xl shadow-lg">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : !selectedClass ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border">
            <School size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Select a class to view attendance report</p>
          </div>
        ) : !report ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border">
            <AlertCircle size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No attendance data found for {months[selectedMonth - 1]} {selectedYear}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Working Days</p>
                    <p className="text-3xl font-bold text-blue-700">{stats.totalDays}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={22} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Present</p>
                    <p className="text-3xl font-bold text-green-700">{stats.totalPresent}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={22} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Absent</p>
                    <p className="text-3xl font-bold text-red-700">{stats.totalAbsent}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle size={22} className="text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Class Average</p>
                    <p className="text-3xl font-bold text-purple-700">{report.classPercentage.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp size={22} className="text-purple-600" />
                  </div>
                </div>
                <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${report.classPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Class Info */}
            <div className="bg-white rounded-2xl shadow-lg border p-5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{classDetails?.displayName}</h2>
                  <p className="text-gray-500 text-sm">
                    {months[report.month - 1]} {report.year} • {stats.totalDays} working days • {report.holidays?.length || 0} holidays
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Overall Attendance</p>
                  <p className={`text-2xl font-bold ${getAttendanceColor(report.classPercentage)}`}>
                    {report.classPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Holidays List */}
            {report.holidays && report.holidays.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border p-5">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Holidays in this period
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.holidays.map((holiday, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
                      {holiday.date}: {holiday.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Summary Table */}
            {Object.keys(report.dailySummary).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Daily Attendance Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Total Students</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-green-600">Present</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-red-600">Absent</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(report.dailySummary)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .map(([date, summary]) => {
                          const percentage = summary.total > 0 ? (summary.present / summary.total) * 100 : 0;
                          return (
                            <tr key={date} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3 text-sm text-gray-600">{date}</td>
                              <td className="px-6 py-3 text-center text-sm text-gray-600">{summary.total}</td>
                              <td className="px-6 py-3 text-center text-sm font-medium text-green-600">{summary.present}</td>
                              <td className="px-6 py-3 text-center text-sm font-medium text-red-600">{summary.absent}</td>
                              <td className="px-6 py-3 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceBadge(percentage)}`}>
                                  {percentage.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendanceReports;