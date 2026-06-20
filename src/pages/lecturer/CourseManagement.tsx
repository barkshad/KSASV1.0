import React from 'react';
import { Search, Filter, Code, Database, Shield, Users, TrendingUp, ArrowRight, Play, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CourseManagement() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-lg py-lg animate-in fade-in duration-500">
      
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
                      <p className="font-headline-md text-primary">156 <span className="text-xs font-normal text-on-surface-variant">Students</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-label-md text-outline-variant uppercase">Compliance</p>
                      <p className="font-headline-md text-on-tertiary-container">88.4%</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-2 pt-2">
                       <p className="font-label-md text-on-surface-variant">Attendance Target</p>
                       <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                         <div className="bg-tertiary-container h-full rounded-full" style={{ width: '88.4%' }}></div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-md mt-md">
                 <button 
                   onClick={() => navigate('/lecturer/live')}
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
                   <span className="font-headline-md">3</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-on-primary-container/20 pb-2">
                   <span className="font-body-md">Total Students</span>
                   <span className="font-headline-md">412</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-body-md">Avg. Attendance</span>
                   <span className="font-headline-md">92%</span>
                 </div>
              </div>
           </div>
           
           <div className="bg-surface-container-lowest rounded-xl p-lg flex-1 flex flex-col justify-center items-center text-center gap-md border-dashed border-2 border-outline-variant">
              <PlusCircle className="w-10 h-10 text-outline-variant" />
              <div>
                <h5 className="font-title-lg text-primary">Assign New Course</h5>
                <p className="text-on-surface-variant text-sm px-4">Request access from administration.</p>
              </div>
           </div>
        </div>

        {/* List of Courses */}
        <div className="lg:col-span-12 mt-md">
           <h3 className="font-title-lg text-primary mb-md">All Assigned Courses</h3>
           <div className="bg-surface-container rounded-xl p-6 text-center text-on-surface-variant border border-outline-variant/30">
               Course assignments are managed by administration. Currently, you can start Ad-Hoc sessions from your Dashboard.
           </div>
        </div>
      </div>
    </div>
  );
}
