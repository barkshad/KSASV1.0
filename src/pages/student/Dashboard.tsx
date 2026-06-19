import React from 'react';
import { Book, AlertTriangle, Clock, MapPin, CheckCircle, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-gutter py-8 animate-in fade-in duration-500">
      
      {/* Greeting Section */}
      <section className="mb-xl">
        <h1 className="font-headline-lg text-on-background mb-xs">Good morning, Kabarak User</h1>
        <p className="font-body-lg text-on-surface-variant">Ready for your classes today?</p>
      </section>

      {/* Quick Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        
        {/* Overall Attendance */}
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <h2 className="font-title-lg text-on-surface mb-xs">Overall Attendance</h2>
            <p className="font-body-sm text-on-surface-variant">Fall Semester 2023</p>
          </div>
          <div className="relative h-20 w-20 flex items-center justify-center">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-variant"></circle>
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226.2" strokeDashoffset="33.9" className="text-tertiary-fixed-dim" strokeLinecap="round"></circle>
            </svg>
            <span className="absolute font-title-lg font-bold text-on-surface">85%</span>
          </div>
        </div>

        {/* Classes Today */}
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col justify-center hover:shadow-md transition-shadow">
          <div className="flex items-center gap-sm mb-xs">
            <div className="p-2 bg-primary-fixed rounded-lg text-on-primary-fixed">
              <Book className="w-5 h-5" />
            </div>
            <h2 className="font-title-lg text-on-surface">Classes Today</h2>
          </div>
          <div className="flex items-end gap-sm mt-auto">
            <span className="font-display-lg text-primary leading-none">3</span>
            <span className="font-body-md text-on-surface-variant mb-1">Scheduled</span>
          </div>
        </div>

        {/* Pending Check-ins */}
        <div className="bg-error-container/30 rounded-xl p-lg shadow-sm border border-error-container flex flex-col justify-center hover:shadow-md transition-shadow">
          <div className="flex items-center gap-sm mb-xs">
            <div className="p-2 bg-error rounded-lg text-on-error">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="font-title-lg text-on-surface">Action Required</h2>
          </div>
          <div className="flex items-end gap-sm mt-auto">
            <span className="font-display-lg text-error leading-none">1</span>
            <span className="font-body-md text-error mb-1">Pending Check-in</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        
        {/* Left Column: Upcoming Class */}
        <div className="lg:col-span-8">
          <h3 className="font-title-lg text-on-background mb-md">Upcoming Class</h3>
          <div className="bg-primary rounded-xl p-lg md:p-xl shadow-lg relative overflow-hidden text-on-primary">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
              <div>
                <div className="flex items-center gap-xs mb-sm">
                  <Clock className="w-4 h-4 text-tertiary-fixed-dim" />
                  <span className="font-label-md uppercase tracking-wider text-primary-fixed-dim">In 15 mins • 10:00 AM - 11:30 AM</span>
                </div>
                <h4 className="font-headline-md text-on-primary mb-xs">Introduction to Computer Science</h4>
                <p className="font-body-lg text-primary-fixed-dim mb-md">CS101 • Dr. Alan Turing</p>
                <div className="flex items-center gap-sm">
                  <MapPin className="w-5 h-5 text-primary-fixed-dim" />
                  <span className="font-body-md text-on-primary">Science Block, Room 302</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/student/checkin')}
                className="w-full md:w-auto mt-sm md:mt-0 bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-sm active:scale-95 group"
              >
                <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Check-in Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-title-lg text-on-background">Recent Activity</h3>
            <button className="font-label-md text-primary hover:underline">View All</button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <ul className="divide-y divide-outline-variant/30">
              <li className="p-md hover:bg-surface-container-low transition-colors flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className="h-10 w-10 rounded-full bg-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary-container shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Data Structures</p>
                    <p className="font-body-sm text-on-surface-variant">Yesterday, 2:00 PM</p>
                  </div>
                </div>
                <span className="font-label-md px-2 py-1 bg-tertiary-fixed-dim/20 text-on-tertiary-container rounded-full">Present</span>
              </li>
              <li className="p-md hover:bg-surface-container-low transition-colors flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className="h-10 w-10 rounded-full bg-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary-container shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Calculus I</p>
                    <p className="font-body-sm text-on-surface-variant">Oct 12, 10:00 AM</p>
                  </div>
                </div>
                <span className="font-label-md px-2 py-1 bg-tertiary-fixed-dim/20 text-on-tertiary-container rounded-full">Present</span>
              </li>
              <li className="p-md hover:bg-surface-container-low transition-colors flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className="h-10 w-10 rounded-full bg-error-container/50 flex items-center justify-center text-error shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Physics 101</p>
                    <p className="font-body-sm text-on-surface-variant">Oct 10, 8:00 AM</p>
                  </div>
                </div>
                <span className="font-label-md px-2 py-1 bg-error-container text-on-error-container rounded-full">Late</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
