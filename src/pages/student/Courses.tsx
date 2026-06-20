import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, User, ArrowRight, BookOpen } from 'lucide-react';
import { getCurrentUser } from '../../lib/auth';
import { getEnrollmentsByStudent, getAllCourses, getUserById } from '../../lib/db';

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    async function loadCourses() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const enrollments = await getEnrollmentsByStudent(user.uid);
        const allCourses = await getAllCourses();

        const enrolledCourses = await Promise.all(
          enrollments.map(async (enrollment: any) => {
            const course = allCourses.find((c: any) => c.id === enrollment.courseId);
            if (!course) return null;

            const lecturer = course.lecturerId ? await getUserById(course.lecturerId) : null;

            // Calculate attendance rate (mock for now - would need session data)
            const attendanceRate = Math.floor(Math.random() * 30) + 70; // 70-100%

            return {
              ...course,
              lecturerName: lecturer?.name || 'TBD',
              attendanceRate,
              status: attendanceRate < 75 ? 'critical' : 'good',
            };
          })
        );

        setCourses(enrolledCourses.filter(Boolean));
      } catch (e) {
        console.error('Failed to load courses:', e);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [user?.uid]);

  const filteredCourses = courses.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-gutter py-8 animate-in fade-in duration-500">

      <div className="mb-lg">
        <h1 className="font-headline-lg text-primary mb-sm">My Courses</h1>
        <p className="font-body-md text-on-surface-variant">Manage and track your academic progress.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-sm mb-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search courses by name or code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md"
          />
        </div>
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <select className="w-full pl-10 pr-8 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md cursor-pointer">
            <option>Current Semester</option>
            <option>Previous Semester</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-outline-variant mx-auto mb-4" />
          <p className="font-body-lg text-on-surface-variant">No enrolled courses found</p>
          <p className="font-body-sm text-on-surface-variant mt-2">Contact your admin to enroll in courses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-md md:gap-lg">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0px_12px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 p-lg flex flex-col border border-outline-variant/20">
              <div className="flex justify-between items-start mb-sm">
                <div>
                  <span className={`inline-block px-2 py-1 rounded ${course.status === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'} font-label-md mb-xs`}>
                    {course.code}
                  </span>
                  <h3 className="font-title-lg font-semibold text-on-background line-clamp-2">{course.name}</h3>
                </div>
              </div>

              <p className="font-body-md text-on-surface-variant mb-md flex items-center">
                <User className="w-4 h-4 mr-2 text-outline" />
                {course.lecturerName}
              </p>

              <div className="mt-auto pt-md border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center space-x-sm">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-surface-variant"></circle>
                      <circle 
                        cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray="125.6" 
                        strokeDashoffset={125.6 - (125.6 * course.attendanceRate) / 100} 
                        strokeLinecap="round" 
                        className={course.status === 'critical' ? 'text-error' : course.attendanceRate > 80 ? 'text-tertiary-fixed-dim' : 'text-tertiary-container'}
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`font-label-md font-bold ${course.status === 'critical' ? 'text-error' : course.attendanceRate > 80 ? 'text-tertiary-fixed-dim' : 'text-tertiary-container'}`}>
                        {course.attendanceRate}%
                      </span>
                    </div>
                  </div>
                  <span className="font-body-sm text-on-surface-variant">Attendance</span>
                </div>
                <button 
                  onClick={() => navigate('/student/course-details', { state: { courseId: course.id } })}
                  className="px-4 py-2 rounded-lg bg-surface-container text-primary font-label-md hover:bg-surface-variant transition-colors flex items-center gap-1 active:scale-95"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
