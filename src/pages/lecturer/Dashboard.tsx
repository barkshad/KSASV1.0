import React from 'react';
import { Radio, StopCircle, QrCode, PlusCircle, AlertCircle, FileBarChart, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LecturerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-gutter py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="font-headline-lg text-on-surface mb-2">Welcome back, Dr. Lecturer</h1>
        <p className="font-body-md text-on-surface-variant">Here is an overview of your sessions and attendance today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        
        {/* Active Session Card */}
        <div className="md:col-span-8 glass-card rounded-xl p-6 border-l-4 border-l-tertiary-fixed-dim relative overflow-hidden bg-white/80">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Radio className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
             <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary-container"></span>
                  </span>
                  <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Active Session Ongoing</span>
                </div>
                <h2 className="font-title-lg text-on-surface mb-1">Introduction to Computer Science (CSC 101)</h2>
                <p className="font-body-md text-on-surface-variant mb-6">Room: Science Lab 3 • Started at 09:00 AM</p>

                <div className="flex items-end space-x-8 mb-8">
                  <div>
                     <span className="font-display-lg text-primary block leading-none">42<span className="font-title-lg text-on-surface-variant">/50</span></span>
                     <span className="font-label-md text-on-surface-variant mt-2 block">STUDENTS CHECKED IN</span>
                  </div>
                  <div className="h-16 flex-1 flex flex-col justify-end">
                     <div className="w-full bg-surface-variant rounded-full h-2.5 overflow-hidden">
                       <div className="bg-tertiary-container h-full rounded-full" style={{ width: '84%' }}></div>
                     </div>
                  </div>
                </div>
             </div>

             <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/lecturer/courses')}
                  className="bg-error text-on-error px-6 py-3 rounded-lg font-body-md font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2 active:scale-95"
                >
                   <StopCircle className="w-5 h-5" />
                   <span>End Session</span>
                </button>
                <button 
                  onClick={() => navigate('/lecturer/live')}
                  className="bg-surface-variant text-on-surface-variant px-6 py-3 rounded-lg font-body-md font-semibold hover:bg-surface-container-high transition-colors flex items-center space-x-2 active:scale-95"
                >
                   <QrCode className="w-5 h-5" />
                   <span>Show QR</span>
                </button>
             </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 flex flex-col bg-white/80">
           <h3 className="font-title-lg text-on-surface mb-6">Quick Actions</h3>
           <div className="grid grid-cols-2 gap-4 flex-1">
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <PlusCircle className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Manual Session</span>
             </button>
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 text-on-secondary-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <AlertCircle className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Notify Absentees</span>
             </button>
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-tertiary-container/20 text-tertiary-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <FileBarChart className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Generate Report</span>
             </button>
             <button className="bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group">
                <div className="w-12 h-12 rounded-full bg-error-container/20 text-on-error-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <Calendar className="w-6 h-6" />
                </div>
                <span className="font-label-md text-on-surface">Manage Schedule</span>
             </button>
           </div>
        </div>

        {/* Upcoming Classes */}
        <div className="md:col-span-6 glass-card rounded-xl p-6 bg-white/80">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-title-lg text-on-surface">Today's Schedule</h3>
             <button className="text-primary font-label-md hover:underline">View All</button>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-lg border border-outline-variant bg-surface hover:bg-surface-variant/50 transition-colors">
                <div className="flex items-center space-x-4">
                   <div className="flex flex-col items-center justify-center bg-surface-container w-16 h-16 rounded-lg text-center">
                     <span className="font-title-lg font-bold text-on-surface leading-none">11</span>
                     <span className="font-label-md text-on-surface-variant">AM</span>
                   </div>
                   <div>
                     <h4 className="font-title-lg text-on-surface text-sm md:text-base">Data Structures (CSC 201)</h4>
                     <p className="font-body-sm text-on-surface-variant flex items-center mt-1">
                       <MapPin className="w-4 h-4 mr-1" /> Room 104
                     </p>
                   </div>
                </div>
                <button className="bg-primary text-on-primary px-4 py-2 rounded-md font-label-md hover:opacity-90 transition-opacity">Start</button>
             </div>
             <div className="flex items-center justify-between p-4 rounded-lg border border-outline-variant bg-surface hover:bg-surface-variant/50 transition-colors">
                <div className="flex items-center space-x-4">
                   <div className="flex flex-col items-center justify-center bg-surface-container w-16 h-16 rounded-lg text-center">
                     <span className="font-title-lg font-bold text-on-surface leading-none">02</span>
                     <span className="font-label-md text-on-surface-variant">PM</span>
                   </div>
                   <div>
                     <h4 className="font-title-lg text-on-surface text-sm md:text-base">Software Eng. (SE 301)</h4>
                     <p className="font-body-sm text-on-surface-variant flex items-center mt-1">
                       <MapPin className="w-4 h-4 mr-1" /> Main Hall
                     </p>
                   </div>
                </div>
                <button className="bg-surface-variant text-on-surface-variant px-4 py-2 rounded-md font-label-md cursor-not-allowed">Start</button>
             </div>
          </div>
        </div>

        {/* Weekly Attendance Trend Faux Chart */}
        <div className="md:col-span-6 glass-card rounded-xl p-6 flex flex-col bg-white/80">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-title-lg text-on-surface">Weekly Attendance Trend</h3>
             <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary-container rounded-full font-label-md">Avg: 88%</span>
          </div>
          <div className="flex-1 flex items-end space-x-2 mt-4 min-h-[150px] relative pt-4">
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '75%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Mon</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '82%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Tue</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '90%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Wed</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '65%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Thu</span>
             </div>
             <div className="flex-1 flex flex-col items-center justify-end h-full">
               <div className="w-full max-w-[40px] bg-primary-container hover:bg-primary rounded-t-md transition-colors" style={{ height: '85%' }}></div>
               <span className="font-label-md text-on-surface-variant mt-2">Fri</span>
             </div>
             <div className="absolute w-full border-b border-outline-variant/30 bottom-[30px] -z-10"></div>
             <div className="absolute w-full border-b border-outline-variant/30 bottom-[50%] -z-10"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
