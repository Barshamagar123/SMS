// src/utils/studentHelpers.ts

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getPerformanceColor = (percentage: number): string => {
  if (percentage >= 85) return 'text-green-600 bg-green-100';
  if (percentage >= 70) return 'text-blue-600 bg-blue-100';
  if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

export const getGradeColor = (grade: string): string => {
  const colors: Record<string, string> = {
    'A+': 'text-purple-600 bg-purple-100',
    'A': 'text-green-600 bg-green-100',
    'B': 'text-blue-600 bg-blue-100',
    'C': 'text-yellow-600 bg-yellow-100',
    'D': 'text-orange-600 bg-orange-100',
    'F': 'text-red-600 bg-red-100',
  };
  return colors[grade] || 'text-gray-600 bg-gray-100';
};

export const getStatusBadge = (status: string): string => {
  const styles: Record<string, string> = {
    'PRESENT': 'bg-green-100 text-green-700',
    'ABSENT': 'bg-red-100 text-red-700',
    'LATE': 'bg-yellow-100 text-yellow-700',
    'EXCUSED': 'bg-blue-100 text-blue-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
};

export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    'PRESENT': 'Present',
    'ABSENT': 'Absent',
    'LATE': 'Late',
    'EXCUSED': 'Excused',
  };
  return texts[status] || status;
};

export const calculatePercentage = (obtained: number, total: number): number => {
  if (total === 0) return 0;
  return (obtained / total) * 100;
};