import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Code, Database, Shield, Users, TrendingUp, ArrowRight, Play, PlusCircle, BookOpen, MapPin, Clock } from 'lucide-react';
import { getAllCourses, getEnrollmentsByCourse, createCourse, getUsersByRole } from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';

export default function CourseManagement() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const user = getCurrentUser();

  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    department: '',
    lecturerId: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allCourses, allLecturers] = await Promise.all([
        getAllCourses(),
        getUsersByRole('lecturer'),
      ]);

      // Enrich courses with enrollment counts
      const enriched = await Promise.all(
        allCourses.map(async (course: any) => {
          const enrollments = await getEnrollmentsByCourse(course.id);
          const lecturer = allLecturers.find((l: any) => l.id === course.lecturerId);
          return {
            ...course,
            enrollmentCount: enrollments.length,
            lecturerName: lecturer?.name || 'Unassigned',
            lecturerAvatar: lecturer?.avatar,
          };
        })
      );

      setCourses(enriched);
      setLecturers(allLecturers);
    } catch (e) {
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse({
        ...newCourse,
        createdBy: user?.uid,
      });
      showToast('Course created successfully', 'success');
      setShowAddModal(false);
      setNewCourse({ code: '', name: '', department: '', lecturerId: '', description: '' });
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to create course', 'error');
    }
  };

  const handleStartSession = (course: any) => {
    navigate('/lecturer/live', {
      state: {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        room: course.room || 'Room 104',
        enrolledCount: course.enrollmentCount,
      }
    });
  };

  const filteredCourses = courses.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myCourses = user?.role === 'lecturer'
    ? filteredCourses.filter((c: any) => c.lecturerId === user.uid)
    : filteredCourses;

  const totalStudents = myCourses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0);
  const avgAttendance = myCourses.length > 0
    ? Math.round(myCourses.reduce((sum: number, c: any) => sum + (c.attendanceRate || 88), 0) / myCourses.length)
    : 92;

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-lg py-lg animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'
        }`}>
          <span className="font-body-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header & Filters Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div className="space-y-1">
          <h2 className="font-headline-lg text-primary">Course Management</h2>
          <p className="font-body-md text-on-surface-variant">Manage your active lecture sessions and track student engagement.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-base">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all outline-none"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary-container text-on-secondary-fixed-variant font-bold rounded-xl hover:bg-secondary-fixed transition-colors active:scale-95">
             <Filter className="w-4 h-4" />
             <span className="font-label-md">Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

        {/* Primary Course Card */}
        <div className="lg:col-span-8 group">
           <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 hover:shadow-md transition-all h-full relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4">
                 <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-xs uppercase tracking-widest">Next Session: 14:00</span>
              </div>
              <div>
                 <div className="flex items-center gap-sm mb-md">
                    <div className="w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center">
                       <Code className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-title-lg text-primary">COMP 201</h3>
                      <p className="font-body-sm text-on-surface-variant">Data Structures & Algorithms</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-lg my-lg">
                    <div className="space-y-1">
                      <p className="font-label-md text-outline-variant uppercase">Enrollment</p>
                      <p className="font-headline-md text-primary">{totalStudents} <span className="text-xs font-normal text-on-surface-variant">Students</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-label-md text-outline-variant uppercase">Compliance</p>
                      <p className="font-headline-md text-on-tertiary-container">{avgAttendance}%</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-2 pt-2">
                       <p className="font-label-md text-on-surface-variant">Attendance Target</p>
                       <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                         <div className="bg-tertiary-container h-full rounded-full" style={{ width: `${avgAttendance}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-md mt-md">
                 <button 
                   onClick={() => handleStartSession({ id: 'comp201', name: 'Data Structures & Algorithms', code: 'COMP 201', room: 'Room 104', enrollmentCount: totalStudents })}
                   className="w-full sm:w-auto bg-primary text-on-primary px-lg py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20"
                 >
                   <Play className="w-5 h-5 fill-current" />
                   <span>Start Session</span>
                 </button>
                 <button className="w-full sm:w-auto px-lg py-3 border border-outline-variant text-primary font-bold rounded-xl hover:bg-surface-variant/30 transition-all active:scale-95">
                   View Details
                 </button>
              </div>
           </div>
        </div>

        {/* Mini Stat / Action Card */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
           <div className="bg-primary-container text-on-primary-container rounded-xl p-lg shadow-lg flex flex-col justify-between">
              <h4 className="font-title-lg mb-2">Today's Overview</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-on-primary-container/20 pb-2">
                   <span className="font-body-md">Scheduled Lectures</span>
                   <span className="font-headline-md">{myCourses.length}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-on-primary-container/20 pb-2">
                   <span className="font-body-md">Total Students</span>
                   <span className="font-headline-md">{totalStudents}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-body-md">Avg. Attendance</span>
                   <span className="font-headline-md">{avgAttendance}%</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-surface-container-lowest rounded-xl p-lg flex-1 flex flex-col justify-center items-center text-center gap-md border-dashed border-2 border-outline-variant hover:border-primary hover:bg-surface-container transition-all cursor-pointer"
           >
              <PlusCircle className="w-10 h-10 text-outline-variant" />
              <div>
                <h5 className="font-title-lg text-primary">Assign New Course</h5>
                <p className="text-on-surface-variant text-sm px-4">Request access from administration.</p>
              </div>
           </button>
        </div>

        {/* List of Courses */}
        <div className="lg:col-span-12 mt-md">
           <h3 className="font-title-lg text-primary mb-md">All Assigned Courses</h3>
           {loading ? (
             <div className="flex items-center justify-center py-20">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
           ) : myCourses.length === 0 ? (
             <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
               <BookOpen className="w-12 h-12 text-outline-variant mx-auto mb-4" />
               <p className="text-on-surface-variant font-body-lg">No courses assigned yet</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                {myCourses.map((course) => (
                  <div key={course.id} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-all cursor-pointer shadow-sm">
                     <div className="flex justify-between items-start mb-base">
                        <div className="w-10 h-10 bg-secondary-container text-primary rounded-lg flex items-center justify-center">
                           <Code className="w-5 h-5" />
                        </div>
                        <span className={`font-label-md px-2 py-0.5 rounded text-[10px] ${
                          course.status === 'active' ? 'bg-tertiary-fixed-dim/20 text-tertiary-container' : 'bg-error-container text-error'
                        }`}>
                          {course.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                     </div>
                     <h4 className="font-title-lg text-primary leading-tight">{course.code}</h4>
                     <p className="font-body-sm text-on-surface-variant mb-md">{course.name}</p>
                     <div className="flex items-center gap-2 mb-md text-sm text-on-surface-variant">
                        <MapPin className="w-4 h-4" />
                        <span>{course.room || 'TBD'}</span>
                        <span className="mx-1">&bull;</span>
                        <Clock className="w-4 h-4" />
                        <span>{course.schedule || 'Mon/Wed 10:00 AM'}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm py-2 border-t border-surface-container">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <Users className="w-4 h-4" />
                          <span className="font-body-sm">{course.enrollmentCount} Students</span>
                        </div>
                        <div className="flex items-center gap-1 text-tertiary-container">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-body-sm font-medium">{course.attendanceRate || 88}% Att.</span>
                        </div>
                     </div>
                     <button 
                       onClick={() => handleStartSession(course)}
                       className="w-full mt-md bg-surface-container text-primary font-bold py-2 rounded-lg hover:bg-secondary-container transition-colors"
                     >
                       Start Session
                     </button>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="font-title-lg text-on-surface">Create New Course</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-surface-variant rounded-full">
                <ArrowRight className="w-5 h-5 rotate-45 text-on-surface-variant" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Course Code</label>
                  <input
                    type="text"
                    required
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                    placeholder="CSC 101"
                  />
                </div>
                <div>
                  <label className="font-label-md text-on-surface-variant mb-1 block">Department</label>
                  <input
                    type="text"
                    value={newCourse.department}
                    onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="School of Science"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Course Name</label>
                <input
                  type="text"
                  required
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Introduction to Computer Science"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Assign Lecturer</label>
                <select
                  value={newCourse.lecturerId}
                  onChange={(e) => setNewCourse({...newCourse, lecturerId: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant mb-1 block">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  rows={3}
                  placeholder="Course description..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-outline-variant text-on-surface rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-bold"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
