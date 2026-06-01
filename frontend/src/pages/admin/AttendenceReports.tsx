import React, { useEffect, useState } from 'react';
import { 
  Calendar, Download, Search, ChevronLeft, ChevronRight,
  School, Users, TrendingUp, AlertCircle, FileText,
  Loader2, Printer, RefreshCw, Eye, X
} from 'lucide-react';
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

const AdminAttendanceReports: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchReport();
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchReport = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/attendance/class/${selectedClass}/report?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch report');
        setReport(null);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('Failed to load attendance report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (type: 'monthly' | 'yearly') => {
    if (!selectedClass) return;
    
    setDownloading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let url = '';
      
      if (type === 'monthly') {
        url = `http://localhost:3000/api/attendance/class/${selectedClass}/download-monthly?month=${selectedMonth}&year=${selectedYear}`;
      } else {
        url = `http://localhost:3000/api/attendance/class/${selectedClass}/download-yearly?year=${selectedYear}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url_blob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url_blob;
        link.download = `attendance_${type}_${selectedYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url_blob);
        toast.success('Report downloaded successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to download report');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const getSelectedClassDetails = () => {
    return classes.find(c => c.id.toString() === selectedClass);
  };

  const classDetails = getSelectedClassDetails();

  // Calculate summary from dailySummary
  const getSummaryStats = () => {
    if (!report || !report.dailySummary) {
      return { totalPresent: 0, totalAbsent: 0, totalDays: 0 };
    }
    
    const days = Object.values(report.dailySummary);
    const totalPresent = days.reduce((sum, day) => sum + day.present, 0);
    const totalAbsent = days.reduce((sum, day) => sum + day.absent, 0);
    const totalDays = days.length;
    
    return { totalPresent, totalAbsent, totalDays };
  };

  const stats = [
    { 
      title: 'Working Days', 
      value: report ? Object.keys(report.dailySummary || {}).length : 0, 
      icon: <Calendar size={20} />, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Total Present', 
      value: getSummaryStats().totalPresent, 
      icon: <Users size={20} />, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Total Absent', 
      value: getSummaryStats().totalAbsent, 
      icon: <AlertCircle size={20} />, 
      color: 'bg-red-500' 
    },
    { 
      title: 'Attendance %', 
      value: `${report?.classPercentage || 0}%`, 
      icon: <TrendingUp size={20} />, 
      color: 'bg-purple-500' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
            <p className="text-gray-500 text-sm mt-1">View and download attendance reports by class</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleDownloadPDF('monthly')}
              disabled={!selectedClass || downloading || !report}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Monthly Report
            </button>
            <button
              onClick={() => handleDownloadPDF('yearly')}
              disabled={!selectedClass || downloading || !report}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              Yearly Report
            </button>
            <button
              onClick={fetchReport}
              disabled={!selectedClass}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setReport(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {report && (
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
        )}

        {/* Report Content */}
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-xl">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        ) : !selectedClass ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <School size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Select a class to view attendance report</p>
          </div>
        ) : !report ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <AlertCircle size={64} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No attendance data found for {months[selectedMonth - 1]} {selectedYear}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Class Info */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {classDetails?.displayName || `Class ${selectedClass}`}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {months[report.month - 1]} {report.year} • Total Records: {report.totalRecords}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Overall Attendance</p>
                  <p className={`text-2xl font-bold ${report.classPercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {report.classPercentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* Holidays List */}
            {report.holidays && report.holidays.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Holidays in this period
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.holidays.map((holiday, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {holiday.date}: {holiday.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Summary Section */}
            {report.dailySummary && Object.keys(report.dailySummary).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Daily Attendance Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Total Students</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-green-600">Present</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-red-600">Absent</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.dailySummary)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .map(([date, summary]) => {
                          const percentage = summary.total > 0 ? (summary.present / summary.total) * 100 : 0;
                          return (
                            <tr key={date} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-600">{date}</td>
                              <td className="px-4 py-2 text-center text-sm text-gray-600">{summary.total}</td>
                              <td className="px-4 py-2 text-center text-sm text-green-600 font-medium">{summary.present}</td>
                              <td className="px-4 py-2 text-center text-sm text-red-600">{summary.absent}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  percentage >= 75 ? 'bg-green-100 text-green-700' : 
                                  percentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
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

            {Object.keys(report.dailySummary || {}).length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border">
                <p className="text-gray-500">No attendance records found for this period</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceReports;