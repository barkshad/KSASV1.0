import React from 'react';
import { RefreshCcw, Settings, Download, Search, CheckCircle, Users, CheckSquare } from 'lucide-react';

export default function LiveSession() {
  return (
    <div className="max-w-7xl mx-auto p-md md:p-xl space-y-lg animate-in fade-in duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        
        {/* Main Control Center */}
        <div className="lg:col-span-8 space-y-lg">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider">Current Lecture</p>
                <h2 className="font-headline-lg text-primary mt-1">Introduction to Computer Science</h2>
                <div className="flex space-x-md mt-base text-on-surface-variant font-body-sm">
                  <span>Room 402, Science Block</span>
                  <span>10:00 AM - 12:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-tertiary-fixed-dim">
              <p className="text-on-surface-variant font-label-md">Present</p>
              <p className="text-display-lg text-primary">42</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-error">
              <p className="text-on-surface-variant font-label-md">Absent</p>
              <p className="text-display-lg text-error">08</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-secondary-fixed-dim">
              <p className="text-on-surface-variant font-label-md">Late</p>
              <p className="text-display-lg text-secondary">03</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border-l-4 border-primary-container">
              <p className="text-on-surface-variant font-label-md">Total Enrollment</p>
              <p className="text-display-lg text-primary">53</p>
            </div>
          </div>

          {/* Student Feed */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-title-lg text-primary flex items-center gap-2">
                <Users className="w-5 h-5" /> Recent Check-ins
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-f87CWIc3XYiLuh0k0vIhoWd9dNAzclWbB5AGxxGUcWmBcbOt-2m_MmmZ1wucQvU_iSoP_4BnFKNiuhLu6hNJ-F1rU8wnHE5JVKsoWPL0GE_dy9PkO8X-Ox2B_MnchP539Jh5Pja_01hUVplBdj2ATbYajKXpd8KICSU_1oYAPYbn9qOSLDHzh3hVP6zpFgE2atz0WR7BkWk5Te3u3-qamkHHfK3Rm9mu9NtQhurcRUcr2tru1v4Pn67uXGoKBSGuHzESM52CPb3v" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-body-md font-bold text-on-surface">Sarah Mitchell</p>
                    <p className="font-body-sm text-on-surface-variant">Verified Device</p>
                  </div>
                </div>
                <span className="font-label-md bg-tertiary-container/20 text-on-tertiary-container px-3 py-1 rounded-full">10:14 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Command Area */}
        <div className="lg:col-span-4 space-y-lg">
          <div className="bg-primary-container p-lg rounded-2xl shadow-xl sticky top-20">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-on-primary-container font-title-lg text-title-lg">Attendance QR</h3>
              <div className="bg-secondary-container px-sm py-xs rounded-full flex items-center gap-1">
                 <div className="w-3 h-3 border-2 border-on-secondary-container border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-on-secondary-container font-label-md text-label-md">12s</span>
              </div>
            </div>
            
            <div className="relative bg-white p-lg rounded-xl aspect-square flex items-center justify-center overflow-hidden border-4 border-on-primary-container/20">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8lrle2NgKHjQ7qHXf3IJTySWQcr_VGmBZZ8mOJK7YX0zkWlVk8psSh_csNO1xpHr3_FFes81e0TsigwEYTExc3h_YREXm5CcfhgtRXlSF3BPZ_maXAcCMwl6vzpNyVz_JjEWLcl9jyxLV890x4t6crxT1xb30q5S5KzNRVL9w1a-tZsegloYmc0PRZ3_5MzthyP8tJaCYPBmnJOthkdrm4fxofxnFreZtM4M2zQIRZKAPZaqPLNKHWSgoRR6QtuGwJnhL94vJs7Ji" alt="QR Code" className="w-full h-full object-contain relative z-10" />
            </div>

            <div className="mt-lg space-y-md">
              <p className="font-body-sm text-on-primary-container/80 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Dynamic Rotation Active
              </p>
              <button className="w-full py-md bg-on-primary-container text-primary font-bold rounded-xl hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-sm">
                 <Download className="w-5 h-5" /> Export Current List
              </button>
              <button className="w-full py-md border border-on-primary-container/30 text-on-primary-container font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-sm">
                 <Settings className="w-5 h-5" /> Session Settings
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
