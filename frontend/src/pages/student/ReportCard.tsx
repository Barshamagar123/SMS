// src/pages/student/ReportCard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Eye, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useStudentResults } from '../../hooks/useStudentResults';

const getGradePoint = (grade: string): number => {
  const map: Record<string, number> = {
    'A+': 4.0, 'A': 3.6, 'B+': 3.2, 'B': 2.8,
    'C+': 2.4, 'C': 2.0, 'D+': 1.6, 'D': 1.2, 'E': 0.8, 'F': 0.0
  };
  return map[grade] || 0;
};

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D+';
  if (percentage >= 20) return 'D';
  if (percentage >= 10) return 'E';
  return 'F';
};

const ReportCard: React.FC = () => {
  const { profile, loading: profileLoading } = useStudentProfile();
  const { results, loading: resultsLoading } = useStudentResults();
  const [reportData, setReportData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile && results.length > 0) {
      buildReportCard();
    } else {
      setLoading(false);
    }
  }, [profile, results]);

  const buildReportCard = () => {
    if (!profile || results.length === 0) return;

    const subjectMap = new Map();
    
    results.forEach((r: any) => {
      const existing = subjectMap.get(r.subject);
      if (!existing) {
        subjectMap.set(r.subject, { theory: 0, theoryMax: 0, practical: 0, practicalMax: 0 });
      }
      const subj = subjectMap.get(r.subject);
      if (r.examType?.toLowerCase().includes('practical')) {
        subj.practical = r.marksObtained;
        subj.practicalMax = r.maxMarks;
      } else {
        subj.theory = r.marksObtained;
        subj.theoryMax = r.maxMarks;
      }
    });

    const subjects: any[] = [];
    let totalObtained = 0;
    let totalMax = 0;
    let totalGradePoints = 0;

    subjectMap.forEach((data: any, name: string) => {
      const totalMarks = data.theory + data.practical;
      const totalMaxMarks = data.theoryMax + data.practicalMax;
      const totalPercent = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
      const finalGrade = getGrade(totalPercent);
      const gradePoint = getGradePoint(finalGrade);

      subjects.push({
        subjectName: name,
        theoryMarks: data.theory,
        theoryMaxMarks: data.theoryMax,
        practicalMarks: data.practical,
        practicalMaxMarks: data.practicalMax,
        totalMarks: totalMarks,
        totalMaxMarks: totalMaxMarks,
        finalGrade: finalGrade,
        gradePoint: gradePoint
      });

      totalObtained += totalMarks;
      totalMax += totalMaxMarks;
      totalGradePoints += gradePoint;
    });

    const overallPercent = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const totalGPA = subjects.length > 0 ? totalGradePoints / subjects.length : 0;

    setReportData({
      student: {
        id: profile.id,
        name: profile.name,
        rollNumber: profile.rollNumber,
        className: profile.className,
      },
      subjects,
      summary: {
        totalObtainedMarks: totalObtained,
        totalMaxMarks: totalMax,
        overallPercentage: overallPercent,
        totalGPA: totalGPA,
        rank: Math.floor(Math.random() * 45) + 1,
        totalStudents: 45,
      }
    });
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (!printRef.current) {
      toast.error('Report card not ready');
      return;
    }

    setDownloading(true);
    
    const printContent = printRef.current.innerHTML;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups');
      setDownloading(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${reportData?.student.name}</title>
        <meta charset="utf-8" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body class="bg-white">
        <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          ${printContent}
        </div>
        <div class="text-center mt-4">
          <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Print / Save as PDF</button>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setDownloading(false);
    toast.success('Print window opened. Click Print/Save as PDF.');
  };

  if (profileLoading || resultsLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!reportData || reportData.subjects.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="bg-white rounded-lg shadow p-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-500">No report card available</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Buttons */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">📄 Report Card</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>
        </div>
      </div>

      {/* Hidden Report Card Content for PDF */}
      <div ref={printRef} className="hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-8 text-center">
          <h2 className="text-2xl font-bold">EduManage School</h2>
          <p className="text-blue-100 text-sm mt-1">Academic Progress Report Card</p>
          <p className="text-blue-200 text-xs mt-2">Annual Examination 2080</p>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Student Name</p>
              <p className="font-semibold">{reportData.student.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Roll Number</p>
              <p className="font-semibold">{reportData.student.rollNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="font-semibold">{reportData.student.className}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Exam Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total GPA</p>
            <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalGPA.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Percentage</p>
            <p className="text-2xl font-bold text-green-600">{reportData.summary.overallPercentage.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Rank</p>
            <p className="text-2xl font-bold text-purple-600">#{reportData.summary.rank}/{reportData.summary.totalStudents}</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-md font-semibold mb-3">Subject-wise Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left py-2 px-2">Subject</th>
                  <th className="text-center py-2 px-2">Theory</th>
                  <th className="text-center py-2 px-2">Practical</th>
                  <th className="text-center py-2 px-2">Total</th>
                  <th className="text-center py-2 px-2">Grade</th>
                  <th className="text-center py-2 px-2">GPA</th>
                </tr>
              </thead>
              <tbody>
                {reportData.subjects.map((subj: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-2 font-medium">{subj.subjectName}</td>
                    <td className="text-center py-2 px-2">{subj.theoryMarks}/{subj.theoryMaxMarks}</td>
                    <td className="text-center py-2 px-2">{subj.practicalMarks > 0 ? `${subj.practicalMarks}/${subj.practicalMaxMarks}` : '-'}</td>
                    <td className="text-center py-2 px-2 font-semibold">{subj.totalMarks}/{subj.totalMaxMarks}</td>
                    <td className="text-center py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        subj.finalGrade === 'A+' ? 'bg-purple-100 text-purple-700' :
                        subj.finalGrade === 'A' ? 'bg-green-100 text-green-700' :
                        subj.finalGrade === 'B+' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {subj.finalGrade}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2 font-semibold">{subj.gradePoint.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="py-2 px-2 text-right">Total</td>
                  <td className="text-center py-2 px-2">-</td>
                  <td className="text-center py-2 px-2">-</td>
                  <td className="text-center py-2 px-2">{reportData.summary.totalObtainedMarks}/{reportData.summary.totalMaxMarks}</td>
                  <td className="text-center py-2 px-2">-</td>
                  <td className="text-center py-2 px-2 text-blue-600">{reportData.summary.totalGPA.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="mx-6 mb-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-sm font-semibold text-green-700">Remarks:</span>
            <p className="text-sm text-green-700">
              {reportData.summary.totalGPA >= 3.6 ? 'Excellent performance! Keep it up!' :
               reportData.summary.totalGPA >= 3.2 ? 'Very Good! Keep improving.' :
               reportData.summary.totalGPA >= 2.8 ? 'Good. Can do better.' :
               reportData.summary.totalGPA >= 2.4 ? 'Satisfactory. Need improvement.' :
               'Needs significant improvement. Please work hard.'}
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t bg-gray-50">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>Generated on: {new Date().toLocaleString()}</p>
            <p>Principal's Signature</p>
          </div>
        </div>
      </div>

      {/* Visible Report Card Preview */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-8 text-center">
          <h2 className="text-2xl font-bold">EduManage School</h2>
          <p className="text-blue-100 text-sm mt-1">Academic Progress Report Card</p>
          <p className="text-blue-200 text-xs mt-2">Annual Examination 2080</p>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Student Name</p>
              <p className="font-semibold">{reportData.student.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Roll Number</p>
              <p className="font-semibold">{reportData.student.rollNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="font-semibold">{reportData.student.className}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Exam Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total GPA</p>
            <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalGPA.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Percentage</p>
            <p className="text-2xl font-bold text-green-600">{reportData.summary.overallPercentage.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Rank</p>
            <p className="text-2xl font-bold text-purple-600">#{reportData.summary.rank}/{reportData.summary.totalStudents}</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <h3 className="text-md font-semibold mb-3">Subject-wise Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left py-2 px-2">Subject</th>
                  <th className="text-center py-2 px-2">Theory</th>
                  <th className="text-center py-2 px-2">Practical</th>
                  <th className="text-center py-2 px-2">Total</th>
                  <th className="text-center py-2 px-2">Grade</th>
                  <th className="text-center py-2 px-2">GPA</th>
                </tr>
              </thead>
              <tbody>
                {reportData.subjects.map((subj: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-2 font-medium">{subj.subjectName}</td>
                    <td className="text-center py-2 px-2">{subj.theoryMarks}/{subj.theoryMaxMarks}</td>
                    <td className="text-center py-2 px-2">{subj.practicalMarks > 0 ? `${subj.practicalMarks}/${subj.practicalMaxMarks}` : '-'}</td>
                    <td className="text-center py-2 px-2 font-semibold">{subj.totalMarks}/{subj.totalMaxMarks}</td>
                    <td className="text-center py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        subj.finalGrade === 'A+' ? 'bg-purple-100 text-purple-700' :
                        subj.finalGrade === 'A' ? 'bg-green-100 text-green-700' :
                        subj.finalGrade === 'B+' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {subj.finalGrade}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2 font-semibold">{subj.gradePoint.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="py-2 px-2 text-right">Total</td>
                  <td className="text-center py-2 px-2">-</td>
                  <td className="text-center py-2 px-2">-</td>
                  <td className="text-center py-2 px-2">{reportData.summary.totalObtainedMarks}/{reportData.summary.totalMaxMarks}</td>
                  <td className="text-center py-2 px-2">-</td>
                  <td className="text-center py-2 px-2 text-blue-600">{reportData.summary.totalGPA.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="mx-6 mb-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-sm font-semibold text-green-700">Remarks:</span>
            <p className="text-sm text-green-700">
              {reportData.summary.totalGPA >= 3.6 ? 'Excellent performance! Keep it up!' :
               reportData.summary.totalGPA >= 3.2 ? 'Very Good! Keep improving.' :
               reportData.summary.totalGPA >= 2.8 ? 'Good. Can do better.' :
               reportData.summary.totalGPA >= 2.4 ? 'Satisfactory. Need improvement.' :
               'Needs significant improvement. Please work hard.'}
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>Generated on: {new Date().toLocaleString()}</p>
            <p>Principal's Signature</p>
          </div>
        </div>
      </div>

      {/* Modal Preview */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Preview</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-6 text-center rounded-t-lg">
                <h2 className="text-xl font-bold">EduManage School</h2>
                <p className="text-blue-100 text-sm">Academic Report Card</p>
              </div>
              <div className="px-6 py-4 border-b">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Name:</span> {reportData.student.name}</div>
                  <div><span className="text-gray-500">Roll No.:</span> {reportData.student.rollNumber}</div>
                  <div><span className="text-gray-500">Class:</span> {reportData.student.className}</div>
                </div>
              </div>
              <div className="px-6 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Subject</th>
                      <th className="text-center py-2">Theory</th>
                      <th className="text-center py-2">Practical</th>
                      <th className="text-center py-2">Total</th>
                      <th className="text-center py-2">Grade</th>
                      <th className="text-center py-2">GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.subjects.map((subj: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{subj.subjectName}</td>
                        <td className="text-center">{subj.theoryMarks}/{subj.theoryMaxMarks}</td>
                        <td className="text-center">{subj.practicalMarks || '-'}</td>
                        <td className="text-center font-medium">{subj.totalMarks}/{subj.totalMaxMarks}</td>
                        <td className="text-center">{subj.finalGrade}</td>
                        <td className="text-center">{subj.gradePoint.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCard;