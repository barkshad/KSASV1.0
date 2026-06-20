import React from 'react';
import { Search, Filter, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentCourses() {
  const navigate = useNavigate();

  const courses = [
    {
      code: 'CS101',
      title: 'Intro to Computer Science',
      instructor: 'Dr. Alan Turing',
      attendance: 90,
      color: 'bg-tertiary-fixed-dim',
    },
    {
      code: 'MATH201',
      title: 'Advanced Calculus',
      instructor: 'Prof. Ada Lovelace',
      attendance: 75,
      color: 'bg-tertiary-container',
    },
    {
      code: 'PHY105',
      title: 'Quantum Mechanics',
      instructor: 'Dr. Richard Feynman',
      attendance: 60,
      status: 'critical',
      color: 'bg-error',
    },
    {
      code: 'ENG202',
      title: 'Modern Literature',
      instructor: 'Prof. Virginia Woolf',
      attendance: 100,
      color: 'bg-tertiary-fixed-dim',
    }
  ];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-md md:gap-lg">
        {courses.map((course) => (
          <div key={course.code} className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0px_12px_24px_rgba(0,0,0,0.1)] transition-shadow duration-300 p-lg flex flex-col border border-outline-variant/20">
            <div className="flex justify-between items-start mb-sm">
              <div>
                <span className={`inline-block px-2 py-1 rounded ${course.status === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'} font-label-md mb-xs`}>
                  {course.code}
                </span>
                <h3 className="font-title-lg font-semibold text-on-background line-clamp-2">{course.title}</h3>
              </div>
            </div>
            
            <p className="font-body-md text-on-surface-variant mb-md flex items-center">
              <User className="w-4 h-4 mr-2 text-outline" />
              {course.instructor}
            </p>

            <div className="mt-auto pt-md border-t border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center space-x-sm">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-surface-variant"></circle>
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * course.attendance) / 100} strokeLinecap="round" className={course.color}></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-label-md font-bold ${course.status === 'critical' ? 'text-error' : (course.attendance > 80 ? 'text-tertiary-fixed-dim' : 'text-tertiary-container')}`}>
                      {course.attendance}%
                    </span>
                  </div>
                </div>
                <span className="font-body-sm text-on-surface-variant">Attendance</span>
              </div>
              <button 
                onClick={() => navigate('/student/course-details')}
                className="px-4 py-2 rounded-lg bg-surface-container text-primary font-label-md hover:bg-surface-variant transition-colors flex items-center gap-1 active:scale-95"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
