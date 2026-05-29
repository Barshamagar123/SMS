import React, { useEffect, useState } from 'react';
import { authApi, attendanceApi } from '../../api/api';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendance: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await authApi.getAllUsers();
        const students = users.data.data.filter((u: any) => u.role === 'STUDENT');
        const teachers = users.data.data.filter((u: any) => u.role === 'TEACHER');
        
        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalClasses: 5,
          todayAttendance: 92.5,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, color: 'bg-blue-500', icon: '👨‍🎓' },
    { title: 'Total Teachers', value: stats.totalTeachers, color: 'bg-green-500', icon: '👩‍🏫' },
    { title: 'Total Classes', value: stats.totalClasses, color: 'bg-purple-500', icon: '🏫' },
    { title: 'Today\'s Attendance', value: `${stats.todayAttendance}%`, color: 'bg-yellow-500', icon: '📊' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.color} rounded-lg shadow-md p-6 text-white`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Students">
          <p className="text-gray-500">Student list will appear here</p>
        </Card>
        
        <Card title="Recent Teachers">
          <p className="text-gray-500">Teacher list will appear here</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;