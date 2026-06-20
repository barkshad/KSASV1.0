import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, CheckCircle, TrendingDown, Eye, Mail, Stethoscope, Users } from 'lucide-react';
import { getAtRiskStudents, getAllCourses } from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';

export default function RiskMonitor() {
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 });
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const allCourses = await getAllCourses();
      setCourses(allCourses);

      if (allCourses.length > 0) {
        const firstCourse = allCourses[0];
        setSelectedCourse(firstCourse.id);
        await loadRiskData(firstCourse.id);
      }
    } catch (e) {
      console.error('Failed to load risk data:', e);
    }
  }

  async function loadRiskData(courseId: string) {
    setLoading(true);
    try {
      const atRisk = await getAtRiskStudents(courseId, 75);
      setAtRiskStudents(atRisk);

      const high = atRisk.filter((s: any) => s.attendanceRate < 50).length;
      const medium = atRisk.filter((s: any) => s.attendanceRate >= 50 && s.attendanceRate < 75).length;
      const low = atRisk.filter((s: any) => s.attendanceRate >= 75).length;
      setStats({ high, medium, low });
    } catch (e) {
      console.error('Failed to load at-risk students:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    loadRiskData(courseId);
  };

  const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name || 'All Courses';

  return (
    <div className="p-md md:p-lg max-w-7xl mx-auto w-full animate-in fade-in duration-500">

      {/* Summary Alert Widget */}
      <div className="mb-lg relative overflow-hidden bg-error-container rounded-xl p-6 shadow-sm border border-error/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="text-error w-6 h-6 fill-current" />
            <h2 className="font-title-lg text-on-error-container">Action Required</h2>
          </div>
          <p className="font-body-md text-on-error-container/80">
            <span className="font-bold">{atRiskStudents.length} Students</span> currently fall below the required attendance threshold. Their academic performance is at critical risk.
          </p>
        </div>
        <button className="relative z-10 px-6 py-2 bg-error text-on-error rounded-full font-label-md flex items-center gap-2 hover:bg-error/90 transition-all active:scale-95">
          Batch Intervene
        </button>
      </div>

      {/* Course Selector */}
      <div className="mb-lg">
        <select
          value={selectedCourse}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 outline-none"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
          ))}
        </select>
      </div>

      {/* Categorization Chips */}
      <div className="flex flex-wrap gap-4 mb-lg">
        <button className="px-6 py-2 rounded-full border border-error bg-error/5 text-error font-bold flex items-center gap-2">
          High Risk (&lt;50%)
          <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full">{stats.high}</span>
        </button>
        <button className="px-6 py-2 rounded-full border border-amber-600 bg-amber-50 text-amber-700 font-bold flex items-center gap-2">
          Medium Risk (50-75%)
          <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.medium}</span>
        </button>
        <button className="px-6 py-2 rounded-full border border-tertiary-fixed-dim bg-tertiary/5 text-on-tertiary-fixed-variant font-bold flex items-center gap-2">
          Low Risk (&gt;75%)
          <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] px-2 py-0.5 rounded-full">{stats.low}</span>
        </button>
      </div>

      {/* At-Risk Student List */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-label-md text-outline">STUDENT</th>
                <th className="px-6 py-4 font-label-md text-outline">REG NUMBER</th>
                <th className="px-6 py-4 font-label-md text-outline">ATTENDANCE</th>
                <th className="px-6 py-4 font-label-md text-outline">TREND</th>
                <th className="px-6 py-4 font-label-md text-outline text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : atRiskStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <CheckCircle className="w-12 h-12 text-tertiary-container mx-auto mb-4" />
                    <p className="font-body-lg">All students are above the risk threshold!</p>
                  </td>
                </tr>
              ) : (
                atRiskStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0 flex items-center justify-center text-primary font-bold">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-title-lg text-body-md font-bold text-on-surface">{student.name}</p>
                          <p className="text-xs text-outline">{selectedCourseName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-body-sm">{student.studentNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-32">
                        <span className={`text-xs font-bold ${
                          student.attendanceRate < 50 ? 'text-error' : 
                          student.attendanceRate < 75 ? 'text-amber-600' : 'text-tertiary-container'
                        }`}>
                          {student.attendanceRate}%
                        </span>
                        <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              student.attendanceRate < 50 ? 'bg-error' : 
                              student.attendanceRate < 75 ? 'bg-amber-500' : 'bg-tertiary-container'
                            }`} 
                            style={{ width: `${student.attendanceRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-error">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-bold">At Risk</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye className="w-5 h-5"/></button>
                        <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Mail className="w-5 h-5"/></button>
                        <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"><Stethoscope className="w-5 h-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || '??';
}
