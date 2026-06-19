import React from 'react';
import { LogOut, Moon, Bell, Globe, HelpCircle, AlertOctagon, Edit2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-gutter py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        
        {/* Profile Header Card */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col items-center text-center">
            
            <div className="relative mb-4">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnnWjRPBZJM0vLiwd9_YEC7HpdYRf3A3xLVc9JvdZ3PC_b4IgypROLKRY3G_fkMnuXY9s5-xdE2VeASdlf4c_W3SRbGZV5mBgtUxl7B6exydPJfZCVL1nPKrb4ayxWoNDXrHBgp8WnPlMYGDSpcKisA6rYhBg3g_PxzPe0PFxA7_R8gqK3ThKzMnnQG3w15dQ8JJA_TmDtFIkwMnT98ETLArC4XJHwROBl15LLWrdNIG5S9FFpaOVBJBPp8L-kQWeBUIUNeDAofOu1" 
                alt="Student Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-md" 
              />
              <button className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container rounded-full p-2 shadow-sm hover:scale-105 transition-transform">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="font-headline-lg text-on-surface mb-1">Jane Doe</h2>
            <p className="font-body-lg text-on-surface-variant mb-4">BSc. Computer Science</p>
            
            <div className="w-full bg-surface-container-low rounded-lg p-4 flex flex-col gap-2 text-left">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="font-label-md text-outline">STUDENT ID</span>
                <span className="font-body-md font-semibold text-on-surface">KAB/001/2023</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="font-label-md text-outline">YEAR</span>
                <span className="font-body-md font-semibold text-on-surface">Year 2, Sem 1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-outline">STATUS</span>
                <span className="px-2 py-1 bg-tertiary-fixed-dim/20 text-tertiary-container rounded-full font-label-md">Active</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-gutter">
          
          <section>
            <h3 className="font-title-lg text-on-surface mb-4">Academic Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-2">
                  <p className="font-label-md text-primary">TOTAL COURSES</p>
                  <p className="font-display-lg text-on-surface leading-none">8</p>
               </div>
               <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-2">
                  <p className="font-label-md text-tertiary-container">CREDITS EARNED</p>
                  <p className="font-display-lg text-on-surface leading-none">42</p>
               </div>
               <div className="col-span-2 md:col-span-1 bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                  <p className="font-label-md text-secondary">ATTENDANCE</p>
                  <div>
                    <p className="font-display-lg text-on-surface leading-none mb-1">92<span className="text-2xl text-on-surface-variant">%</span></p>
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary-container w-[92%] rounded-full"></div>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
             <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/50">
               <h3 className="font-title-lg text-on-surface">Settings & Preferences</h3>
             </div>
             <div className="divide-y divide-outline-variant/20">
                <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body-lg text-on-surface font-medium">Dark Theme</p>
                      <p className="font-body-sm text-on-surface-variant">Adjust appearance</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body-lg text-on-surface font-medium">Notifications</p>
                      <p className="font-body-sm text-on-surface-variant">Push and email alerts</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary-container/50 text-on-secondary-container rounded-lg">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-body-lg text-on-surface font-medium">Language</p>
                      <p className="font-body-sm text-on-surface-variant">English (UK)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                </div>
             </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
             <button className="flex items-center justify-center gap-2 p-4 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface rounded-xl transition-colors border border-outline-variant/30">
               <HelpCircle className="w-5 h-5" />
               <span className="font-body-md font-medium">FAQ & Guides</span>
             </button>
             <button className="flex items-center justify-center gap-2 p-4 bg-error-container/20 hover:bg-error-container/40 text-error rounded-xl transition-colors border border-error/20">
               <AlertOctagon className="w-5 h-5" />
               <span className="font-body-md font-medium">Report an Issue</span>
             </button>
          </section>

          <div className="mt-8 mb-4">
             <button 
                onClick={() => navigate('/')}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-surface text-error rounded-lg hover:bg-error-container transition-colors border border-outline-variant/30 mx-auto shadow-sm"
             >
               <LogOut className="w-5 h-5" />
               <span className="font-body-md font-semibold">Sign Out</span>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
