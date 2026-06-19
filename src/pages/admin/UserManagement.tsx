import React from 'react';
import { Upload, Download, Search, ChevronDown, MoreVertical, Lock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function UserManagement() {
  return (
    <div className="flex-1 flex flex-col relative z-10 overflow-y-auto px-margin-mobile md:px-gutter py-md md:py-lg max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-on-surface">User Management</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Configure and manage accounts for the entire institution.</p>
        </div>
        <div className="flex gap-base">
          <button className="flex items-center gap-xs px-md py-base h-10 md:h-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all font-body-sm shadow-sm">
             <Upload className="w-4 h-4" />
             <span>Bulk Import</span>
          </button>
          <button className="flex items-center gap-xs px-md py-base h-10 md:h-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-variant transition-all font-body-sm shadow-sm">
             <Download className="w-4 h-4" />
             <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-md mb-lg bg-surface-container-lowest/50 p-base rounded-xl border border-outline-variant/30 shadow-sm glass-card">
        <div className="flex border-b border-outline-variant/30 px-base overflow-x-auto hide-scrollbar">
           <button className="px-md py-md text-primary font-bold border-b-2 border-primary transition-all whitespace-nowrap">Students</button>
           <button className="px-md py-md text-on-surface-variant hover:text-primary transition-all whitespace-nowrap">Lecturers</button>
           <button className="px-md py-md text-on-surface-variant hover:text-primary transition-all whitespace-nowrap">Administrators</button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-base px-base pb-base pt-2">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
             <input type="text" placeholder="Search by name, ID, or email..." className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-body-md transition-all outline-none" />
           </div>
           <div className="flex gap-base">
              <div className="relative min-w-[160px]">
                 <select className="w-full pl-3 pr-8 py-3 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-body-md appearance-none outline-none">
                    <option>School of Science</option>
                    <option>School of Business</option>
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" />
              </div>
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-xl">
         
         {/* User Card */}
         <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-lg hover:-translate-y-1 transition-all group">
            <div className="flex items-start justify-between mb-md">
               <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_4jK6n0HFtv_ROVpDxmNUoDtbPnH4tBk3Jpi1qyX2mMV6Za6fO5rOmCgR6cbkhEx6HtZnKKfJFGjl-z0Flz9tdGvLMTdWaGnojqM-ihlQZSdTXezD8_B7aSPnP34D_ikEGDuXgg_vXtE-7vU4XzsHz8Ba249mNmdRqvpLjV0Mf-5DfHIJZga7wv6nU87_j0p6kZF3OHC3ESI3fiYyzp2Pm8Qi5m_CEGmpPM7BPfGcXNCxDc63ZY2ZO2SbKOwP-RZmkoJ2t_UYkmQa" alt="Student" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-title-lg text-on-surface">Omari Omondi</h3>
                    <p className="text-on-surface-variant text-label-md">ID: KAB/001/2023</p>
                  </div>
               </div>
               <span className="px-2 py-1 rounded bg-tertiary-fixed-dim/20 text-tertiary-container text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
            <div className="space-y-xs mb-lg">
               <div className="flex justify-between text-body-sm">
                 <span className="text-on-surface-variant">School</span>
                 <span className="text-on-surface font-semibold">Science</span>
               </div>
               <div className="flex justify-between text-body-sm">
                 <span className="text-on-surface-variant">Attendance</span>
                 <span className="text-tertiary-container font-semibold">92%</span>
               </div>
            </div>
            <div className="flex gap-base border-t border-outline-variant/10 pt-md">
               <button className="flex-1 py-2 text-primary bg-primary-fixed rounded-lg text-body-sm font-bold hover:bg-primary-container hover:text-on-primary-container transition-all">View Profile</button>
               <button className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg bg-surface-variant/30">
                  <Lock className="w-5 h-5" />
               </button>
               <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg bg-surface-variant/30">
                  <MoreVertical className="w-5 h-5" />
               </button>
            </div>
         </div>

         <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-lg hover:-translate-y-1 transition-all group">
            <div className="flex items-start justify-between mb-md">
               <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGKXgbk25U6nnYbN2mfgYkR8RhV6_jL9Wcqkk0gFwdQso32-5_xlMO7bsohv14l7QCX7YjlXNwm0L8zoE2sGRW1UJOzBoankZTzCxYVGW-FpcqrZiWgxvqqR10MgbFif5UBSqGhHHy9Xn_5PF342TjEQvNrP25Xj5-yVVs6LOgFLxPuLQQxYlYNOAzVcsdJxeijGxdFkzqSbTfkbNosNlQ9iwjGDF93w-W_A8wklInXiK9u2GmNmR929OTkq8s8fDMT9BQEjpT1SuR" alt="Student" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-title-lg text-on-surface">Zahra Amina</h3>
                    <p className="text-on-surface-variant text-label-md">ID: KAB/214/2023</p>
                  </div>
               </div>
               <span className="px-2 py-1 rounded bg-error-container text-error text-[10px] font-bold uppercase tracking-wider">Deactive</span>
            </div>
            <div className="space-y-xs mb-lg">
               <div className="flex justify-between text-body-sm">
                 <span className="text-on-surface-variant">School</span>
                 <span className="text-on-surface font-semibold">Business</span>
               </div>
               <div className="flex justify-between text-body-sm">
                 <span className="text-on-surface-variant">Attendance</span>
                 <span className="text-error font-semibold">64%</span>
               </div>
            </div>
            <div className="flex gap-base border-t border-outline-variant/10 pt-md">
               <button className="flex-1 py-2 text-primary bg-primary-fixed rounded-lg text-body-sm font-bold hover:bg-primary-container hover:text-on-primary-container transition-all">View Profile</button>
               <button className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg bg-surface-variant/30">
                  <Lock className="w-5 h-5" />
               </button>
               <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg bg-surface-variant/30">
                  <MoreVertical className="w-5 h-5" />
               </button>
            </div>
         </div>

      </div>

      <button className="fixed bottom-24 right-8 md:bottom-12 md:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40">
         <Plus className="w-8 h-8" />
      </button>

    </div>
  );
}
