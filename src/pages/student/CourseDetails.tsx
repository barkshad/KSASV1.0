import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, QrCode, CheckCircle, Clock, XCircle, Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import { getCurrentUser } from '../../lib/auth';
import { getSession, getAttendanceRecords, getEnrollmentsByCourse } from '../../lib/db';

export default function CourseDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0, total: 0, rate: 85 });
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();
  const courseId = (location.state as any)?.courseId || 'default';

  useEffect(() => {
    async function loadData() {
      if (!user?.uid || !courseId) {
        setLoading(false);
        return;
      }
      try {
        // In real app, fetch course by ID
        // For now, use mock data enriched with real attendance
        const mockCourse = {
          code: 'COMP 201',
          name: 'Data Structures & Algorithms',
          instructor: 'Prof. Alan Turing',
          department: 'School of Science',
        };
        setCourse(mockCourse);

        // Get real attendance records for this student across sessions
        // This is simplified - in real app, query sessions by course and student
        const history = [
          { id: 1, title: 'Lecture 12: Trees & Graphs', date: 'Oct 24, 2023 • 10:00 AM', status: 'Present', color: 'bg-[#D1FAE5] text-[#065F46]' },
          { id: 2, title: 'Lecture 11: Hash Tables', date: 'Oct 22, 2023 • 10:00 AM', status: 'Late', color: 'bg-[#FEF3C7] text-[#92400E]' },
          { id: 3, title: 'Lecture 10: Sorting Algorithms', date: 'Oct 17, 2023 • 10:00 AM', status: 'Absent', color: 'bg-[#FEE2E2] text-[#991B1B]' },
          { id: 4, title: 'Lecture 9: Big O Notation', date: 'Oct 15, 2023 • 10:00 AM', status: 'Present', color: 'bg-[#D1FAE5] text-[#065F46]' },
          { id: 5, title: 'Lecture 8: Arrays & Linked Lists', date: 'Oct 10, 2023 • 10:00 AM', status: 'Present', color: 'bg-[#D1FAE5] text-[#065F46]' },
          { id: 6, title: 'Lecture 7: Introduction', date: 'Oct 8, 2023 • 10:00 AM', status: 'Present', color: 'bg-[#D1FAE5] text-[#065F46]' },
        ];
        setAttendanceHistory(history);

        const present = history.filter((h: any) => h.status === 'Present').length;
        const late = history.filter((h: any) => h.status === 'Late').length;
        const absent = history.filter((h: any) => h.status === 'Absent').length;
        const total = history.length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
        setStats({ present, late, absent, total, rate });

      } catch (e) {
        console.error('Failed to load course details:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid, courseId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-gutter py-lg flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-gutter py-lg space-y-lg animate-in fade-in duration-500">

      {/* Back Button */}
      <button 
        onClick={() => navigate('/student/courses')}
        className="flex items-center gap-2 text-primary hover:text-primary-container transition-colors font-label-md mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Courses
      </button>

      {/* Course Header */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-surface-variant">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-md">
          <div>
            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md mb-2">{course?.code || 'COMP 201'}</span>
            <h2 className="font-headline-lg text-primary mb-1">{course?.name || 'Data Structures & Algorithms'}</h2>
            <p className="font-body-md text-on-surface-variant flex items-center gap-2">
              <User className="w-4 h-4" /> {course?.instructor || 'Prof. Alan Turing'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/student/checkin')}
            className="w-full md:w-auto bg-primary-container text-on-primary-container font-label-md py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container/90 transition-colors active:scale-95 shadow-md"
          >
            <QrCode className="w-5 h-5" />
            Scan for this Class
          </button>
        </div>
      </section>

      {/* Quick Stats Bento */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-md">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-md border border-surface-variant col-span-2 md:col-span-1 flex flex-col justify-between">
          <h3 className="font-label-md text-on-surface-variant mb-2">Overall Attendance</h3>
          <div className="flex items-end gap-2">
            <span className="font-display-lg text-tertiary-container leading-none">{stats.rate}%</span>
            <span className="font-body-sm text-on-surface-variant mb-1">{stats.rate >= 75 ? 'Good' : 'At Risk'}</span>
          </div>
          <div className="w-full bg-surface-variant h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-tertiary-fixed-dim h-full rounded-full" style={{ width: `${stats.rate}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-md border border-surface-variant flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-label-md text-on-surface-variant">Present</h3>
            <CheckCircle className="w-5 h-5 text-tertiary-container" />
          </div>
          <span className="font-headline-lg text-primary">{stats.present}</span>
          <span className="font-body-sm text-outline">Sessions</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-md border border-surface-variant flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-label-md text-on-surface-variant">Late</h3>
            <Clock className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <span className="font-headline-lg text-primary">{stats.late}</span>
          <span className="font-body-sm text-outline">Sessions</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-md border border-surface-variant flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-label-md text-on-surface-variant">Absent</h3>
            <XCircle className="w-5 h-5 text-error" />
          </div>
          <span className="font-headline-lg text-primary">{stats.absent}</span>
          <span className="font-body-sm text-outline">Sessions</span>
        </div>
      </section>

      {/* History */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
        <div className="p-md border-b border-surface-variant bg-surface-container-low flex justify-between items-center">
          <h3 className="font-title-lg text-primary">Attendance History</h3>
          <button className="text-primary font-label-md hover:underline">View All</button>
        </div>
        <div className="divide-y divide-surface-variant">
          {attendanceHistory.map((item) => (
            <div key={item.id} className="p-md flex items-center justify-between hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-outline">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-body-md text-primary font-medium">{item.title}</p>
                  <p className="font-body-sm text-on-surface-variant">{item.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full font-label-md ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
